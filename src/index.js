const http = require("http");
const bodyParser = require("body-parser");
const microExpress = require("./microexpress");
const microRouter = require("./microrouter");

const app = microExpress();
const router = microRouter();
const server = http.createServer(app.handler());

router.get("/hello", (req, res) => {
  res.end(JSON.stringify({ success: true, message: "hello" }));
});

router.get("/hello/:name", (req, res) => {
  res.end(
    JSON.stringify({ success: true, message: `hello ${req.params.name}` })
  );
});

router.post("/hello", (req, res, next) => {
  setTimeout(() => {
    res.end(
      JSON.stringify({ success: true, message: `hello ${req.body.name}` })
    );
    next();
  }, 500);
});

app.use((err, req, res, next) => {
  global.console.error("We found an error", err.toString(), req.uniqId);
  next();
});

let counter = 1;
app.use((req, res, next) => {
  req.uniqId = counter;
  counter += 1;
  next();
});

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("content-type", "application/json");
  next();
});

app.use(router.middleware());

app.use((err, req, res, next) => {
  if (!res.headersSent) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        success: false,
        error: err.toString(),
        stack: process.env.NODE_ENV !== "production" ? err.stack : undefined
      })
    );
  }
  next();
});

server.listen(process.env.PORT || 3000);
