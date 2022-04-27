require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const rateLimiter = require("./v1/Middlewares/rateLimiter");

const app = express();
const server = require("http").Server(app);

const io = require("socket.io")(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3333",
      "https://portal.thesimpletech.com.br",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    domains: ["http://localhost:3000", "https://portal.thesimpletech.com.br"],
  })
);
app.use(morgan("dev"));
app.use(
  express.json({
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/api/v1/checkout/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(rateLimiter);
app.use("/files", express.static(path.resolve(__dirname, "..", "uploads")));

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/v1", require("./v1/Routes"));

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }

  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
  });
});

const PORT = process.env.PORT || 3333;

server.listen(PORT, () => {
  console.log(
    `⚡️ [server]: Server is running at https://localhost:${PORT} ⚡️`
  );
});
