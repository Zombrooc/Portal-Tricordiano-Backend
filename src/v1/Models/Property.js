const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  propertyType: [
    {
      type: String,
      required: true,
    },
  ],
  objective: {
    sell: {
      active: {
        type: Boolean,
        default: false,
      },
      price: {
        type: Number,
        required: true,
      },
    },
    rent: {
      active: {
        type: Boolean,
        default: false,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  },
  bedroom: {
    type: Number,
    required: true,
    default: 0,
  },
  bathroom: {
    type: Number,
    required: true,
    default: 0,
  },
  garage: {
    type: Number,
    required: true,
    default: 0,
  },
  area: {
    type: Number,
    default: 0,
  },
  address: {
    street: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    neighborhood: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    zipcode: {
      type: Number,
      required: true,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Property", propertySchema);
