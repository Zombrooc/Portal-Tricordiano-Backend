require("dotenv").config();
const { compareSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const createError = require('http-errors')

const validateCPF = require("../services/cpfUtils");
const ageCalc = require("../services/birthDateUtils");
const { verificationEmail, forgotPassword } = require("../services/mailing");
// const FileUtils = require('../services/fileUtils');
const authConfig = process.env.SECRET;
const User = require("../Models/User");

module.exports = {

  async store(req, res, next) {
    const { name, email, password } = req.body;

    const username = email.split("@")[0];


    if ((await User.findOne({ email })) || (await User.findOne({ username }))) {
      throw createError(400, "Esse usuário já existe.");
    }

    try {
      const validationToken = crypto.randomBytes(35).toString("hex");

      const newUser = await User.create({
        username,
        name,
        email,
        password,
        validationToken,
      });

      const id = newUser.id;

      const token = jwt.sign({ id }, authConfig, {
        expiresIn: process.env.EXPIRES_IN || "1d",
      });

      await verificationEmail(newUser.name, newUser.email, validationToken);

      return res.send({
        userId: newUser.id,
        name: newUser.name,
        token: token,
      });
    } catch (error) {
      next(error);
    }
  },
  async authenticate(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select(`+password`);

    if (!user) {
      return res.status(404).send({
        message: "Nenhum usuário cadastrado com esse E-mail",
        field: "email",
      });
    }

    if (!(await compareSync(password, user.password))) {
      return res.status(403).send({
        message: "Senha incorreta",
        field: "password",
      });
    }

    const id = user.id;
    // var privateKey = fs.readFileSync(process.env.PRIVATE, "utf8");
    const token = jwt.sign({ id }, authConfig, {
      expiresIn: process.env.EXPIRES_IN || "1d",
    });

    return res.send({
      user,
      token,
    });
  },
  async show(req, res) {
    const user = await User.findById(req.userID);

    return res.status(200).send(user);
  },
  async update(req, res) {
    const done = await User.findByIdAndUpdate(req.userID, {
      $set: {
        ...req.body,
        updatedAt: new Date(),
      },
    });

    return res.status(200).send();
  },
  async forgotPass(req, res) {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({
        field: "email",
        message: "Nenhum usuário com esse e-mail foi encontrado",
      });
    }

    const token = crypto.randomBytes(35).toString("hex");

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });

    await forgotPassword(email, validationToken).catch((error) => {
      return res.send(error);
    });
  },
  async resetPass(req, res) {
    const { email, password, token } = req.body;

    const user = await User.findOne({ email }).select(
      "+passwordResetToken passwordResetExpires"
    );

    if (token !== user.passwordResetToken) {
      return res.status(400).send({ error: "Token Inválido " });
    }

    const now = new Date();

    if (now > user.passwordResetExpires) {
      return res.status(400).send({ error: " O token expirou " });
    }

    user.password = password;
    user.updatedAt = now;

    await user.save();

    return res.send({ done: "Senha alterada com sucesso" });
  },
  async sendValidationEmail(req, res) {
    const userID = req.userID;

    const user = await User.findById(userID);

    await verificationEmail(user.name, user.email, async () => {
      const token = crypto.randomBytes(35).toString("hex");

      user.validation_token = token;
      await user.save();

      return token;
    });
  },
  async validateEmail(req, res) {
    const { token } = req.body;

    const user = await User.findOne({ validationToken: token });

    if (!user) {
      return res.status(404).send({
        field: "token",
        message: "Token inválido",
      });
    }

    user.validationToken = null;
    user.confirmed = true;
    await user.save();

    return res.send({ done: "E-mail validado com sucesso" });
  },
};
