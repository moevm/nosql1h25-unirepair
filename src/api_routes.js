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
  "get_callforms/assignedTo:uint..": async (args) => {
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
  "fill_report/reportId:id.. waterSpent:uint foamSpent:uint allegedFireCause damage:uint additionalNotes":
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
      return await create(":CallForm:Incomplete", {
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
      return await create(
        ":User:Active" + (args.role === "Brigadier" ? ":Fireman" : ""),
        {
          ...args,
          registeredAt: now(),
          modifiedAt: now(),
        },
      );
    },
  // 8. User search
  "user_search/familyName? firstName? fatherName? role:label? brigadeNumber:uint..? address? phone? email? login? registeredAt:datetime..? modifiedAt:datetime..?":
    async (args) => {
      console.log(args);
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
            ? { u: ["Operator", "Admin", "Fireman", "Brigadier"] }
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
  // Find a report by author
  "report_search_by_author/familyName? firstName? fatherName? role:label? brigadeNumber:uint..? createdAt:datetime..? modifiedAt:datetime..?":
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
    const cfs = await match("cf:CallForm:Incomplete", args);
    return {
      occupied: cfs && cfs.length > 0,
    };
  },
  //add inventory
  "inventory_add/name:string": async (args) => {
    const nameValue = args.name?.value;

    if (
      !nameValue ||
      typeof nameValue !== "string" ||
      nameValue.trim() === ""
    ) {
      return {
        success: false,
        message: "Название инвентаря не может быть пустым",
        status: 400,
      };
    }

    const trimmedName = nameValue.trim();

    const existing = await match("i:Inventory", {
      name: { value: trimmedName, type: "string" },
    });
    if (existing?.length > 0) {
      return {
        success: false,
        message: "Инвентарь с таким названием уже существует",
        status: 409,
      };
    }

    const newItem = await create(":Inventory", {
      name: { value: trimmedName, type: "string" },
    });

    return {
      success: true,
      data: { name: trimmedName },
      message: "Инвентарь успешно добавлен",
      status: 200,
    };
  },
  "complete_callform_and_create_report/status:label? createdAt:datetime..? modifiedAt:datetime..? callSource? fireAddress? fireType? fireRank? victimsCount:uint? assignedTo:uint?":
    async (args) => {
      const callForms = await match("cf:CallForm:Incomplete", args, {
        orderBy: "cf.createdAt DESC",
      });

      if (!callForms || callForms.length === 0) {
        return {
          success: false,
          message: "Вы еще не отправили форму бригадам",
          status: 404,
        };
      }

      const callform = callForms[0];

      await match(
        "cf:CallForm:Incomplete",
        { id: callform.id },
        {
          remove: { cf: ["Incomplete"] },
          set: { cf: { label: makeLabel("Complete"), modifiedAt: now() } },
        },
      );

      await match(
        "cf:CallForm:Complete",
        { id: callform.id },
        {
          create: `(r:Report:New {
                      waterSpent: 0,
                      foamSpent: 0,
                      allegedFireCause: "неизвестно",
                      damage: 0,
                      additionalNotes: "Данные ещё не внесены, ожидается завершение отчёта.",
                      modifiedAt: datetime()
                      })\nCREATE (r)-[:ON_CALL]->(cf)`,
        },
      );

      return {
        success: true,
        message: "Форма вызова завершена и отчет создан",
        status: 200,
        callformId: callform.id,
      };
    },
};
export default api_routes;
