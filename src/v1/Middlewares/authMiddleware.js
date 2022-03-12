require("dotenv").config();
const jwt = require("jsonwebtoken");
const fs = require("fs");

const authToken = process.env.SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ error: "Nenhum token fornecido" });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res.status(401).send({ error: "Token Error" });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).send({ error: "Token não formatado" });
  }

  jwt.verify(token, authToken, function (err, decoded) {
    if (err) {
      return res.status(401).send({ error: "Token Invalido" });
    }

    req.userID = decoded.id;
    return next();
  });
};

module.exports = authMiddleware;
