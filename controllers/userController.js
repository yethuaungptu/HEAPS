var express = require("express");
var router = express.Router();
var User = require("../models/User");
var TakeExam = require("../models/TakeExam");
var TakeQuiz = require("../models/TakeQuiz");

/* GET users listing. */
router.get("/", async function (req, res, next) {
  const users = await User.find({});
  res.render("admin/user/index", { users: users });
});

router.get("/detail/:id", async function (req, res, next) {
  const user = await User.findById(req.params.id);
  const examHistory = await TakeExam.find({ user: req.params.id })
    .populate("exam", "title")
    .sort({ created: -1 });
  const quizHistory = await TakeQuiz.find({ user: req.params.id })
    .populate("quiz", "title")
    .sort({ created: -1 });
  res.render("admin/user/detail", {
    user: user,
    examHistory: examHistory,
    quizHistory: quizHistory,
  });
});

module.exports = router;
