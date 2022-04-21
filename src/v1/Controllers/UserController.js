require("dotenv").config();
const { compareSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
// const createError = require("http-errors");

const validateCPF = require("../services/cpfUtils");
// const ageCalc = require("../services/birthDateUtils");
const { verificationEmail, forgotPassword } = require("../services/mailing");
// const FileUtils = require('../services/fileUtils');
const authConfig = process.env.SECRET;
const User = require("../Models/User");

module.exports = {
  async store(req, res, next) {
    const { name, email, password, cpf } = req.body;

    console.log(cpf);

    const username = email.split("@")[0];

    if ((await User.findOne({ email })) || (await User.findOne({ username }))) {
      return res
        .status(400)
        .send({ error: "Esse usuário já existe.", field: "email" });
    }

    if (await User.findOne({ cpf })) {
      return res
        .status(400)
        .send({ error: "Esse CPF já existe.", field: "cpf" });
    }

    if (!validateCPF(cpf)) {
      return res
        .status(400)
        .send({ error: "Esse CPF não é válido.", field: "cpf" });
    }

    try {
      const validationToken = crypto.randomBytes(35).toString("hex");

      const newUser = await User.create({
        username,
        name,
        email,
        cpf,
        password,
        validationToken,
      });

      const id = newUser.id;

      const token = jwt.sign({ id }, authConfig, {
        expiresIn: process.env.EXPIRES_IN || "1d",
      });

      await verificationEmail(newUser.name, newUser.email, validationToken);

      return res.send({
        user: newUser,
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
      return res
        .status(400)
        .send({ error: "Usuário não encontrado", field: "email" });
    }

    if (!(await compareSync(password, user.password))) {
      return res
        .status(400)
        .send({ error: "Senha incorreta", field: "password" });
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
      // User not found response
      return res.status(400).send({ error: "Usuário não encontrado" });
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

    if (user.confirmed) {
      // User already confirmed response
      return res.status(400).send({ error: "Usuário já confirmado" });
    }

    await verificationEmail(user.name, user.email, async () => {
      const token = crypto.randomBytes(35).toString("hex");

      user.validation_token = token;
      await user.save();

      return token;
    });
  },
  async validateEmail(req, res) {
    const { token } = req.body;

    const user = await User.findOne({ validation_token: token });

    const { validation_token, confirmed } = user;

    if (confirmed) {
      // user already confirmed response
      return res.status(400).send({ error: "Usuário já confirmado" });
    }

    if (!user) {
      return res
        .status(400)
        .send({ error: "Código de validação não encontrado" });
    }

    if (token !== validation_token) {
      return res.status(400).send({ error: "Código de validação inválido" });
    }

    user.validationToken = "";
    user.confirmed = true;
    await user.save();

    return res.send({ done: "E-mail validado com sucesso" });
  },
};
