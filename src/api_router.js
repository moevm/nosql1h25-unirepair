import express from "express";
import * as assert from "./assert.js";
import { QueryScheme } from "./query_scheme.js";

class ApiRoute {
  constructor(scheme, handler) {
    assert.assertClass(scheme, QueryScheme);
    assert.assertFunction(handler);
    this.scheme = scheme;
    this.handler = handler;
  }

  async apply(rawQuery, prehandledState) {
    assert.assertObject(rawQuery);
    try {
      const query = this.scheme.applyScheme(rawQuery);
      console.log(
        `GET with query: ${JSON.stringify(rawQuery)} -> ${JSON.stringify(query)}`,
      );
      return await this.handler(query, prehandledState);
    } catch (error) {
      console.log(
        `=====================\nFailed to process query: ${error.stack}\nQuery was: ${JSON.stringify(rawQuery)}\n=====================`,
      );
      return { error: "Internal server error" };
    }
  }
}

export default class ApiRouter {
  constructor(apiName, routes) {
    assert.assertString(apiName);
    assert.assertObject(routes);
    let apiRoutes = {};
    for (const [route, handler] of Object.entries(routes)) {
      assert.assertString(route);
      assert.assertFunction(handler);
      const [name, scheme] = route.includes("/")
        ? route.split("/")
        : [route, ""];
      apiRoutes[name] = new ApiRoute(new QueryScheme(scheme), handler);
    }
    this.apiName = apiName;
    this.apiRoutes = apiRoutes;
  }

  async runTestQuery(query) {
    assert.assertString(query);
    let [path, params] = query.split("?");
    assert.assert(this.apiRoutes[path], `No such route: ${path}`);
    let queryObj = {};
    if (params) {
      for (const p of params.split("&")) {
        const [k, v] = p.split("=");
        queryObj[k] = v;
      }
    }
    return await this.apiRoutes[path].apply(queryObj);
  }

  toExpressRouter(isReady) {
    assert.assertFunction(isReady);
    const result = express.Router();
    for (const [name, route] of Object.entries(this.apiRoutes)) {
      result.get(`/${this.apiName}/${name}`, async (req, res) => {
        try {
          if (!isReady()) {
            console.log("Got a query, but the server is not ready yet");
            res.send({ error: "Server not ready" });
          } else {
            let answer = await route.apply(req.query);
            res.send(answer);
          }
        } catch (err) {
          console.error(
            `Error occured when proccessing route /${this.apiName}/${name}\nError: ${err}\nQuery: ${JSON.stringify(req.query)}`,
          );
          if (!res.headersSent) res.send({ error: "Internal server error" });
        }
      });
    }
    return result;
  }
}
