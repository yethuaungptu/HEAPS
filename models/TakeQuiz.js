const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var moment = require("moment-timezone");

const TakeQuizSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
      answer: {
        type: String, // or ObjectId if options are stored as documents
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
      mark: {
        type: Number,
        required: true,
      },
      remark: {
        type: String,
      },
    },
  ],
  totalScore: {
    type: Number,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  quizMark: {
    type: Number,
    required: true,
  },
  created: {
    type: Date,
    default: moment.utc(Date.now()).tz("Asia/Yangon").format(),
  },
  durationTaken: {
    type: String,
  },
});

module.exports = mongoose.model("TakeQuiz", TakeQuizSchema);
