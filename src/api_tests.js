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
      result.new_reports.length !== 0
    ) {
      return "Expected 1 complete and 1 incomplete to be found for brigade 1";
    }
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
