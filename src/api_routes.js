import { create, match, props } from "./query.js";

function fishOut(obj, prop) {
  const result = obj[prop];
  delete obj[prop];
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
    if (!users.length) {
      return { error: "User does not exist" };
    }
    const user = users[0];
    if (user.passwordHash !== password.hash) {
      return { error: "Password is incorrect" };
    }
    return user;
  },
  // 2. Current call forms on a brigade
  "get_callforms/brigadeNumber:uint": async ({ brigadeNumber }) => {
    const callForms = await match(
      `(cf:CallForm) WHERE $brigadeNumber IN cf.assignedTo`,
      { results: ["cf"], orderBy: "cf.createdAt DESC" },
    );
    if (!callForms.length) {
      return { message: "No active calls" };
    }
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
    };
  },
  // 4. Fill in a report
  "fill_report/callform:uint": async ({ callform }) => {},
  // 5. Create a new callform
  "create_callform/callSource:string? fireAddress:string? bottomLeft:point? topRight:point? fireType:string? fireRank:string? victimsCount:uint? assignedTo:uint? auto:string?":
    async (args) => {
      if (Object.values(args).includes(null))
        return { error: "Incomplete callforms are not supported yet" };
      await create(
        props(
          { ...args, createdAt: "timestamp()", modifiedAt: "timestamp()" },
          ["CallForm", "Complete"],
        ),
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
      const labels = ["User", role].concat(
        role === "Brigadier" ? ["Fireman"] : [],
      );
      await create(
        props(
          { ...args, registeredAt: "timestamp()", modifiedAt: "timestamp()" },
          labels,
        ),
      );
      return {};
    },
  // 8. User search
  "user_search/familyName? firstName? fatherName? role? brigadeNumber:uint?":
    async ({ familyName, firstName, fatherName, role, brigadeNumber }) => {
      return await match(
        `(u:User${props({ familyName, firstName, fatherName, brigadeNumber }, [role])})`,
        { results: ["u"], orderBy: "u.name DESC" },
      );
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
        set: { u: { labels, props: { ...args, modifiedAt: "timestamp()" } } },
      });
      return {};
    },
  // 10. Get currently free and busy brigades
  get_brigades: async () => {
    const brigades = await match(`(b:User:Brigadier)`, {
      results: ["b.brigadeNumber"],
    });

    if (!brigades.length) {
      return { message: "Бригады отсутствуют." };
    }
    const callForms = await match(`(cf:CallForm)`, {
      results: ["cf.status", "cf.assignedTo", "cf.createdAt", "cf.modifiedAt"],
      orderBy: "cf.createdAt DESC",
    });

    let freeBrigades = [];
    let busyBrigades = [];

    for (const { brigadeNumber } of brigades) {
      const brigadeCalls = callForms.filter((cf) =>
        cf.assignedTo.includes(brigadeNumber),
      );
      if (brigadeCalls.length === 0) {
        freeBrigades.push({ brigadeNumber, lastCallEndedAt: null });
      } else {
        const lastCall = brigadeCalls[0];

        if (lastCall.status === "Complete") {
          freeBrigades.push({
            brigadeNumber,
            lastCallEndedAt: lastCall.modifiedAt,
          });
        } else {
          busyBrigades.push({
            brigadeNumber,
            activeCallStartedAt: lastCall.createdAt,
          });
        }
      }
    }
    freeBrigades.sort(
      (a, b) => (a.lastCallEndedAt || 0) - (b.lastCallEndedAt || 0),
    );
    busyBrigades.sort((a, b) => b.activeCallStartedAt - a.activeCallStartedAt);

    return [...freeBrigades, ...busyBrigades];
  },
};
export default api_routes;
