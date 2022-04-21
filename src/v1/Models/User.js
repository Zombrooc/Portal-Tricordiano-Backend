const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validateCPF = require("../services/cpfUtils");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(value) {
        return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          value
        );
      },
      message: "Email inválido",
    },
    select: false,
  },
  cpf: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(value) {
        return validateCPF(value);
      },
      message: "CPF inválido",
    },
    select: false,
  },
  password: {
    type: String,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  validationToken: {
    type: String,
    select: false,
  },
  confirmed: {
    type: Boolean,
    default: false,
    select: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    select: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (this.password) {
    const hash = await bcrypt.hashSync(this.password, 10);

    this.password = hash;
    next();
  } else {
    next();
  }
});

module.exports = mongoose.model("User", userSchema);
