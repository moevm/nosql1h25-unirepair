const tests = {
  "user_search?firstName=и&registeredAt=2022-10-10;2024-10-10": (result) => {
    if (!result || result.length === 0) {
      return "Expected some users to be returned!";
    }
    return "ok";
  },
  "brigade_reports?brigadeNumber=1": (result) => {
    if (
      !result ||
      result.complete_reports.length !== 1 ||
      result.incomplete_reports.length !== 1 ||
      result.new_reports.length !== 2
    ) {
      return "Expected 1 complete and 1 incomplete to be found for brigade 1";
    }
    return "ok";
  },
  "brigade_members?brigadeNumber=1": (result) => {
    if (!result || result.length !== 3)
      return `Expected 3 members in brigade 1, but got ${result.length} members`;
    return "ok";
  },
  [`auto_state?auto=${encodeURIComponent("Пожарная машина 5")}`]: (result) => {
    if (!result || !result.occupied)
      return "The auto is expected to be occupied, yet it is not";
    return "ok";
  },
  [`auto_state?auto=${encodeURIComponent("Пожарная машина 4")}`]: (result) => {
    if (!result || result.occupied)
      return "The auto is expected not to be occupied, yet it is";
    return "ok";
  },
};

export async function runTests(router) {
  let successCount = 0;
  let failureCount = 0;
  for (const [query, checker] of Object.entries(tests)) {
    const result = checker(await router.runTestQuery(query));
    if (result === "ok") {
      console.log("Test " + query + " passed!");
      successCount += 1;
    } else {
      console.error("Test " + query + ' failed with "' + result + '"');
      failureCount += 1;
    }
  }
  console.log(
    `A total of ${successCount} tests have passed, ${failureCount} tests have failed!`,
  );
}
