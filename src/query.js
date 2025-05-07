import * as assert from "./assert.js";
import driver from "./db.js";

function optcat(prefix, value) {
  return value !== null && value !== undefined && value !== ""
    ? `${prefix}${value}`
    : "";
}

function optpostcat(value, postfix) {
  return value !== null && value !== undefined && value !== ""
    ? `${value}${postfix}`
    : "";
}

function typeOf(value) {
  return value ? value.type : null;
}

function isRange(value) {
  return value && value.from !== undefined && value.to !== undefined;
}

export function fishOut(obj, pred) {
  assert.assertObject(obj);
  assert.assertFunction(pred);
  let result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (pred({ k, v })) {
      result[k] = v;
      delete obj[k];
    }
  }
  return result;
}

export function fishOutTypes(obj, types) {
  assert.assertArray(types);
  return fishOut(obj, ({ v }) => v !== null && types.includes(typeOf(v)));
}

function fishOutRanges(obj) {
  return fishOut(obj, ({ v }) => isRange(v));
}

export function fishOutComplexConds(obj) {
  return { ...fishOutTypes(obj, ["substring", "id"]), ...fishOutRanges(obj) };
}

export function fishOutLabels(obj) {
  return Object.values(fishOutTypes(obj, ["label"])).map((x) => x.value);
}

function makeNeo4jLiteral(value) {
  assert.assert(value !== null);
  assert.assert(!isRange(value));
  if (value && typeOf(value) === "datetime")
    return value.value === "none" ? "datetime()" : `datetime("${value.value}")`;
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

export function makeLabel(l) {
  return { value: l, type: "label" };
}

function byId(n, id) {
  assert.assertString(n);
  assert.assertType(id, "number");
  return `id(${n}) = ${id}`;
}

export function matches(fieldValues, contains = true) {
  assert.assertObject(fieldValues);
  assert.assertBool(contains);
  console.log(JSON.stringify(fieldValues));
  return Object.entries(fieldValues)
    .filter(
      ([k, v]) =>
        k && v !== null && v !== undefined && Object.keys(v).length > 0,
    )
    .map(([n, fields]) =>
      Object.entries(fields)
        .filter(
          ([field, value]) =>
            value && (value.from !== null || value.to !== null),
        )
        .map(([field, value]) => {
          if (isRange(value)) {
            switch (typeOf(value)) {
              case "int":
              case "uint":
              case "float":
                return `${optpostcat(value.from, " <= ")}${n}.${field}${optcat(" <= ", value.to)}`;
              case "datetime":
                return `${value.from ? `datetime("${value.from}") <= ` : ""}${n}.${field}${value.to ? ` <= datetime("${value.to}")` : ""}`;
              case "id":
                return `${optpostcat(value.from, " <= ")}id(${n})${optcat(" <= ", value.to)}`;
              default:
                throw new Error(
                  `Unexpected value range: ${value.from}..${value.to} of type ${typeOf(value)}`,
                );
            }
          } else {
            switch (typeOf(value)) {
              case "substring":
                return `toLower(${n}.${field}) ${contains ? "CONTAINS" : "="} "${value.value.toLowerCase()}"`;
              case "id":
                return `id(${n}) = ${value.value}`;
              default:
                throw new Error(
                  `Unexpected value: ${value.value} of type ${typeOf(value)}`,
                );
            }
          }
        }),
    )
    .flat()
    .join(" AND ");
}

export function props(conditions) {
  assert.assertObject(conditions);
  assert.assert(
    Object.keys(fishOutRanges(conditions)).length === 0,
    "Ranges cannot be used in props, probably you meant matches()?",
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
  assert.assert(what.includes(":"));
  const key = what.split(":")[0];
  return await rawQuery(
    `CREATE (${what}${props(values)}) RETURN ${key};`,
    (result) =>
      result.records.map((record) => {
        const tmp = record.get(key);
        return tmp && tmp.identity !== undefined
          ? {
              ...tmp.properties,
              labels: tmp.labels,
              id: tmp.elementId,
            }
          : tmp;
      })[0],
  );
}

export async function rawMatch(conditionsStr, options = {}) {
  assert.assertString(conditionsStr);
  assert.assertObject(options);
  if (options.match) assert.assertString(options.match);
  if (options.where) assert.assertString(options.where);
  if (options.create) assert.assertString(options.create);
  if (options.detach) assert.assertString(options.detach);
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
  const result = await rawQuery(
    `MATCH ${conditionsStr}` +
      optcat("\nMATCH ", options.match) +
      optcat("\nWHERE ", options.where) +
      optcat("\nCREATE ", options.create) +
      optcat("\nDETACH DELETE ", options.detach) +
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
                .map((x) => `${k} :${x}`)
                .concat(
                  v
                    ? Object.entries(v)
                        .filter(
                          ([field, value]) =>
                            !["id", null].includes(typeOf(value)) &&
                            !isRange(value),
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
      optcat("\nORDER BY ", options.orderBy) +
      optcat("\nLIMIT ", options.limit),
    (result) =>
      options.results
        ? result.records.map((record) => {
            let records = {};
            for (const r of options.results) {
              const key = r.includes(" AS ") ? r.split(" AS ")[1] : r;
              const tmp = record.get(key);
              records[key] =
                tmp && tmp.identity !== undefined
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
  if (options.orelse !== undefined && (!result || result.length === 0)) {
    if (typeof options.orelse === "function") return await options.orelse();
    return options.orelse;
  }
  if (options.then) {
    if (typeof options.then === "function") return await options.then(result);
    return options.then;
  }
  return result;
}

export async function match(what, conditions, options = {}) {
  assert.assertString(what);
  assert.assertObject(conditions);
  for (const key of Object.keys(conditions)) {
    if (conditions[key] === null) delete conditions[key];
  }
  const n = what.split(":")[0];
  const complexConds = fishOutComplexConds(conditions);
  fishOutTypes(conditions, ["password"]);
  if (
    Object.values(complexConds).filter(
      (val) => val.from !== null || val.to !== null,
    ).length > 0
  )
    options.where = `${matches({ [n]: complexConds })}${optcat(" AND ", options.where)}`;
  if (options.results === undefined && options.detach === undefined)
    options.results = [n];
  return await rawMatch(`(${what}${props(conditions)})`, options);
}

export async function matchOne(what, conditions, options = {}) {
  if (
    options.orelse === undefined &&
    (options.results !== undefined || options.detach === undefined)
  )
    options.orelse = () =>
      assert.assert(false, "Got empty result in matchOne function");
  if (typeof options.then === "function") {
    const prevthen = options.then;
    options.then = async (rs) => await prevthen(rs[0]);
  } else if (options.then === undefined) {
    options.then = (rs) => rs[0];
  }
  return await match(what, conditions, options);
}

export async function createIfNotExists(what, values, options = {}) {
  return await matchOne(
    what,
    options.searchBy ? { ...options.searchBy } : { ...values },
    {
      orelse: async () => await create(what, values),
      then: options.orelse ? options.orelse : (x) => null,
    },
  );
}
