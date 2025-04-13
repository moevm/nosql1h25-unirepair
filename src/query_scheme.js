import crypto from "crypto";
import * as assert from "./assert.js";

export class QueryParameter {
  constructor(rawParam) {
    assert.assertString(rawParam);
    assert.assert(
      /^([a-zA-Z_][a-zA-Z_0-9]*(:(int|uint|float|string|bool|point|password))?\??)$/.test(
        rawParam,
      ),
      `Wrong format of query scheme: ${rawParam}`,
    );
    const isOptional = rawParam.includes("?");
    if (isOptional) rawParam = rawParam.slice(0, -1);
    let [name, type] = rawParam.includes(":")
      ? rawParam.split(":")
      : [rawParam, "string"];
    this.name = name;
    this.type = type;
    this.isOptional = isOptional;
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
    for (const param of parameters) sampleObject[param.name] = null;
    this.parameters = parameters;
    this.sampleObject = sampleObject;
  }

  // Returns string with error text on failure
  applyScheme(query) {
    let result = { ...this.sampleObject };
    let keys = Object.keys(result);
    for (const [key, value] of Object.entries(query)) {
      if (!keys.includes(key)) return `Unknown parameter: ${key}`;
      const expectedType = this.parameters.find(
        (param) => param.name === key,
      ).type;
      switch (expectedType) {
        case "int": {
          const asInt = parseInt(value);
          if (isNaN(asInt) || !isFinite(asInt))
            return `${key} is expected to be int, but got ${value}`;
          result[key] = asInt;
          break;
        }
        case "uint": {
          const asInt = parseInt(value);
          if (isNaN(asInt) || !isFinite(asInt) || asInt < 0)
            return `${key} is expected to be uint, but got ${value}`;
          result[key] = asInt;
          break;
        }
        case "float": {
          const asFloat = parseFloat(value);
          if (isNaN(asFloat) || !isFinite(asFloat))
            return `${key} is expected to be float, but got ${value}`;
          result[key] = asFloat;
          break;
        }
        case "string": {
          const escapedChars = ["\\", '"', "\'"];
          let asStr = decodeURIComponent(value);
          for (const ec of escapedChars) asStr.replaceAll(ec, "\\" + ec);
          result[key] = asStr;
          break;
        }
        case "bool": {
          if (value !== "true" && value !== "false")
            return `${key} is expected to be bool, but got ${value}`;
          result[key] = value === "true";
          break;
        }
        case "point": {
          if (!value || !value.longitude || !value.latitude)
            return `${key} is expected to be point, but got ${value}`;
          result[key] = {
            longitude: value.longitude,
            latitude: value.latitude,
          };
          break;
        }
        case "password": {
          const escapedChars = ["\\", '"', "\'"];
          let asStr = decodeURIComponent(value);
          for (const ec of escapedChars) asStr.replaceAll(ec, "\\" + ec);
          result[key] = {
            password: asStr,
            hash: crypto.createHash("sha256").update(value).digest("hex"),
          };
          break;
        }
      }
    }
    for (const p of this.parameters) {
      if (!p.isOptional && result[p.name] === null)
        return `Required parameter ${p.name} of type ${p.type} not found in the query`;
    }
    return result;
  }
}
