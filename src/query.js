import * as assert from "./assert.js";
import driver from "./db.js";

export async function match(conditions, results, options = {}) {
  assert.assertString(conditions);
  assert.assertObject(options);
  if (options.orderBy) assert.assertString(options.orderBy);
  if (options.limit) assert.assertString(options.limit);
  const session = driver.session();
  try {
    const query = `
      MATCH ${conditions}
      RETURN ${results.join(", ")}
      ${options.orderBy ? "ORDER BY " + options.orderBy : ""}
      ${options.limit ? "LIMIT " + options.limit : ""};
    `;
    return await session
      .executeRead((tx) => tx.run(query))
      .then((result) =>
        result.records.map((record) => {
          let records = [];
          for (const r of results) records.push(record.get(r));
          return records;
        }),
      )
      .catch((err) => {
        throw err;
      });
  } finally {
    await session.close();
  }
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
      .map(([key, cond]) => `${key}: "${cond}"`)
      .join(", ") +
    " }"
  );
}
