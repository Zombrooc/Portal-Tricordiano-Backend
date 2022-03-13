require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(cookieParser());
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(
  "/files",
  express.static(path.resolve(__dirname, "..", "tmp", "uploads"))
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

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "true");

  next()
}) 

app.use("/api/v1", require("./v1/Routes"));

const PORT = process.env.PORT || 3333;

server.listen(PORT, () => {
  console.log(
    `⚡️ [server]: Server is running at https://localhost:${PORT} ⚡️`
  );
});
