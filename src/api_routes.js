import {
  match,
  props,
  now,
  fishOut,
  fishOutTypes,
  rawQuery,
  matchAny,
  matches,
  fishOutComplexConds,
  makeLabel,
  matchOne,
  createIfNotExists,
} from "./query.js";
import { subscription } from "./api_subscription.js";
import options from "./options.js";

const brigadeCallForms = subscription("uint", async (brigadeNumber) => {
  return await match(
    "cf:CallForm:Incomplete",
    {},
    {
      where: `cf.callFinishedAt IS NULL AND any(b IN cf.assignedTo WHERE b = ${brigadeNumber.value})`,
      orelse: [],
    },
  );
});

function error(str) {
  return { error: str };
}

async function ensureFilledInBy(reportId, login) {
  if (login === null) return;
  const relation = await matchOne(
    "u:User:Active",
    {},
    {
      link: `[:FILLED_IN]->(r:Report${props({ reportId })})`,
      results: ["u"],
      then: (user) => user.login,
      orelse: () => null,
    },
  );
  if (relation === null)
    await matchOne(
      "u:User:Active",
      { login },
      {
        match: `(r:Report${props({ reportId })})`,
        create: "(u)-[:FILLED_IN]->(r)",
      },
    );
  else if (relation.login !== login.value)
    return error("The report is already created by another user");
}

const api_routes = {
  // 1. All information on user from their login and password
  "login_user/login:string password:password": async ({ login, password }) => {
    return await matchOne(
      "u:User:Active",
      { login },
      {
        orelse: { error: "User does not exist" },
        then: (user) => {
          if (user.passwordHash !== password.value.hash) {
            console.log(
              `Password ${password.value.password} with hash ${password.value.hash} does not match ${user.passwordHash}`,
            );
            return error("Password is incorrect");
          }
          return user;
        },
      },
    );
  },
  // 2. Current call forms on a brigade
  "get_callforms/assignedTo:uint..": async ({ assignedTo }) => {
    return await match(
      "cf:CallForm",
      {},
      {
        where: matchAny("cf.assignedTo", assignedTo),
        orderBy: "cf.createdAt DESC",
      },
    );
  },
  // 3. Reports on a brigade
  "brigade_reports/brigadeNumber:uint": async ({ brigadeNumber }) => {
    const getReports = async (kind) =>
      await match(
        `r:Report:${kind}`,
        {},
        {
          link: `[:ON_CALL]->(cf:CallForm:Complete)-[:CREATED_BY]->(o:User:Operator)`,
          where: matchAny("cf.assignedTo", brigadeNumber),
          optional_match: "(u:User:Brigadier:Active)-[:FILLED_IN]->(r)",
          results: ["u", "o", "r", "cf"],
          orderBy: "cf.createdAt DESC",
          orelse: [],
        },
      );
    return {
      complete_reports: await getReports("Complete"),
      incomplete_reports: await getReports("Incomplete"),
      new_reports: await getReports("New"),
    };
  },
  // 4. Fill in a report
  "fill_report/reportId:id login:string waterSpent:uint foamSpent:uint allegedFireCause damage:uint additionalNotes equipmentDamage":
    async (args) => {
      const login = fishOut(args, ({ k }) => k === "login");
      return (
        (await ensureFilledInBy(args.reportId, login)) ??
        (await matchOne(`r:Report`, fishOutTypes(args, ["id"]), {
          where: "NOT r:Complete",
          remove: { r: ["New"] },
          set: { r: { ...args, label: makeLabel("Complete") } },
          orelse: error("Report not found"),
        }))
      );
    },
  // 5. Create a new callform
  "create_callform/login:string departureAt:datetime? arrivalAt:datetime? callFinishedAt:datetime? callSource? fireAddress? bottomLeft:point? topRight:point? fireType? fireRank:string? victimsCount:uint? assignedTo:uint[]? auto?":
    async (args) => {
      await brigadeCallForms.update();
      const operatorArgs = fishOut(args, ({ k }) => k === "login");
      return await matchOne("o:User:Operator:Active", operatorArgs, {
        create: `(cf:CallForm:Incomplete${props({
          ...args,
          createdAt: now(),
          modifiedAt: now(),
        })})
        CREATE (o)-[:CREATED]->(cf)
        CREATE (cf)-[:CREATED_BY]->(o)`,
        results: ["cf"],
        orelse: error(`Operator ${operatorArgs.login.value} not found`),
      });
    },
  // 6. Find operator's complete callforms
  "operator_callforms/login:string": async (args) => {
    return {
      complete_callforms: await match("u:User:Operator:Active", args, {
        link: "[:CREATED]->(cf:CallForm:Complete)",
        results: ["cf"],
        orderBy: "cf.createdAt DESC",
      }),
      incomplete_callforms: await match("u:User:Operator:Active", args, {
        link: "[:CREATED]->(cf:CallForm:Incomplete)",
        results: ["cf"],
        orderBy: "cf.createdAt DESC",
      }),
    };
  },
  // 7. Spawn user
  "user_spawn/familyName firstName fatherName? role:label brigadeNumber:uint?=0 address phone? email? login:string password:password":
    async (args) => {
      return await createIfNotExists(
        "u:User:Active" + (args.role === "Brigadier" ? ":Fireman" : ""),
        {
          ...args,
          registeredAt: now(),
          modifiedAt: now(),
        },
        {
          orelse: error("User already exists"),
          searchBy: { login: args.login },
        },
      );
    },
  // 8. User search
  "user_search/familyName? firstName? fatherName? role:label? brigadeNumber:uint..? address? phone? email? login? registeredAt:datetime..? modifiedAt:datetime..?":
    async (args) => {
      return await match("u:User:Active", args, { orderBy: "u.name DESC" });
    },
  // 9. User modification
  "modify_user/familyName? firstName? fatherName? role:label? brigadeNumber:uint? address? phone? email? login:string password:password?":
    async (args) => {
      if (Object.keys(args).length === 1) return {};
      const login = fishOutTypes(args, ["string"]).login;
      return await matchOne(
        "u:User:Active",
        { login },
        {
          remove: args.role
            ? { u: ["Operator", "Admin", "Fireman", "Brigadier"] }
            : undefined,
          set: { u: { ...args, modifiedAt: now() } },
          orelse: error("User not found"),
        },
      );
    },
  // 10. Get currently free and busy brigades
  get_brigades: async () => {
    const activeCalls = await match(
      "cf:CallForm:Incomplete",
      {},
      {
        unwind: "cf.assignedTo AS brigadeNumber",
        results: ["COLLECT(DISTINCT brigadeNumber) AS busybodies"],
        orelse: "[]",
        then: (rs) => `[ ${rs[0].filter((x) => x !== 0).join(", ")} ]`,
      },
    );
    return {
      busyBrigades: await match(
        "u:User:Brigadier:Active",
        {},
        {
          where: `u.brigadeNumber IN ${activeCalls}`,
          match: "(brigadeCf:CallForm:Incomplete)",
          having: "any(b IN brigadeCf.assignedTo WHERE b = u.brigadeNumber)",
          results: [
            "u.brigadeNumber AS brigadeNumber",
            "brigadeCf.createdAt AS activeCallStartedAt",
          ],
          orderBy: "activeCallStartedAt DESC",
        },
      ),
      freeBrigades: await match(
        "u:User:Brigadier:Active",
        {},
        {
          where: `NOT u.brigadeNumber IN ${activeCalls} AND u.brigadeNumber <> 0`,
          optional_match: "(brigadeCf:CallForm:Complete)",
          having: "any(b IN brigadeCf.assignedTo WHERE b = u.brigadeNumber)",
          results: [
            "u.brigadeNumber AS brigadeNumber",
            "brigadeCf.modifiedAt AS lastCallEndedAt",
          ],
          orderBy: "lastCallEndedAt DESC",
        },
      ),
    };
  },
  // 11. Create a new report based on complete callform
  "new_report/callformId:id": async ({ callformId }) => {
    return await matchOne(
      "cf:CallForm:Complete",
      { callformId },
      {
        create: `(r:Report:New {
          waterSpent: 0,
          foamSpent: 0,
          allegedFireCause: "неизвестно",
          damage: 0,
          equipmentDamage: "",
          additionalNotes: "Данные ещё не внесены, ожидается завершение отчёта.",
          modifiedAt: datetime()
        })
        CREATE (r)-[:ON_CALL]->(cf)`,
        results: ["r"],
        orelse: error("CallForm not found"),
      },
    );
  },
  "test_query/query:string": async ({ query }) => {
    if (options.mode !== "dev")
      return error("Test query is only available in development mode");
    const result = await rawQuery(query.value.replaceAll("\\", ""));
    console.log(`Query: ${query.value};\nResult: ${JSON.stringify(result)}`);
    return result;
  },
  // Call forms search
  "callform_search/status:label? createdAt:datetime..? modifiedAt:datetime..? departureAt:datetime..? arrivalAt:datetime..? callFinishedAt:datetime..? callSource? fireAddress? fireType? fireRank? victimsCount:uint..? assignedTo:uint..? familyName? firstName? fatherName?":
    async (args) => {
      const userArgs = fishOut(args, ({ k }) => k.includes("Name"));
      return await match("cf:CallForm", args, {
        match: "(u:User:Operator:Active)-[:CREATED]->(cf)",
        having: matches({ u: userArgs }),
        orderBy: "cf.createdAt DESC",
      });
    },
  // Report search
  "report_search/status:label? modifiedAt:datetime..? waterSpent:uint..? foamSpent:uint..? allegedFireCause? damage:uint..? additionalNotes?":
    async (args) => {
      return await match("r:Report", args, {
        orderBy: "r.modifiedAt DESC",
      });
    },
  // Inventory search
  "inventory_search/name?": async (args) => {
    return await match("i:Inventory", args, { orderBy: "i.name ASC" });
  },
  "complete_callform/callformId:id": async (args) => {
    await brigadeCallForms.update();
    return await matchOne("cf:CallForm:Incomplete", args, {
      remove: { cf: ["Incomplete"] },
      set: { cf: { label: makeLabel("Complete"), modifiedAt: now() } },
      orelse: error("CallForm not found"),
    });
  },
  // Find a report by author
  "report_search_by_author/login:string? familyName? firstName? fatherName? role:label? brigadeNumber:uint..? createdAt:datetime..? modifiedAt:datetime..?":
    async (args) => {
      const matchArgs = fishOutComplexConds(args);
      const rArgs = fishOutTypes(matchArgs, ["datetime"]);
      const cfArgs = { modifiedAt: rArgs.createdAt };
      return await match("u:User:Active", args, {
        link: "[:FILLED_IN]->(r:Report)-[:ON_CALL]->(cf:CallForm)",
        where: matches({
          r: { modifiedAt: rArgs.modifiedAt },
          cf: cfArgs,
          u: matchArgs,
        }),
        results: ["r", "u", "cf"],
        orderBy: "r.modifiedAt DESC",
      });
    },
  // Find brigade members
  "brigade_members/brigadeNumber:uint..": async (args) => {
    return await match("u:User:Active", args);
  },
  // Get auto's state
  "auto_state/auto:string": async (args) => {
    return await match("cf:CallForm:Incomplete", args, {
      then: (cfs) => ({
        occupied: cfs && cfs.length > 0,
      }),
    });
  },
  // Add inventory item
  "inventory_add/name:string": async (args) => {
    return await createIfNotExists("i:Inventory", args, {
      orelse: error("Such an item already exists in inventory"),
    });
  },
  // Save report draft (incomplete)
  "incomplete_report/reportId:id login:string waterSpent:uint? foamSpent:uint? allegedFireCause? damage:uint? additionalNotes?":
    async (args) => {
      const login = fishOut(args, ({ k }) => k === "login");
      return (
        (await ensureFilledInBy(args.reportId, login)) ??
        (await matchOne(`r:Report`, fishOutTypes(args, ["id"]), {
          remove: { r: ["New"] },
          set: {
            r: {
              ...args,
              label: makeLabel("Incomplete"),
              modifiedAt: now(),
            },
          },
          results: ["r"],
          orelse: error("Report not found"),
        }))
      );
    },
  // Remove user
  "remove_user/login:string": async (args) => {
    return await matchOne("u:User:Active", args, {
      remove: { u: ["Active"] },
      set: {
        u: {
          label: makeLabel("Deleted"),
          modifiedAt: now(),
        },
      },
      orelse: error("User not found or already deleted"),
    });
  },
  // Delete report
  "delete_report/reportId:id": async (args) => {
    await matchOne("r:Report", args, {
      detach: "r",
    });
    return null;
  },
  // Fill in an incomplete callform
  "fill_callform/callformId:id departureAt:datetime? arrivalAt:datetime? callFinishedAt:datetime? callSource? fireAddress? bottomLeft:point? topRight:point? fireType? fireRank:string? victimsCount:uint? assignedTo:uint[]? auto?":
    async (args) => {
      await brigadeCallForms.update();
      return await matchOne(
        "cf:CallForm:Incomplete",
        fishOutTypes(args, ["id"]),
        { set: { cf: { ...args, modifiedAt: now() } } },
      );
    },
  // Brigade current callforms subscription
  ...brigadeCallForms.route("brigade_callforms"),
};
export default api_routes;
