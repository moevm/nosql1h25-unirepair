import axios from "axios";

const BACKEND_PATH = "http://localhost:3000/api/";

function isDate(obj) {
  return (
    obj &&
    obj.year !== undefined &&
    obj.month !== undefined &&
    obj.day !== undefined &&
    obj.hour !== undefined &&
    obj.minute !== undefined &&
    obj.second !== undefined
  );
}

function stringifyDate(date) {
  if (!date || date.year === undefined) return "-";
  const pad = (num) => num.toString().padStart(2, "0");
  return `${pad(date.year)}-${pad(date.month)}-${pad(date.day)}T${pad(date.hour)}:${pad(date.minute)}:${pad(date.second)}`;
}

function stringifyDates(obj) {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    obj = obj.map(stringifyDates);
  } else if (typeof obj === "object") {
    if (isDate(obj)) {
      obj = stringifyDate(obj);
    } else {
      for (const [k, v] of Object.entries(obj)) {
        obj[k] = stringifyDates(v);
      }
    }
  }
  return obj;
}

async function query(handle, args = {}, orelse = undefined) {
  const params = Object.entries(args)
    .filter(
      ([k, v]) =>
        v !== undefined &&
        v !== null &&
        (typeof v !== "string" || v.trim() !== ""),
    )
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  console.log(`${BACKEND_PATH}${handle}?${decodeURIComponent(params)}`);
  const result = stringifyDates(
    (await axios.get(`${BACKEND_PATH}${handle}?${params}`)).data,
  );
  console.log(`Query result: ${JSON.stringify(result)}`);
  if (result && typeof result.error === "string") {
    console.log(`Query failed with: ${result.error}`);
    if (typeof orelse === "function") return await orelse(result.error);
    else if (orelse !== undefined) return orelse;
    else {
      alert(result.error);
      return null;
    }
  }
  return result;
}

export default query;
