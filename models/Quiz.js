const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var moment = require("moment-timezone");

const QuizSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  quizCount: {
    type: Number,
    required: true,
  },
  mark: {
    type: Number,
    default: 0,
  },
  durationMinutes: {
    type: Number,
    default: 30,
  },
  category: [String], // e.g. ['biology', 'midterm']
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isPublished: {
    type: Boolean,
    default: false,
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

module.exports = mongoose.model("Quiz", QuizSchema);
