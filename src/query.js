import * as assert from "./assert.js";
import driver from "./db.js";

function makeNeo4jLiteral(value) {
  if (value && value.longitude && value.latitude)
    return `point({latitude: ${value.latitude}, longitude: ${value.longitude}})`;
  if (value && value.password && value.hash) return value.hash;
  return value;
}

export function props(conditions, labels = []) {
  assert.assertObject(conditions);
  assert.assertArray(labels);
  return (
    labels
      .filter((label) => label !== null)
      .map((label) => `:${label}`)
      .join("") +
    " { " +
    Object.entries(conditions)
      .filter(([key, cond]) => key !== null && cond !== null)
      .map(([key, cond]) => `${key}: "${makeNeo4jLiteral(cond)}"`)
      .join(", ") +
    " }"
  );
}

export async function create(value) {
  assert.assertString(value);
  const session = driver.session();
  try {
    const query = `CREATE (${value});`;
    await session.run(query).catch((err) => {
      throw err;
    });
  } finally {
    await session.close();
  }
}

export async function match(conditions, options = {}) {
  assert.assertString(conditions);
  assert.assertObject(options);
  if (options.where) assert.assertString(options.where);
  if (options.remove) {
    assert.assertObject(options.remove);
    for (const [k, v] of Object.entries(options.remove)) assert.assertArray(v);
  }
  if (options.set) {
    assert.assertObject(options.set);
    for (const [k, v] of Object.entries(options.set)) {
      assert.assert(v && (v.labels || v.props));
      if (v.labels) assert.assertArray(v.labels);
      if (v.props) assert.assertObject(v.props);
    }
  }
  if (options.results) assert.assertArray(options.results);
  if (options.orderBy) assert.assertString(options.orderBy);
  if (options.limit) assert.assertString(options.limit);

  const session = driver.session();
  let result = null;
  try {
    const query = `
      MATCH ${conditions}
      ${options.where ? "WHERE " + options.where : ""}
      ${
        options.remove
          ? "REMOVE " +
            Object.entries(options.remove)
              .map(([k, v]) => v.map((x) => `${k} :${x}`).join(",\n\t"))
              .join(",\n\t")
          : ""
      }
      ${
        options.set
          ? "SET " +
            Object.entries(options.set)
              .map(
                ([k, v]) =>
                  (v.labels
                    ? v.labels.map((x) => `${k} :${x}`).join(",\n\t")
                    : "") +
                  (v.props
                    ? Object.entries(v.props)
                        .map(
                          ([field, value]) =>
                            `${k}.${field} = ${makeNeo4jLiteral(value)}`,
                        )
                        .join(",\n\t")
                    : ""),
              )
              .join(",\n\t")
          : ""
      }
      ${options.results ? "RETURN [" + options.results.map((r) => `"${r}"`).join(", ") + "]" : ""}
      ${options.orderBy ? "ORDER BY " + options.orderBy : ""}
      ${options.limit ? "LIMIT " + options.limit : ""};
    `;
    result = await session
      .executeRead((tx) => tx.run(query))
      .then((result) =>
        options.results
          ? result.records.map((record) => {
              let records = [];
              for (const r of options.results)
                records.push(
                  record.get(r.includes(" AS ") ? r.split(" AS ")[1] : r),
                );
              return records;
            })
          : [],
      )
      .catch((err) => {
        throw err;
      });
  } catch (e) {
    console.error(`Error during match(): ${e}`);
  } finally {
    await session.close();
    return result;
  }
}
