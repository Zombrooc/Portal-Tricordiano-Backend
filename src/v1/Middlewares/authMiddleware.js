require("dotenv").config();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const createError = require('http-errors')
const asyncHandler = require("express-async-handler");

const authToken = process.env.SECRET;

const authMiddleware = asyncHandler( async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw createError(401, "Nenhum token fornecido");
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    throw createError(401, "Token error");
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    throw createError(401, "Token não formatado");
  }

  jwt.verify(token, authToken, function (err, decoded) {
    if (err) {
      throw createError(401, "Token Invalido");
    }

    req.userID = decoded.id;
    return next();
  });
});

module.exports = authMiddleware;
