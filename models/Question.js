const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var moment = require("moment-timezone");

const QuestionSchema = new Schema({
  type: {
    type: String,
    enum: ["multiple_choice", "fill_in_blank", "paragraph"],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  choices: {
    type: [String], // Only used for multiple choice
    default: undefined,
  },
  correctAnswer: {
    type: Schema.Types.Mixed, // String or array, depending on type
    required: true,
  },
  marks: {
    type: Number,
    default: 1,
  },
  category: [String], // Optional (e.g. "math", "history")
  explanation: {
    type: String, // Optional (used for review/feedback)
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

module.exports = mongoose.model("Question", QuestionSchema);
