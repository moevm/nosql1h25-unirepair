import * as assert from "../assert.js";
import { runUnitTests } from "./unit_test.js";

const datePattern = {
  year: "number:",
  month: "number:",
  day: "number:",
  hour: "number:",
  minute: "number:",
  second: "number:",
};

const pointPattern = {
  x: "number:",
  y: "number:",
};

const userPattern = {
  "labels:listOf": "string:",
  fatherName: "string:",
  familyName: "string:",
  firstName: "string:",
  address: "string:",
  email: "string:",
  login: "string:",
  brigadeNumber: "number:\\d+",
  passwordHash: "string:[a-zA-Z\\d]+",
  modifiedAt: datePattern,
  registeredAt: datePattern,
  id: "string:\\d+",
};

const callFormPattern = {
  "labels:listOf": "string:",
  "callSource?": "string:",
  "fireAddress?": "string:",
  "bottomLeft?": pointPattern,
  "topRight?": pointPattern,
  "fireType?": "string:",
  "fireRank?": "string:",
  "victimsCount?": "number:\\d+",
  "assignedTo:listOf?": "number:\\d+",
  "auto?": "string:",
  createdAt: datePattern,
  modifiedAt: datePattern,
  "departureAt?": datePattern,
  "arrivalAt?": datePattern,
  "callFinishedAt?": datePattern,
  id: "string:\\d+",
};

const reportPattern = {
  "labels:listOf": "string:",
  allegedFireCause: "string:",
  additionalNotes: "string:",
  waterSpent: "number:\\d+",
  foamSpent: "number:\\d+",
  damage: "number:",
  modifiedAt: datePattern,
  id: "string:\\d+",
};

const inventoryPattern = {
  name: "string:",
  id: "string:\\d+",
};

function listOf(pattern, len = null) {
  return { [`:listOf${len !== null ? `.len=${len}` : ""}`]: pattern };
}

function err(content) {
  return { error: `string:${content}` };
}

const tests = {
  "login_user?login=operator_dmitriy&password=123": userPattern,
  "login_user?login=operator_dmitriy&password=111111": err(
    "Password is incorrect",
  ),
  "login_user?login=operator_anna&password=111111": err("User does not exist"),
  "get_callforms?assignedTo=1": listOf(callFormPattern),
  "get_callforms?assignedTo=1;2": listOf(callFormPattern),
  "get_callforms?assignedTo=7": "list:\\[\\]",
  "brigade_reports?brigadeNumber=1": {
    complete_reports: listOf({
      u: userPattern,
      o: userPattern,
      r: reportPattern,
      cf: callFormPattern,
    }),
    incomplete_reports: listOf({
      u: userPattern,
      o: userPattern,
      r: reportPattern,
      cf: callFormPattern,
    }),
    new_reports: listOf({
      o: userPattern,
      r: reportPattern,
      cf: callFormPattern,
    }),
  },
  "fill_report?reportId=99999&login=brigadier_igor&waterSpent=8800&foamSpent=555&allegedFireCause=laby&damage=3535&additionalNotes=nothinghere":
    err("Report not found"),
  "create_callform?login=operator_inkognito&callSource=Vasya&fireAddress=ITMO&bottomLeft=10;20&topRight=30;40&fireType=expansive&fireRank=3&victimsCount=0&assignedTo=1&auto=Пожарная машина 4":
    err("Operator operator_inkognito not found"),
  "create_callform?login=operator_dmitriy&callSource=Vasya&fireAddress=ITMO&bottomLeft=10;20&topRight=30;40&fireType=expansive&fireRank=3":
    {
      ensure: callFormPattern,
      query:
        "fill_callform?callformId=$id&departureAt=2025-02-07T12:30:00&arrivalAt=2025-02-07T13:30:00&callFinishedAt=2025-02-07T15:30:00&victimsCount=0&assignedTo=1&auto=Пожарная машина 4",
      then: {
        ensure: callFormPattern,
        query: "complete_callform?callformId=$id",
        then: {
          ensure: callFormPattern,
          query: "new_report?callformId=$id",
          then: {
            ensure: reportPattern,
            query:
              "fill_report?reportId=$id&login=brigadier_igor&waterSpent=8800&foamSpent=555&allegedFireCause=laby&damage=3535&additionalNotes=nothinghere",
            then: {
              ensure: reportPattern,
              query: "delete_report?reportId=$id",
              then: {
                ensure: null,
                query:
                  "report_search?waterSpent=8800&foamSpent=555&allegedFireCause=laby",
                then: listOf(reportPattern, ";0"),
              },
            },
          },
        },
      },
    },
  "new_report?callformId=919294": err("CallForm not found"),
  "complete_callform?callformId=209824": err("CallForm not found"),
  "operator_callforms?login=operator_dmitriy": {
    complete_callforms: listOf(callFormPattern),
    incomplete_callforms: listOf(callFormPattern),
  },
  "operator_callforms?login=operator_franka": {
    complete_callforms: "list:\\[\\]",
    incomplete_callforms: "list:\\[\\]",
  },
  "user_spawn?familyName=Сидоров&firstName=Дмитрий&role=Operator&address=г. Новосибирск, ул. Красная, д. 15&login=operator_dmitriy&password=123":
    err("User already exists"),
  "user_spawn?familyName=Roh&firstName=Ivan&fatherName=Ragnarson&role=Brigadier&brigadeNumber=6&address=Siberia&phone=900&email=bananamail&login=rohgadier&password=password":
    {
      ensure: userPattern,
      query: "modify_user?login=rohgadier&address=Germany",
      then: {
        ensure: userPattern,
        query: "remove_user?login=rohgadier",
        then: {
          ensure: userPattern,
          query: "user_search?login=rohgadier",
          then: listOf(userPattern, ";0"),
        },
      },
    },
  "modify_user?login=victor1998&role=Operator": err("User not found"),
  "user_search?firstName=и&registeredAt=2022-10-10;2024-10-10":
    listOf(userPattern),
  get_brigades: {
    busyBrigades: listOf({
      brigadeNumber: "number:\\d+",
      activeCallStartedAt: datePattern,
    }),
    freeBrigades: listOf({
      brigadeNumber: "number:\\d+",
      "lastCallEndedAt?": datePattern,
    }),
  },
  callform_search: listOf(callFormPattern),
  "callform_search?status=Complete": listOf(callFormPattern),
  "callform_search?status=Incomplete&createdAt=2022-05-05;&modifiedAt=2021-06-06;2026-07-01":
    listOf(callFormPattern),
  "callform_search?victimsCount=0;&assignedTo=;10": listOf(callFormPattern),
  "callform_search?status=Incomplete&firstName=и": listOf(callFormPattern),
  "report_search?status=New": listOf(reportPattern),
  "report_search?status=Incomplete&waterSpent=;": listOf(reportPattern),
  "report_search?status=New&modifiedAt=2004-08-05;": listOf(reportPattern),
  "report_search?allegedFireCause=а": listOf(reportPattern),
  inventory_search: listOf(inventoryPattern),
  "inventory_search?name=машина": listOf(inventoryPattern),
  "report_search_by_author?familyName=И": listOf({
    u: userPattern,
    r: reportPattern,
    cf: callFormPattern,
  }),
  "brigade_members?brigadeNumber=;": listOf(userPattern),
  "auto_state?auto=Пожарная машина 5": {
    occupied: "boolean:true",
  },
  "auto_state?auto=Пожарная машина 1": {
    occupied: "boolean:false",
  },
  "inventory_add?name=Пожарная машина 2": err(
    "Such an item already exists in inventory",
  ),
  "inventory_add?name=Антон": {
    ensure: inventoryPattern,
    query: "inventory_search?name=Ант",
    then: listOf(inventoryPattern),
  },
  "remove_user?login=nonexistent": err("User not found"),
};

async function checkQueryResult(router, runner, result, checker) {
  if (checker.constructor === {}.constructor || typeof checker === "string") {
    if (checker.ensure !== undefined) {
      if (checker.ensure)
        await checkQueryResult(router, runner, result, checker.ensure);
      if (checker.query) {
        assert.assertString(checker.query);
        let substitutedCheckQuery = checker.query;
        if (substitutedCheckQuery.includes("$id")) {
          assert.assert(result.id !== undefined);
          assert.assertObject(result);
          substitutedCheckQuery = substitutedCheckQuery.replaceAll(
            "$id",
            result.id,
          );
        }
        const queryResult = await router.runTestQuery(substitutedCheckQuery);
        if (checker.then)
          await checkQueryResult(router, runner, queryResult, checker.then);
      }
    } else {
      runner.match(result, checker);
    }
  } else if (typeof checker === "function") {
    checker(runner, result);
  } else {
    assert.assert(false, "Unexpected checker type: " + typeof checker);
  }
}

function makeApiTests(router) {
  let result = [];
  let i = 0;
  for (const [query, checker] of Object.entries(tests)) {
    i += 1;
    const name = `${query.split("?")[0]}_${i}`;
    result.push([
      name,
      async (runner) => {
        const queryResult = await router.runTestQuery(query);
        await checkQueryResult(router, runner, queryResult, checker);
      },
    ]);
  }
  return result;
}

export async function runApiTests(router) {
  await runUnitTests(makeApiTests(router));
}
