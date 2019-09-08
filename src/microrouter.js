const UrlPattern = require("url-pattern");

const identity = a => a;

module.exports = () => {
  const wrapHandler = (handler, req, res, next) => e => {
    if (e) {
      next(e);
    } else {
      handler(req, res, next);
    }
  };

  function makeChain() {
    let chain = identity;

    function chainHandler(url, handler) {
      const pattern = new UrlPattern(url);
      const handlerIsSync = handler.length < 3;
      if (handlerIsSync) {
        const localChain = chain;
        chain = nextHandler =>
          localChain((req, res) => {
            const params = pattern.match(req.url);
            if (params) {
              req.params = params;
              handler(req, res);
            }
            nextHandler(req, res);
          });
      } else {
        const localChain = chain;
        chain = nextHandler =>
          localChain((req, res, next) => {
            const params = pattern.match(req.url);
            if (params) {
              req.params = params;
              handler(req, res, wrapHandler(nextHandler, req, res, next));
            } else {
              nextHandler(req, res, next);
            }
          });
      }
    }

    return [() => chain, chainHandler];
  }

  const [chainGet, get] = makeChain();
  const [chainPost, post] = makeChain();

  function middleware() {
    return (request, response, next) => {
      function final() {
        if (!request.params) {
          response.statusCode = 404;
          response.end();
          next(new Error("not found"));
        }
        next();
      }

      try {
        if (request.method === "GET") {
          chainGet()(final)(request, response, next);
        }
        if (request.method === "POST") {
          chainPost()(final)(request, response, next);
        }
      } catch (error) {
        next(error);
      }
      return [request, response];
    };
  }

  return {
    get,
    post,
    middleware
  };
};
