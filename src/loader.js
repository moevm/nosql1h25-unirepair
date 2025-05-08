import * as assert from "./assert.js";
import options from "./options.js";
import { create, rawQuery, match, props } from "./query.js";
import { parseValue } from "./query_scheme.js";

const userScheme = {
  role: "label",
  familyName: "string",
  firstName: "string",
  fatherName: "string",
  brigadeNumber: "uint",
  address: "string",
  phone: "string",
  email: "string",
  login: "string",
  passwordHash: "password",
  registeredAt: "datetime",
  modifiedAt: "datetime",
  status: "label",
};

const callFormScheme = {
  status: "label",
  createdAt: "datetime",
  modifiedAt: "datetime",
  departureAt: "datetime",
  arrivalAt: "datetime",
  callFinishedAt: "datetime",
  callSource: "string",
  fireAddress: "string",
  bottomLeft: "point",
  topRight: "point",
  fireType: "string",
  fireRank: "string",
  victimsCount: "uint",
  assignedTo: "uint[]",
  auto: "string",
};

const reportScheme = {
  status: "label",
  waterSpent: "uint",
  foamSpent: "uint",
  allegedFireCause: "string",
  damage: "uint",
  equipmentDamage: "string",
  additionalNotes: "string",
  modifiedAt: "datetime",
};

const inventoryScheme = {
  name: "string",
};

function applyTypes(x, scheme) {
  for (const key of Object.keys(x)) {
    if (key === "id") continue;
    if (key === "labels") {
      let i = 1;
      for (const l of x[key]) x[`label_${i++}`] = { value: l, type: "label" };
      delete x[key];
      continue;
    }

    let type = scheme[key];
    const isArray = type.endsWith("[]");
    if (isArray) {
      type = type.slice(0, -2);
      x[key] = {
        values: x[key].map((v) => parseValue(type, key, v.toString())),
        type,
      };
    } else {
      if (type === "point") {
        const v = x[key];
        if (v.longitude !== undefined && v.latitude !== undefined) {
          x[key] = { value: v, type: "point" };
          continue;
        }
      }
      x[key] =
        type === "password"
          ? {
              value: { password: "", hash: x[key].toString() },
              type: "password",
            }
          : { value: parseValue(type, key, x[key].toString()), type };
    }
  }
  return x;
}

export async function clearDB() {
  await rawQuery("MATCH (n) DETACH DELETE n;");
}

export async function loadDB(data) {
  assert.assertObject(data);
  assert.assertArray(data.users);
  assert.assertArray(data.callforms);
  assert.assertArray(data.reports);
  assert.assertArray(data.inventory);
  assert.assertArray(data.relationships);
  options.no_trace = true;
  for (const user of data.users)
    await create(":User", applyTypes(user, userScheme));
  for (const cf of data.callforms)
    await create(":CallForm", applyTypes(cf, callFormScheme));
  for (const report of data.reports)
    await create(":Report", applyTypes(report, reportScheme));
  for (const item of data.inventory)
    await create(":Inventory", applyTypes(item, inventoryScheme));
  for (const relation of data.relationships)
    await match("start", relation.startNode, {
      match: `(end${props(relation.endNode)})`,
      create: `(start)-[:${relation.relationshipType}]->(end)`,
    });
  options.no_trace = false;
}

export async function exportDB() {
  return {
    users: await match("u:User", {}),
    callforms: await match("cf:CallForm", {}),
    reports: await match("r:Report", {}),
    inventory: await match("i:Inventory", {}),
    relationships: await match(
      "startNode",
      {},
      {
        link: "[r]->(endNode)",
        results: ["startNode", "endNode", "type(r) AS relationshipType"],
      },
    ),
  };
}
