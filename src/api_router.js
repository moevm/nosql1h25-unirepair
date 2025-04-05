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

  apply(rawQuery) {
    assert.assertObject(rawQuery);
    const query = this.scheme.applyScheme(rawQuery);
    if (query.constructor === "".constructor) {
      console.log(
        `Failed to process query: ${query}\nQuery was: ${JSON.stringify(rawQuery)}`,
      );
      return null;
    }
    return this.handler(query);
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
      assert.assert(
        route.includes("/"),
        `Expected route in format <name>/<scheme>, got ${route}`,
      );
      const [name, scheme] = route.split("/");
      apiRoutes[name] = new ApiRoute(new QueryScheme(scheme), handler);
    }
    this.apiName = apiName;
    this.apiRoutes = apiRoutes;
  }

  toExpressRouter() {
    const result = express.Router();
    for (const [name, route] of Object.entries(this.apiRoutes)) {
      result.get(`/${this.apiName}/${name}`, (req, res) => {
        const answer = route.apply(req.query);
        res.send(answer);
      });
    }
    return result;
  }
}
