import * as assert from "./assert.js";
import driver from "./db.js";

function typeOf(value) {
  return value ? value.type : null;
}

export function fishOutTypes(obj, types) {
  assert.assertObject(obj);
  assert.assertArray(types);
  let result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value && types.includes(typeOf(value))) {
      result[key] = value;
      delete obj[key];
    }
  }
  return result;
}

export function fishOutComplexConds(obj) {
  return fishOutTypes(obj, ["substring", "daterange", "id"]);
}

export function fishOutLabels(obj) {
  return Object.values(fishOutTypes(obj, ["label"])).map((x) => x.value);
}

function makeNeo4jLiteral(value) {
  assert.assert(value !== null);
  if (value && typeOf(value) === "datetime")
    return `datetime("${value.value}")`;
  if (value && typeOf(value) === "point")
    return `point({latitude: ${value.value.latitude}, longitude: ${value.value.longitude}})`;
  if (value && typeOf(value) === "password") return `"${value.value.hash}"`;
  if (typeof value.value === "number") return `${value.value}`;
  if (value && value.datetime) return "datetime()";
  return `"${value.value}"`;
}

export function now() {
  return { datetime: true };
}

function byId(n, id) {
  assert.assertString(n);
  assert.assertType(id, "number");
  return `id(${n}) = ${id}`;
}

export function matches(fieldValues, contains = true) {
  assert.assertObject(fieldValues);
  assert.assertBool(contains);
  return Object.entries(fieldValues)
    .filter(
      ([k, v]) =>
        k && v !== null && v !== undefined && Object.keys(v).length > 0,
    )
    .map(([n, fields]) =>
      Object.entries(fields)
        .map(([field, value]) => {
          switch (typeOf(value)) {
            case "substring":
              return `toLower(${n}.${field}) ${contains ? "CONTAINS" : "="} "${value.value.toLowerCase()}"`;
            case "daterange":
              return `datetime("${value.value.from}") <= ${n}.${field} <= datetime("${value.value.to}") `;
            case "id":
              return byId(n, value.value);
            default:
              throw new Error(
                `Unexpected value: ${value.value} of type ${typeOf(value)}`,
              );
          }
        })
        .join(" AND "),
    )
    .join(" AND ");
}

export function props(conditions) {
  assert.assertObject(conditions);
  assert.assert(
    Object.keys(fishOutTypes(conditions, ["daterange"])).length === 0,
    "Date ranges cannot be used in props, probably you meant matches()?",
  );
  for (const key of Object.keys(conditions)) {
    if (conditions[key] === null) delete conditions[key];
  }
  const labels = fishOutLabels(conditions);
  return (
    labels.map((label) => `:${label}`).join("") +
    (Object.keys(conditions).length
      ? " { " +
        Object.entries(conditions)
          .filter(([key, cond]) => !!key && cond !== null && cond !== undefined)
          .map(
            ([key, cond]) =>
              `${key === "password" ? "passwordHash" : key}: ${makeNeo4jLiteral(cond)}`,
          )
          .join(", ") +
        " }"
      : "")
  );
}

export async function rawQuery(query, resultHandler = (x) => x) {
  assert.assertString(query);
  let result = null;
  const session = driver.session();
  try {
    console.log(`Query built: ${query}`);
    result = await session
      .executeWrite((tx) => tx.run(query))
      .then(resultHandler)
      .catch((err) => {
        throw err;
      });
  } catch (e) {
    console.error(`Error during rawQuery(): ${e}`);
  } finally {
    await session.close();
    return result;
  }
}

export async function create(what, values) {
  assert.assertString(what);
  assert.assertObject(values);
  rawQuery(`CREATE (${what}${props(values)});`);
  return {};
}

export async function rawMatch(conditionsStr, options = {}) {
  assert.assertString(conditionsStr);
  assert.assertObject(options);
  if (options.where) assert.assertString(options.where);
  if (options.create) assert.assertString(options.create);
  if (options.remove) {
    assert.assertObject(options.remove);
    for (const [k, v] of Object.entries(options.remove)) assert.assertArray(v);
  }
  if (options.set) {
    assert.assertObject(options.set);
    for (const [k, v] of Object.entries(options.set)) assert.assertObject(v);
  }
  if (options.results) assert.assertArray(options.results);
  if (options.orderBy) assert.assertString(options.orderBy);
  if (options.limit) assert.assertString(options.limit);
  return rawQuery(
    `MATCH ${conditionsStr}` +
      (options.where ? "\nWHERE " + options.where : "") +
      (options.create ? "\nCREATE " + options.create : "") +
      (options.remove
        ? "\nREMOVE " +
          Object.entries(options.remove)
            .map(([k, v]) => v.map((x) => `${k} :${x}`).join(",\n\t"))
            .join(",\n\t")
        : "") +
      (options.set
        ? "\nSET " +
          Object.entries(options.set)
            .map(([k, v]) => {
              const labels = fishOutLabels(v);
              return labels
                .map((x) => `${k} :${x.value}`)
                .concat(
                  v
                    ? Object.entries(v)
                        .filter(
                          ([field, value]) =>
                            !["id", "daterange", null].includes(typeOf(value)),
                        )
                        .map(
                          ([field, value]) =>
                            `${k}.${field} = ${makeNeo4jLiteral(value)}`,
                        )
                    : [],
                )
                .join(",\n\t");
            })
            .join(",\n\t")
        : "") +
      (options.results ? "\nRETURN " + options.results.join(", ") : "") +
      (options.orderBy ? "\nORDER BY " + options.orderBy : "") +
      (options.limit ? "\nLIMIT " + options.limit : ""),
    (result) =>
      options.results
        ? result.records.map((record) => {
            let records = {};
            for (const r of options.results) {
              const key = r.includes(" AS ") ? r.split(" AS ")[1] : r;
              const tmp = record.get(key);
              records[key] =
                tmp && tmp.identity
                  ? {
                      ...tmp.properties,
                      labels: tmp.labels,
                      id: tmp.elementId,
                    }
                  : tmp;
            }
            return Object.keys(records).length > 1
              ? records
              : Object.values(records)[0];
          })
        : [],
  );
}

export async function match(what, conditions, options = {}) {
  assert.assertString(what);
  assert.assertObject(conditions);
  for (const key of Object.keys(conditions)) {
    if (conditions[key] === null) delete conditions[key];
  }
  const n = what.split(":")[0];
  const complexConds = fishOutComplexConds(conditions);
  if (Object.keys(complexConds).length > 0)
    options.where = `${matches({ [n]: complexConds })}${options.where ? " AND " + options.where : ""}`;
  if (options.results === undefined) options.results = [n];
  return rawMatch(`(${what}${props(conditions)})`, options);
}
