import * as assert from "../assert.js";

function matchType(obj, type) {
  switch (type) {
    case "listOf":
    case "list":
      return Array.isArray(obj);
    default:
      return typeof obj === type;
  }
}

function matchesPattern(obj, pattern) {
  if (pattern === undefined || pattern === null) return true;
  if (obj === undefined || obj === null) return false;
  const matchItem = function (item, type, pattern) {
    if (!matchType(item, type)) return false;
    if (pattern && type === "listOf") {
      for (const elem of item) {
        if (!matchesPattern(elem, pattern)) return false;
      }
    } else if (pattern && !matchesPattern(item, pattern)) {
      return false;
    }
    return true;
  };
  if (pattern && pattern.constructor === {}.constructor) {
    for (const [k, value] of Object.entries(pattern)) {
      let key = k;
      if (key.endsWith("?")) {
        key = key.slice(0, -1);
        if (obj[key.split(":")[0]] === null) continue;
      }
      if (!key.includes(":")) {
        if (!matchesPattern(obj[key], value)) return false;
      } else {
        const [name, type] = key.split(":");
        const item = name === "" ? obj : obj[name];
        if (!matchItem(item, type, value)) return false;
      }
    }
  } else if (typeof pattern === "string") {
    if (!pattern.includes(":")) {
      if (!new RegExp(pattern).test(JSON.stringify(obj))) return false;
    } else {
      const [type, test] = pattern.split(":");
      if (!matchType(obj, type)) return false;
      if (test && !new RegExp(test).test(JSON.stringify(obj))) return false;
    }
  }
  return true;
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
    this.check(
      matchesPattern(obj, pattern),
      `${JSON.stringify(obj)} \ndoes not match pattern\n${JSON.stringify(pattern)}`,
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
