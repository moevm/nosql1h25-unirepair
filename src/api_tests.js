const tests = {
  "user_search?firstName=и&registeredAt=2024-10-10;2025-10-10": (result) => {
    if (!result || result.length === 0) {
      return "Expected some users to be returned!";
    }
    return "ok";
  },
};

export function runTests(router) {
  for (const [query, checker] of Object.entries(tests)) {
    const result = checker(router.runTestQuery(query));
    if (result === "ok") {
      console.log("Test " + query + " passed!");
    } else {
      console.error("Test " + query + ' failed with "' + result + '"');
    }
  }
}
