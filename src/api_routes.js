import {
  match,
  rawMatch,
  props,
  now,
  fishOut,
  fishOutTypes,
  rawQuery,
  matches,
  fishOutComplexConds,
  makeLabel,
  matchOne,
  createIfNotExists,
} from "./query.js";

function error(str) {
  return { error: str };
}

const api_routes = {
  // 1. All information on user from their login and password
  "login_user/login:string password:password": async ({ login, password }) => {
    return await matchOne(
      "u:User",
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
  "get_callforms/assignedTo:uint..": async (args) => {
    return await match("cf:CallForm", args, {
      orderBy: "cf.createdAt DESC",
    });
  },
  // 3. Reports on a brigade
  "brigade_reports/brigadeNumber:uint": async (args) => {
    return {
      complete_reports: await rawMatch(
        `(u:User:Brigadier${props(args)})-[:FILLED_IN]->(r:Report:Complete)-[:ON_CALL]->(cf:CallForm:Complete)-[:CREATED_BY]->(o:User:Operator)`,
        { results: ["u", "o", "r", "cf"], orderBy: "cf.createdAt DESC" },
      ),
      incomplete_reports: await rawMatch(
        `(u:User:Brigadier${props(args)})-[:FILLED_IN]->(r:Report:Incomplete)-[:ON_CALL]->(cf:CallForm:Complete)-[:CREATED_BY]->(o:User:Operator)`,
        { results: ["u", "o", "r", "cf"], orderBy: "cf.createdAt DESC" },
      ),
      new_reports: await rawMatch(
        `(u:User:Brigadier${props(args)})-[:FILLED_IN]->(r:Report:New)-[:ON_CALL]->(cf:CallForm:Complete)-[:CREATED_BY]->(o:User:Operator)`,
        { results: ["u", "o", "r", "cf"], orderBy: "cf.createdAt DESC" },
      ),
    };
  },
  // 4. Fill in a report
  "fill_report/login:string reportId:id waterSpent:uint foamSpent:uint allegedFireCause damage:uint additionalNotes":
    async (args) => {
      const login = fishOut(args, ({ k }) => k === "login");
      return await matchOne("r:Report:New", fishOutTypes(args, ["id"]), {
        match: `(u:User:Brigadier${props(login)})`,
        create: `(u)-[:FILLED_IN]->(r)`,
        remove: { r: ["New"] },
        set: { r: { ...args, label: makeLabel("Complete") } },
        results: ["r"],
        orelse: error("Report or Brigadier not found"),
      });
    },
  // 5. Create a new callform
  "create_callform/login:string callSource? fireAddress? bottomLeft:point? topRight:point? fireType? fireRank:string? victimsCount:uint? assignedTo:uint? auto?":
    async (args) => {
      if (Object.values(args).includes(null))
        return error("Incomplete callforms are not supported yet");
      const operatorArgs = fishOut(args, ({ k }) => k === "login");
      return await matchOne("o:User:Operator", operatorArgs, {
        create: `(cf:CallForm:Incomplete${props({
          ...args,
          createdAt: now(),
          modifiedAt: now(),
        })})
        CREATE (o)-[:CREATED]->(cf)
        CREATE (cf)-[:CREATED_BY]->(cf)`,
        results: ["cf"],
        orelse: error(`Operator ${operatorArgs.login.value} not found`),
      });
    },
  // 6. Find operator's complete callforms
  "operator_callforms/login:string": async (args) => {
    return {
      complete_callforms: await rawMatch(
        `(u:User:Operator${props(args)})-[:CREATED]->(cf:CallForm:Complete)`,
        { results: ["cf"], orderBy: "cf.createdAt DESC" },
      ),
      incomplete_callforms: await rawMatch(
        `(u:User:Operator${props(args)})-[:CREATED]->(cf:CallForm:Incomplete)`,
        { results: ["cf"], orderBy: "cf.createdAt DESC" },
      ),
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
      return await match("u:User", args, { orderBy: "u.name DESC" });
    },
  // 9. User modification
  "modify_user/familyName? firstName? fatherName? role:label? brigadeNumber:uint? address? phone? email? login:string password:password?":
    async (args) => {
      if (Object.keys(args).length === 1) return {};
      const login = fishOutTypes(args, ["string"]).login;
      return await matchOne(
        "u:User",
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
        results: ["COLLECT(DISTINCT cf.assignedTo) AS busybodies"],
        orelse: "[]",
        then: (rs) => `[ ${rs[0].filter((x) => x !== 0).join(", ")} ]`,
      },
    );
    return {
      busyBrigades: await rawMatch(
        `(u:User:Brigadier)
        WHERE u.brigadeNumber IN ${activeCalls}
        MATCH (brigadeCf:CallForm:Incomplete { assignedTo: u.brigadeNumber })
      `,
        {
          results: [
            "u.brigadeNumber AS brigadeNumber",
            "brigadeCf.createdAt AS activeCallStartedAt",
          ],
          orderBy: "activeCallStartedAt DESC",
        },
      ),
      freeBrigades: await rawMatch(
        `(u:User:Brigadier)
        WHERE NOT u.brigadeNumber IN ${activeCalls} AND u.brigadeNumber <> 0
        OPTIONAL MATCH (brigadeCf:CallForm:Complete { assignedTo: u.brigadeNumber })
      `,
        {
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
  "new_report/callformId:id": async (args) => {
    return await matchOne("cf:CallForm:Complete", args, {
      create: `(r:Report:New {
          waterSpent: 0,
          foamSpent: 0,
          allegedFireCause: "неизвестно",
          damage: 0,
          additionalNotes: "Данные ещё не внесены, ожидается завершение отчёта.",
          modifiedAt: datetime()
        })
        CREATE (r)-[:ON_CALL]->(cf)`,
      results: ["r"],
      orelse: error("CallForm not found"),
    });
  },
  "test_query/query:string": async ({ query }) => {
    const result = await rawQuery(query.value);
    console.log(`Query: ${query.value};\nResult: ${JSON.stringify(result)}`);
    return result;
  },
  // Сall forms search
  "callform_search/status:label? createdAt:datetime..? modifiedAt:datetime..? callSource? fireAddress? fireType? fireRank? victimsCount:uint..? assignedTo:uint..?":
    async (args) => {
      return await match("cf:CallForm", args, {
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
    return await matchOne("cf:CallForm:Incomplete", args, {
      remove: { cf: ["Incomplete"] },
      set: { cf: { label: makeLabel("Complete"), modifiedAt: now() } },
      results: ["cf"],
      orelse: error("CallForm not found"),
    });
  },
  // Find a report by author
  "report_search_by_author/login:string? familyName? firstName? fatherName? role:label? brigadeNumber:uint..? createdAt:datetime..? modifiedAt:datetime..?":
    async (args) => {
      const matchArgs = fishOutComplexConds(args);
      const rArgs = fishOutTypes(matchArgs, ["datetime"]);
      return await rawMatch(
        `(u:User${props(args)})-[:FILLED_IN]->(r:Report)-[:ON_CALL]->(cf:CallForm)`,
        {
          where: matches({ r: rArgs, u: matchArgs }),
          results: ["r", "u", "cf"],
          orderBy: "r.modifiedAt DESC",
        },
      );
    },
  // Find brigade members
  "brigade_members/brigadeNumber:uint..": async (args) => {
    return await match("u:User", args);
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
};
export default api_routes;
