const microrouter = require("../src/microrouter");

it("microrouter должен экспортировать функцию", () => {
  expect(typeof microrouter).toBe("function");
});

describe("microrouter", () => {
  it("works with async request", () => {
    const router = microrouter();
    router.get("foo/bar", (req, res, next) => {
      req.log.push("async req1");
      next();
    });
    router.get("foo/bar", (req, res, next) => {
      req.log.push("async req2");
      next();
    });
    const [req] = router.middleware()(
      {
        method: "GET",
        url: "foo/bar",
        log: []
      },
      "res",
      () => {}
    );
    expect(req.log).toEqual(["async req1", "async req2"]);
  });

  it("works with sync request", () => {
    const router = microrouter();
    router.get("foo/bar/:some", req => {
      req.log.push("sync req1");
    });
    router.get("foo/bar/:other", req => {
      req.log.push("sync req2");
    });
    const [req] = router.middleware()(
      {
        method: "GET",
        url: "foo/bar/baz",
        log: []
      },
      "res",
      () => {}
    );
    expect(req.log).toEqual(["sync req1", "sync req2"]);
  });

  it("handles 404", () => {
    const router = microrouter();
    router.get("foo/bar", req => {
      req.log.push("sync req1");
    });
    const [, res] = router.middleware()(
      {
        method: "GET",
        url: "non/existing",
        log: []
      },
      {},
      () => {}
    );
    expect(res.statusCode).toBe(404);
  });

  it("handles 404 if empty", () => {
    const router = microrouter();
    const [, res] = router.middleware()(
      {
        method: "GET",
        url: "non/existing",
        log: []
      },
      {},
      () => {}
    );
    expect(res.statusCode).toBe(404);
  });

  it("handles async error", async () => {
    let resolve;
    const promise = new Promise(r => {
      resolve = r;
    });
    const router = microrouter();
    const error = new Error();
    router.post("foo/bar", (req, res, next) => {
      setTimeout(() => {
        next(error);
        resolve();
      }, 0);
    });
    const func2 = jest.fn();
    const next = jest.fn();
    router.post("foo/bar", func2);
    router.middleware()(
      {
        method: "POST",
        url: "foo/bar"
      },
      {},
      next
    );
    await promise;
    expect(func2).not.toBeCalled();
    expect(next).toBeCalledWith(error);
  });
});
