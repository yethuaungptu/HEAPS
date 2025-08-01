const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
var moment = require("moment-timezone");

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  takenExam: [
    {
      examId: {
        type: Schema.Types.ObjectId,
        ref: "Exam",
      },
      joined: {
        type: Date,
        default: moment.utc(Date.now()).tz("Asia/Yangon").format(),
      },
    },
  ],
  takenQuiz: [
    {
      id: {
        type: Schema.Types.ObjectId,
        ref: "Quiz",
      },
      joined: {
        type: Date,
        default: moment.utc(Date.now()).tz("Asia/Yangon").format(),
      },
    },
  ],
  password: {
    type: String,
    required: true,
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

UserSchema.pre("save", function (next) {
  this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8), null);
  next();
});

UserSchema.statics.compare = function (cleartext, encrypted) {
  return bcrypt.compareSync(cleartext, encrypted);
};

module.exports = mongoose.model("User", UserSchema);
