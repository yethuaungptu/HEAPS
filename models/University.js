const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var moment = require("moment-timezone");

const UniversitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  ranking: {
    type: String,
    required: true,
  },
  minScore: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  websiteUrl: {
    type: String,
  },
  image: {
    type: String,
  },
  created: {
    type: Date,
    default: moment.utc(Date.now()).tz("Asia/Yangon").format(),
  },
  updated: {
    type: Date,
    default: moment.utc(Date.now()).tz("Asia/Yangon").format(),
  },
});

module.exports = mongoose.model("University", UniversitySchema);
