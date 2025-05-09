import crypto from "crypto";
import * as assert from "./assert.js";
import { raw } from "express";

function isISODateTime(value) {
  if (typeof value !== "string") return false;
  if (
    /^\d{4}-(0[1-9]|10|11|12)-(0[1-9]|[12]\d|30|31)(T[0-2]\d:[0-5]\d(:[0-5]\d(\.\d+)?Z?)?)?$/.test(
      value,
    ) === false
  )
    return false;
  return !isNaN(new Date(value).valueOf());
}

export function parseValue(expectedType, key, value) {
  assert.assertString(expectedType);
  assert.assertString(key);
  assert.assertString(value);
  switch (expectedType) {
    case "int": {
      const asInt = parseInt(value);
      if (isNaN(asInt) || !isFinite(asInt))
        throw new Error(`${key} is expected to be int, but got ${value}`);
      return asInt;
    }
    case "id":
    case "uint": {
      const asInt = parseInt(value);
      if (isNaN(asInt) || !isFinite(asInt) || asInt < 0)
        throw new Error(`${key} is expected to be uint, but got ${value}`);
      return asInt;
    }
    case "float": {
      const asFloat = parseFloat(value);
      if (isNaN(asFloat) || !isFinite(asFloat))
        throw new Error(`${key} is expected to be float, but got ${value}`);
      return asFloat;
    }
    case "substring":
    case "string":
    case "label": {
      let asStr = decodeURIComponent(value).trim();
      if (asStr.length === 0)
        throw new Error(
          `${key} is expected to be ${expectedType}, but got an empty value "", which is not allowed`,
        );
      const escapedChars = ["\\", '"', "\'"];
      for (const ec of escapedChars) asStr = asStr.replaceAll(ec, "\\" + ec);
      return asStr;
    }
    case "bool": {
      if (value !== "true" && value !== "false")
        throw new Error(`${key} is expected to be bool, but got ${value}`);
      return value === "true";
    }
    case "point": {
      if (!value || !value.includes(";"))
        throw new Error(`${key} is expected to be point, but got ${value}`);
      const [latitude, longitude] = value.split(";").map(parseFloat);
      if (
        isNaN(longitude) ||
        !isFinite(longitude) ||
        isNaN(latitude) ||
        !isFinite(latitude)
      )
        throw new Error(`${key} is expected to be point, but got ${value}`);
      return { longitude, latitude };
    }
    case "password": {
      const escapedChars = ["\\", '"', "\'"];
      let asStr = decodeURIComponent(value);
      for (const ec of escapedChars) asStr.replaceAll(ec, "\\" + ec);
      return {
        password: asStr,
        hash: crypto.createHash("sha256").update(value).digest("hex"),
      };
    }
    case "datetime": {
      if (!isISODateTime(value))
        throw new Error(
          `${key} is expected to be ISO datetime, but got ${value}`,
        );
      return value;
    }
  }
}

export class QueryParameter {
  constructor(rawParam) {
    assert.assertString(rawParam);
    assert.assert(
      /^([a-zA-Z_][a-zA-Z_0-9]*(:((int|uint|float|id|substring|string|label|bool|point|password|datetime)((\.\.)|(\[\]))?))?(\?(=(\d+|"[^"]+"))?)?)$/.test(
        rawParam,
      ),
      `Wrong format of query scheme: ${rawParam}`,
    );
    const hasDefaultValue = rawParam.includes("=");
    const isOptional = rawParam.includes("?");
    let defaultValue = null;
    if (hasDefaultValue) {
      [rawParam, defaultValue] = rawParam.split("=");
      if (defaultValue.startsWith('"'))
        defaultValue = defaultValue.slice(1, -1);
    }
    if (isOptional) rawParam = rawParam.slice(0, -1);
    const isArray = rawParam.endsWith("[]");
    if (isArray) rawParam = rawParam.slice(0, -2);
    const isRange = rawParam.endsWith("..");
    if (isRange) rawParam = rawParam.slice(0, -2);
    assert.assert(
      !isArray || !isRange,
      "Parameter cannot be both array and range",
    );
    let [name, type] = rawParam.includes(":")
      ? rawParam.split(":")
      : [rawParam, "substring"];
    if (hasDefaultValue) {
      assert.assert(
        isOptional,
        `Parameter ${rawParam} has default value, so must be optional, but it is not`,
      );
    }
    if (isRange)
      assert.assertOneOf(type, ["int", "uint", "float", "id", "datetime"]);
    this.name = name;
    this.type = type;
    this.isOptional = isOptional;
    this.isRange = isRange;
    this.isArray = isArray;
    this.defaultValue = defaultValue;
  }
}

export class QueryScheme {
  constructor(rawParametersStr) {
    assert.assertString(rawParametersStr);
    const rawParameters =
      rawParametersStr === "" ? [] : rawParametersStr.split(" ");
    let parameters = [];
    for (const rawParam of rawParameters)
      parameters.push(new QueryParameter(rawParam));
    let sampleObject = {};
    for (const param of parameters)
      sampleObject[param.name] = param.defaultValue
        ? { value: param.defaultValue, type: param.type }
        : null;
    this.parameters = parameters;
    this.sampleObject = sampleObject;
  }

  // Returns string with error text on failure
  applyScheme(query) {
    let result = { ...this.sampleObject };
    let keys = Object.keys(result);
    for (const [key, value] of Object.entries(query)) {
      if (!keys.includes(key)) throw new Error(`Unknown parameter: ${key}`);
      const param = this.parameters.find((param) => param.name === key);
      if (param.isArray) {
        result[key] = {
          values: value.split(",").map((v) => parseValue(param.type, key, v)),
          type: param.type,
        };
      } else if (!param.isRange || !value.includes(";")) {
        result[key] = {
          value: parseValue(param.type, key, value),
          type: param.type,
        };
      } else {
        const [from, to] = value.split(";");
        result[key] = {
          from: from ? parseValue(param.type, key, from) : null,
          to: to ? parseValue(param.type, key, to) : null,
          type: param.type,
        };
      }
    }
    for (const p of this.parameters) {
      if (!p.isOptional && result[p.name] === null)
        throw new Error(
          `Required parameter ${p.name} of type ${p.type} not found in the query`,
        );
    }
    return result;
  }
}
