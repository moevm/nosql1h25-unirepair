import * as query from "./query.js";

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
};
export default api_routes;
