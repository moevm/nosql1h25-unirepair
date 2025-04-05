import driver from "./db.js";

const api_routes = {
  "test/id:int": ({ id }) => {
    return { hello: id };
  },
  "test2/a:int? b:uint? c:float? d:string e:bool?": ({ a, b, c, d, e }) => {
    return { a, b, c, d, e };
  },
};
export default api_routes;
