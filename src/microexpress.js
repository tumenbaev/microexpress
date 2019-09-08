const identity = a => a;
const end = () => {};

module.exports = () => {
  let chain = identity;
  let errorChain = identity;

  const wrapNext = (req, res, next) => error => {
    if (error) {
      errorChain(end)(req, res, error);
    } else {
      next(req, res, next);
    }
  };

  function use(middleware) {
    if (middleware.length <= 3) {
      const localChain = chain;
      chain = next =>
        localChain((req, res) => {
          const wrappedNext = wrapNext(req, res, next);
          return middleware(req, res, wrappedNext);
        });
    } else {
      const localChain = errorChain;
      errorChain = next =>
        localChain((req, res, error) => {
          const wrappedNext = wrapNext(req, res, next);
          return middleware(error, req, res, wrappedNext);
        });
    }
  }

  function handler() {
    return (req, res) => {
      try {
        chain(end)(req, res);
      } catch (error) {
        errorChain(end)(req, res, error);
      }
      return req;
    };
  }

  return {
    use,
    handler
  };
};
