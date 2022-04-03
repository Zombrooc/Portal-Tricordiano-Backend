require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const compression = require('compression')

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(compression());
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(
  "/files",
  express.static(path.resolve(__dirname, "..", "tmp", "uploads"), {
    maxAge: "7d",
  })
);

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

// app.use((error, req, res, next) => {
//   if (error.status) {
//     res.status(error.status);
//   } else {
//     res.status(500);
//   }

//   res.json({
//     message: error.message,
//     stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
//   });
// });

const PORT = process.env.PORT || 3333;

server.listen(PORT, () => {
  console.log(
    `⚡️ [server]: Server is running at https://localhost:${PORT} ⚡️`
  );
});
