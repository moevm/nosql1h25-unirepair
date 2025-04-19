import { create, match, props, byId, now, matches } from "./query.js";

function fishOut(obj, prop) {
  const result = obj[prop];
  delete obj[prop];
  return result;
}

function fishOutDateRangesAndStrings(obj) {
  let result = {};
  for (const k in Object.keys(obj)) {
    if (typeof obj[k] === "string" || (obj[k] && obj[k].from && obj[k].to)) {
      result[k] = obj[k];
      delete obj[k];
    }
  }
  return result;
}

function removeNulls(obj) {
  for (const k of Object.keys(obj)) {
    if (obj[k] === null) delete obj[k];
  }
  return obj;
}

const api_routes = {
  // 1. All information on user from their login and password
  "login_user/login password:password": async ({ login, password }) => {
    const users = await match(`(u:User${props({ login })})`, {
      results: ["u"],
    });
    if (!users || users.length === 0) return { error: "User does not exist" };
    const user = users[0];
    if (user.passwordHash !== password.hash)
      return { error: "Password is incorrect" };
    return user;
  },
  // 2. Current call forms on a brigade
  "get_callforms/brigadeNumber:uint": async ({ brigadeNumber }) => {
    const callForms = await match(
      `(cf:CallForm${props({ assignedTo: brigadeNumber })})`,
      {
        results: ["cf"],
        orderBy: "cf.createdAt DESC",
      },
    );
    if (!callForms || callForms.length === 0)
      return { message: "No active calls" };
    return callForms;
  },
  // 3. Reports on a brigade
  "brigade_reports/brigadeNumber:uint": async ({ brigadeNumber }) => {
    return {
      complete_reports: await match(
        `(u:User:Brigadier${props({ brigadeNumber })})-[:FILLED_IN]->(r:Report:Complete)-[:ON_CALL]->(cf:CallForm:Complete)`,
        { results: ["r", "cf"], orderBy: "cf.createdAt DESC" },
      ),
      incomplete_reports: await match(
        `(u:User:Brigadier${props({ brigadeNumber })})-[:FILLED_IN]->(r:Report:Incomplete)-[:ON_CALL]->(cf:CallForm:Complete)`,
        { results: ["r", "cf"], orderBy: "cf.createdAt DESC" },
      ),
      new_reports: await match(
        `(u:User:Brigadier${props({ brigadeNumber })})-[:FILLED_IN]->(r:Report:New)-[:ON_CALL]->(cf:CallForm:Complete)`,
        { results: ["r", "cf"], orderBy: "cf.createdAt DESC" },
      ),
    };
  },
  // 4. Fill in a report
  "fill_report/reportId:uint waterSpent:uint foamSpent:uint allegedFireCause damage:uint additionalNotes":
    async (args) => {
      const reportId = fishOut(args, "reportId");
      await match(`(r:Report:New)`, {
        where: byId("r", reportId),
        remove: { r: ["New"] },
        set: { r: { labels: ["Complete"], props: args } },
      });
      return {};
    },
  // 5. Create a new callform
  "create_callform/callSource:string? fireAddress:string? bottomLeft:point? topRight:point? fireType:string? fireRank:string? victimsCount:uint? assignedTo:uint? auto:string?":
    async (args) => {
      if (Object.values(args).includes(null))
        return { error: "Incomplete callforms are not supported yet" };
      await create(
        props({ ...args, createdAt: now(), modifiedAt: now() }, [
          "CallForm",
          "Complete",
        ]),
      );
      return {};
    },
  // 6. Find operator's complete callforms
  "operator_callforms/login": async ({ login }) => {
    return await match(
      `(u:User:Operator${props({ login })})-[:CREATED]->(cf:CallForm:Complete)`,
      { results: ["cf"], orderBy: "cf.createdAt DESC" },
    );
  },
  // 7. Spawn user
  "user_spawn/familyName firstName fatherName role brigadeNumber:uint address phone email login password:password":
    async (args) => {
      const role = fishOut(args, "role");
      const labels = ["User", "Active", role].concat(
        role === "Brigadier" ? ["Fireman"] : [],
      );
      await create(
        props({ ...args, registeredAt: now(), modifiedAt: now() }, labels),
      );
      return {};
    },
  // 8. User search
  "user_search/familyName? firstName? fatherName? role? brigadeNumber:uint? address? phone? email? registeredAt:daterange? modifiedAt:daterange?":
    async (args) => {
      const role = fishOut(args, "role");
      const brigadeNumber = fishOut(args, "brigadeNumber");
      return await match(`(u:User${props({ brigadeNumber }, [role])})`, {
        where: matches("u", args),
        results: ["u"],
        orderBy: "u.name DESC",
      });
    },
  // 9. User modification
  "modify_user/familyName? firstName? fatherName? role? brigadeNumber:uint? address? phone? email? login password:password?":
    async (args) => {
      args = removeNulls(args);
      if (Object.keys(args).length === 1) return {};
      const role = fishOut(args, "role");
      const labels = role
        ? [role].concat(role === "Brigadier" ? ["Fireman"] : [])
        : undefined;
      const login = fishOut(args, "login");
      const remove = labels
        ? { u: ["Operator", "Administrator", "Fireman", "Brigidier"] }
        : undefined;
      await match(`(u:User${props({ login })})`, {
        remove,
        set: { u: { labels, props: { ...args, modifiedAt: now() } } },
      });
      return {};
    },
  // 10. Get currently free and busy brigades
  get_brigades: async () => {
    let activeCalls = await match("(cf:CallForm:Incomplete)", {
      results: ["COLLECT(DISTINCT cf.assignedTo) AS busybodies"],
    });
    activeCalls =
      activeCalls && activeCalls.length
        ? `[ ${activeCalls[0].filter((x) => x !== 0).join(", ")} ]`
        : "[]";
    return {
      busyBrigades: await match(
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
      freeBrigades: await match(
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
  "new_report/callformId:uint": async ({ callformId }) => {
    await match(`(cf:CallForm:Complete)`, {
      where: byId("cf", callformId),
      create: `(r:Report:New${props({
        waterSpent: 0,
        foamSpent: 0,
        allegedFireCause: "неизвестно",
        damage: 0,
        additionalNotes: "Данные ещё не внесены, ожидается завершение отчёта.",
        modifiedAt: now(),
      })})\nCREATE (r)-[:ON_CALL]->(cf)`,
    });
    return {};
  },
  "test_query/query": async ({ query }) => {
    const result = await match(query, { results: ["u"] });
    console.log(`Query: ${query};\nResult: ${JSON.stringify(result)}`);
    return result;
  },
  // Сall forms search
  "callform_search/status? createdAt:daterange? modifiedAt:daterange? callSource? fireAddress? fireType? fireRank? victimsCount:uint? assignedTo:uint?":
    async (args) => {
      const status = fishOut(args, "status");
      const matchArgs = fishOutDateRangesAndStrings(args);
      return await match(`(cf:CallForm${props(args, [status])})`, {
        where: matches("cf", matchArgs),
        results: ["cf"],
        orderBy: "cf.createdAt DESC",
      });
    },
  // Report search
  "report_search_by_author/familyName? firstName? fatherName? role? brigadeNumber:uint? callFormCreatedAt:daterange? modifiedAt:daterange?":
  async (args) => {
    const role = fishOut(args, "role");
    const brigadeNumber = fishOut(args, "brigadeNumber");
    const matchArgs = fishOutDateRangesAndStrings(args);

    return await match(
      `(u:User${props({ brigadeNumber }, [role])})-[:FILLED_IN]->(r:Report)-[:ON_CALL]->(cf:CallForm)`,
      {
        where: matches("r", matchArgs), 
        results: ["r", "u", "cf"],
        orderBy: "r.modifiedAt DESC",
      }
    );
  },
};
export default api_routes;
