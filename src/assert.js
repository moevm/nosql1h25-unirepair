export function assert(condition, message = "") {
  if (!condition)
    console.log(`Assertion failed: ${message} at\n ${new Error().stack}`);
}

export function assertEq(a, b, message = "") {
  assert(a === b, `${a} not equals ${b}; ${message}`);
}

export function assertNeq(a, b, message = "") {
  assert(a !== b, `${a} equals ${b}; ${message}`);
}

export function assertOneOf(a, arr, message = "") {
  assert(arr.includes(a), `${a} is not in ${arr}; ${message}`);
}

export function assertType(a, type, message = "") {
  assert(typeof a === type, `${a} is not of type ${type}; ${message}`);
}

export function assertClass(a, type, message = "") {
  assert(
    a && a.constructor === type,
    `${a} is not instance of ${type.name}; ${message}`,
  );
}

export function assertArray(a, message = "") {
  assert(Array.isArray(a), `${a} is not Array; ${message}`);
}

export function assertString(a, message = "") {
  assert(
    a && a.constructor === "".constructor,
    `${a} is not String; ${message}`,
  );
}

export function assertObject(a, message = "") {
  assert(
    a && a.constructor === {}.constructor,
    `${a} is not Object; ${message}`,
  );
}

export function assertBool(a, message = "") {
  assert(a === true || a === false, `${a} is not Boolean; ${message}`);
}

export function assertFunction(a, message = "") {
  assert(typeof a === "function", `${a} is not Function; ${message}`);
}
