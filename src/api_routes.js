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
