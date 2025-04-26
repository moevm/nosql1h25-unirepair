import * as assert from "../assert.js";

function mismatchWithType(obj, type) {
  let range = { from: null, to: null };
  if (type.includes(".len=")) {
    let tmp = null;
    [type, tmp] = type.split(".len=");
    assert.assert(tmp.includes(";"));
    const [from, to] = tmp.split(";");
    range.from = from !== "" ? parseInt(from) : null;
    range.to = to !== "" ? parseInt(to) : null;
  }
  switch (type) {
    case "listOf":
    case "list":
      if (!Array.isArray(obj)) return `${typeof obj} is not list`;
      if (range.from !== null && obj.length < range.from)
        return `${obj.length} is below ${range.from}`;
      if (range.to !== null && obj.length > range.to)
        return `${obj.length} is over ${range.to}`;
      break;
    default:
      if (typeof obj !== type) return `${typeof obj} is not ${type}`;
      break;
  }
}

function mismatchWithPattern(obj, pattern) {
  if (pattern === undefined || pattern === null) return undefined;
  if (obj === undefined || obj === null) return "empty";
  const mismatchWithItem = function (item, type, pattern) {
    if (mismatchWithType(item, type)) return mismatchWithType(item, type);
    if (pattern && type.includes("listOf")) {
      let i = 0;
      for (const elem of item) {
        i += 1;
        if (mismatchWithPattern(elem, pattern))
          return `listOf[${i}] -> ${mismatchWithPattern(elem, pattern)}`;
      }
    } else if (pattern && mismatchWithPattern(item, pattern)) {
      return mismatchWithPattern(item, pattern);
    }
  };
  if (pattern && pattern.constructor === {}.constructor) {
    for (const [k, value] of Object.entries(pattern)) {
      let key = k;
      if (key.endsWith("?")) {
        key = key.slice(0, -1);
        if (obj[key.split(":")[0]] === null) continue;
      }
      if (!key.includes(":")) {
        if (mismatchWithPattern(obj[key], value))
          return `${key} -> ${mismatchWithPattern(obj[key], value)}`;
      } else {
        const [name, type] = key.split(":");
        const item = name === "" ? obj : obj[name];
        if (mismatchWithItem(item, type, value))
          return `${key} -> ${mismatchWithItem(item, type, value)}`;
      }
    }
  } else if (typeof pattern === "string") {
    if (!pattern.includes(":")) {
      if (!new RegExp(pattern).test(JSON.stringify(obj)))
        return `${JSON.stringify(obj)} NOT LIKE ${pattern}`;
    } else {
      const [type, test] = pattern.split(":");
      if (mismatchWithType(obj, type)) return mismatchWithType(obj, type);
      if (test && !new RegExp(test).test(JSON.stringify(obj)))
        return `${JSON.stringify(obj)} NOT LIKE ${pattern}`;
    }
  }
}

class TestRunner {
  constructor(name) {
    assert.assertString(name);
    this.name = name;
    this.fails = [];
  }

  check(condition, message) {
    if (!condition) {
      this.fails.push(`Check failed: ${message}\nat ${new Error().stack}`);
    }
  }

  match(obj, pattern) {
    const mismatch = mismatchWithPattern(obj, pattern);
    this.check(
      mismatch === undefined,
      `${JSON.stringify(obj)} \ndoes not match pattern\n${JSON.stringify(pattern)}\n *** Mismatch ***: ${JSON.stringify(mismatch)}\n`,
    );
  }

  finalize() {
    if (this.fails.length === 0) {
      console.log(`Test ${this.name} passed!`);
      return true;
    } else {
      console.log(`Test ${this.name} failed:`);
      for (const fail of this.fails) {
        console.log(fail);
      }
      return false;
    }
  }
}

export function unitTest(name, func) {
  assert.assertString(name);
  assert.assertFunction(func);
  return async () => {
    const runner = new TestRunner(name);
    await func(runner);
    return () => runner.finalize();
  };
}

export async function runUnitTests(tests) {
  assert.assertArray(tests);
  const results = [];
  for (const [name, test] of tests) {
    results.push(await unitTest(name, test)());
  }
  const totalTests = results.length;
  let successes = 0;
  for (const result of results) successes += result() ? 1 : 0;
  console.log(
    `A total of ${successes} tests passed, ${totalTests - successes} tests failed!`,
  );
}
