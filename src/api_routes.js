import * as query from "./query.js";
import crypto from "crypto";

const api_routes = {
  "brigade_reports/brigadeNumber:uint": async ({ brigadeNumber }) => {
    return {
      complete_reports: await query.match(
        `(u:User:Brigadier${query.props({ brigadeNumber })})-[:FILLED_IN]->(r:Report:Complete)-[:ON_CALL]->(cf:CallForm:Complete)`,
        ["r", "cf"],
        { orderBy: "cf.createdAt DESC" },
      ),
      incomplete_reports: await query.match(
        `(u:User:Brigadier${query.props({ brigadeNumber })})-[:FILLED_IN]->(r:Report:Incomplete)-[:ON_CALL]->(cf:CallForm:Complete)`,
        ["r", "cf"],
        { orderBy: "cf.createdAt DESC" },
      ),
    };
  },
  "find_user/familyName:string? firstName:string? fatherName:string? role:string? brigadeNumber:uint?":
    async ({ familyName, firstName, fatherName, role, brigadeNumber }) => {
      return await query.match(
        `(u:User${query.props({ familyName, firstName, fatherName, brigadeNumber }, [role])})`,
        ["u"],
        { orderBy: "u.name DESC" },
      );
    },
   "get_brigades": async () => {
    const brigades = await query.match(
      `(b:User:Brigadier)`,
      ["b.brigadeNumber"]
    );

    if (!brigades.length) {
      return { message: "Бригады отсутствуют." };
    }
    const callForms = await query.match(
      `(cf:CallForm)`,
      ["cf.status", "cf.assignedTo", "cf.createdAt", "cf.modifiedAt"],
      { orderBy: "cf.createdAt DESC" }
    );

    let freeBrigades = [];
    let busyBrigades = [];

    for (const { brigadeNumber } of brigades) {
      const brigadeCalls = callForms.filter((cf) => cf.assignedTo.includes(brigadeNumber));
      if (brigadeCalls.length === 0) {
        freeBrigades.push({ brigadeNumber, lastCallEndedAt: null });
      } else {
        const lastCall = brigadeCalls[0];

        if (lastCall.status === "Complete") {
          freeBrigades.push({ brigadeNumber, lastCallEndedAt: lastCall.modifiedAt });
        } else {
          busyBrigades.push({ brigadeNumber, activeCallStartedAt: lastCall.createdAt });
        }
      }
    }
    freeBrigades.sort((a, b) => (a.lastCallEndedAt || 0) - (b.lastCallEndedAt || 0));
    busyBrigades.sort((a, b) => b.activeCallStartedAt - a.activeCallStartedAt);

    return [...freeBrigades, ...busyBrigades];
  },
  "get_calls/brigadeNumber:uint": async ({ brigadeNumber }) => {
    const callForms = await query.match(
      `(cf:CallForm) WHERE $brigadeNumber IN cf.assignedTo`, 
      ["cf"],
      { orderBy: "cf.createdAt DESC" }
    );
    if (!callForms.length) {
      return { message: "No active calls" };
    }
    return callForms;
  },
  "login_user/login:string password:string": async ({ login, password }) => {
    const hashedPassword =  crypto.createHash("sha256").update(password).digest("hex");
    const users = await query.match(
      `(u:User${query.props({ login })})`, 
      ["u"]
    );
    if (!users.length) {
      return { error: "User does not exist" };
    }
    const user = users[0];
    if (user.passwordHash !== hashedPassword) {
      return { error: "Password is incorrect" };
    }
    return user;
  }
};
export default api_routes;
