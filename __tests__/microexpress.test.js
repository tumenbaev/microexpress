const microexpress = require("../src/microexpress");

it("microexpress должен экспортировать функцию", () => {
  expect(typeof microexpress).toBe("function");
});

describe("microexpress", () => {
  it("works with 1 middleware", () => {
    const app = microexpress();
    app.use((req, res, next) => {
      req.log.push("test 1");
      next();
    });
    const res = app.handler()({ log: [] }, "res");
    expect(res.log).toEqual(["test 1"]);
  });

  it("works with 2 middlewares", () => {
    const app = microexpress();
    app.use((req, res, next) => {
      req.log.push("test 1");
      next();
    });
    app.use((req, res, next) => {
      req.log.push("test 2");
      next();
    });
    const res = app.handler()({ log: [] }, "res");
    expect(res.log).toEqual(["test 1", "test 2"]);
  });

  it("works with async error middleware", () => {
    const app = microexpress();
    app.use((req, res, next) => {
      req.log.push("test 1");
      next("error");
    });
    app.use((error, req, res, next) => {
      req.log.push(error);
      next();
    });
    const res = app.handler()({ log: [] }, "res");
    expect(res.log).toEqual(["test 1", "error"]);
  });

  it("works with sync error middleware", () => {
    const app = microexpress();
    app.use(req => {
      req.log.push("test 1");
      throw new Error("error");
    });
    app.use((error, req, res, next) => {
      req.log.push(error.message);
      next();
    });
    const res = app.handler()({ log: [] }, "res");
    expect(res.log).toEqual(["test 1", "error"]);
  });
});
