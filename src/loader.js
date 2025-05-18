import * as assert from "./assert.js";
import options from "./options.js";
import { create, rawQuery, match, props } from "./query.js";
import { parseValue } from "./query_scheme.js";

const scheme = {
  role: "label",
  familyName: "string",
  firstName: "string",
  fatherName: "string",
  brigadeNumber: "uint",
  address: "string",
  phone: "string",
  email: "string",
  login: "string",
  password: "password",
  registeredAt: "datetime",
  modifiedAt: "datetime",
  status: "label",
  waterSpent: "uint",
  foamSpent: "uint",
  allegedFireCause: "string",
  damage: "uint",
  equipmentDamage: "string",
  additionalNotes: "string",
  createdAt: "datetime",
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
  name: "string",
};

function applyTypes(x) {
  const keys = [...Object.keys(x)];
  for (const key of keys) {
    if (key === "id") {
      delete x[key];
      continue;
    }
    if (key.startsWith("label")) {
      if (Array.isArray(x[key])) {
        let i = 1;
        for (const l of x[key]) x[`label_${i++}`] = { value: l, type: "label" };
        delete x[key];
      } else {
        x[key] = { value: x[key], type: "label" };
      }
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
        if (v.x !== undefined && v.y !== undefined) {
          x[key] = { value: { longitude: v.x, latitude: v.y }, type: "point" };
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
  options.no_trace = true;
  for (const user of data.users) await create(":User", applyTypes(user));
  for (const cf of data.callforms) await create(":CallForm", applyTypes(cf));
  for (const report of data.reports)
    await create(":Report", applyTypes(report));
  for (const item of data.inventory)
    await create(":Inventory", applyTypes(item));

  for (const relation of data.relationships)
    await match("start", applyTypes(relation.startNode), {
      match: `(end${props(applyTypes(relation.endNode))})`,
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
