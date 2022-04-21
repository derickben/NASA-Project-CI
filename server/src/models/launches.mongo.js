const mongoose = require("mongoose");

const LaunchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
  },
  success: {
    type: Boolean,
    default: true,
    required: true,
  },
  upcoming: {
    type: Boolean,
    default: true,
    required: true,
  },
  target: {
    type: String,
    required: true,
  },
  // target: {
  //   ref: "Planet",
  //   type: mongoose.ObjectId,
  // },
  customers: [String],
});

module.exports = mongoose.model("Launch", LaunchesSchema);
