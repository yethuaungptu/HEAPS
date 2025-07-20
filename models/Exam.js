const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var moment = require("moment-timezone");

const ExamSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  totalMarks: {
    type: Number,
    default: 0,
  },
  durationMinutes: {
    type: Number,
    default: 30,
  },
  category: [String], // e.g. ['biology', 'midterm']
  isDelete: {
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

module.exports = mongoose.model("Exam", ExamSchema);
