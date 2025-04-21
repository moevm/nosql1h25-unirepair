import {
  create,
  match,
  rawMatch,
  props,
  now,
  fishOutTypes,
  rawQuery,
  matches,
  fishOutComplexConds,
  makeLabel,
} from "./query.js";

import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const api_routes = {
  // 1. All information on user from their login and password
  "login_user/login:string password:password": async ({ login, password }) => {
    const users = await match("u:User", { login });
    if (!users || users.length === 0) return { error: "User does not exist" };
    const user = users[0];
    if (user.passwordHash !== password.value.hash)
      return { error: "Password is incorrect" };
    return user;
  },
  // 2. Current call forms on a brigade
  "get_callforms/assignedTo:uint": async (args) => {
    const callForms = await match("cf:CallForm", args, {
      orderBy: "cf.createdAt DESC",
    });
    if (!callForms || callForms.length === 0)
      return { message: "No active calls" };
    return callForms;
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
  "fill_report/reportId:id waterSpent:uint foamSpent:uint allegedFireCause damage:uint additionalNotes":
    async (args) => {
      await match("r:Report:New", fishOutTypes(args, ["id"]), {
        remove: { r: ["New"] },
        set: { r: { ...args, label: makeLabel("Complete") } },
      });
      return {};
    },
  // 5. Create a new callform
  "create_callform/callSource? fireAddress? bottomLeft:point? topRight:point? fireType? fireRank:string? victimsCount:uint? assignedTo:uint? auto?":
    async (args) => {
      if (Object.values(args).includes(null))
        return { error: "Incomplete callforms are not supported yet" };
      return await create(":CallForm:Complete", {
        ...args,
        createdAt: now(),
        modifiedAt: now(),
      });
    },
  // 6. Find operator's complete callforms
  "operator_callforms/login:string": async (args) => {
    return await rawMatch(
      `(u:User:Operator${props(args)})-[:CREATED]->(cf:CallForm:Complete)`,
      { results: ["cf"], orderBy: "cf.createdAt DESC" },
    );
  },
  // 7. Spawn user
  "user_spawn/familyName firstName fatherName? role:label brigadeNumber:uint?=0 address phone? email? login:string password:password":
    async (args) => {
        const existingInDB = await match("u:User", { login: args.login });
        if (existingInDB?.length > 0) {
            return { error: "User with this login already exists in database" };
        }

        const currentDate = new Date().toISOString();
        const userData = {
            role: args.role.value,
            familyName: args.familyName.value,
            firstName: args.firstName.value,
            fatherName: args.fatherName?.value || null,
            brigadeNumber: parseInt(args.brigadeNumber?.value) || 0,
            address: args.address?.value || null,
            phone: args.phone?.value || null,
            email: args.email?.value || null,
            login: args.login.value,
            passwordHash: args.password.value.hash,
            registeredAt: currentDate,
            modifiedAt: currentDate,
            status: "Active"
        };

        const dataDir = path.join(__dirname, "data");
        const usersPath = path.join(dataDir, "users.json");

        try {
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            let users = [];
            if (fs.existsSync(usersPath)) {
                users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
            }

            if (users.some(u => u.login === userData.login)) {
                return { error: "User with this login already exists in JSON" };
            }

            users.push(userData);
            fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
        } catch (err) {
            console.error('Error updating users.json:', err);
            return { error: "Failed to update user data file" };
        }

        try {
            return await create(
                `:User:Active${args.role.value === "Brigadier" ? ":Fireman" : ""}`,
                {
                    ...userData,
                    registeredAt: now(),
                    modifiedAt: now()
                }
            );
        } catch (dbError) {
            console.error('Database error:', dbError);
            try {
                const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
                const updatedUsers = users.filter(u => u.login !== userData.login);
                fs.writeFileSync(usersPath, JSON.stringify(updatedUsers, null, 2));
            } catch (rollbackError) {
                console.error('Rollback failed:', rollbackError);
            }
            return { error: "Failed to create user in database" };
        }
    },
  // 8. User search
  "user_search/familyName? firstName? fatherName? role:label? brigadeNumber:uint? address? phone? email? registeredAt:daterange? modifiedAt:daterange?":
    async (args) => {
      return await match("u:User", args, { orderBy: "u.name DESC" });
    },
  // 9. User modification
  "modify_user/familyName? firstName? fatherName? role:label? brigadeNumber:uint? address? phone? email? login:string password:password?":
    async (args) => {
      if (Object.keys(args).length === 1) return {};
      const login = fishOutTypes(args, ["string"]).login;
      await match(
        "u:User",
        { login },
        {
          remove: args.role
            ? { u: ["Operator", "Administrator", "Fireman", "Brigidier"] }
            : undefined,
          set: { u: { ...args, modifiedAt: now() } },
        },
      );
      return {};
    },
  // 10. Get currently free and busy brigades
  get_brigades: async () => {
    let activeCalls = await match(
      "cf:CallForm:Incomplete",
      {},
      {
        results: ["COLLECT(DISTINCT cf.assignedTo) AS busybodies"],
      },
    );
    activeCalls =
      activeCalls && activeCalls.length
        ? `[ ${activeCalls[0].filter((x) => x !== 0).join(", ")} ]`
        : "[]";
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
    await match("cf:CallForm:Complete", args, {
      create: `(r:Report:New {
        waterSpent: 0,
        foamSpent: 0,
        allegedFireCause: "неизвестно",
        damage: 0,
        additionalNotes: "Данные ещё не внесены, ожидается завершение отчёта.",
        modifiedAt: datetime()
      })\nCREATE (r)-[:ON_CALL]->(cf)`,
    });
    return {};
  },
  "test_query/query:string": async ({ query }) => {
    const result = await rawQuery(query.value);
    console.log(`Query: ${query.value};\nResult: ${JSON.stringify(result)}`);
    return result;
  },
  // Сall forms search
  "callform_search/status:label? createdAt:daterange? modifiedAt:daterange? callSource? fireAddress? fireType? fireRank? victimsCount:uint? assignedTo:uint?":
    async (args) => {
      return await match("cf:CallForm", args, {
        orderBy: "cf.createdAt DESC",
      });
    },
  // Report search
  "report_search/status:label? modifiedAt:daterange? waterSpent:uint? foamSpent:uint? allegedFireCause? damage:uint? additionalNotes?":
    async (args) => {
      return await match("r:Report", args, {
        orderBy: "r.modifiedAt DESC",
      });
    },
  // Inventory search
  "inventory_search/name?": async (args) => {
    return await match("i:Inventory", args, { orderBy: "i.name ASC" });
  },
  // Find a report by author
  "report_search_by_author/familyName? firstName? fatherName? role:label? brigadeNumber:uint? createdAt:daterange? modifiedAt:daterange?":
    async (args) => {
      const matchArgs = fishOutComplexConds(args);
      const rArgs = fishOutTypes(matchArgs, ["daterange"]);
      return await rawMatch(
        `(u:User${props(args)})-[:FILLED_IN]->(r:Report)-[:ON_CALL]->(cf:CallForm)`,
        {
          where: matches({ r: rArgs, u: matchArgs }),
          results: ["r", "u", "cf"],
          orderBy: "r.modifiedAt DESC",
        },
      );
    },
};
export default api_routes;
