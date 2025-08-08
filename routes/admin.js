var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController");
var universityController = require("../controllers/universityController");
var questionController = require("../controllers/questionController");
var examController = require("../controllers/examController");
var quizController = require("../controllers/quizController");
const Feedback = require("../models/Feedback");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Exam = require("../models/Exam");
const TakeExam = require("../models/TakeExam");
const TakeQuiz = require("../models/TakeQuiz");
const User = require("../models/User");

/* GET users listing. */

const checkAdmin = function (req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/adminLogin?error=Please login");
  }
};

router.get("/", checkAdmin, async function (req, res, next) {
  const recentQuiz = await Quiz.find({ isDelete: false })
    .sort({ created: -1 })
    .limit(5);
  const recentExam = await Exam.find({ isDelete: false })
    .sort({ created: -1 })
    .limit(5);
  const userCount = await User.countDocuments();
  const examCount = await Exam.countDocuments({ isDelete: false });
  const questionCount = await Question.countDocuments();
  const quizCount = await Quiz.countDocuments({ isDelete: false });
  const takeExamCount = await TakeExam.countDocuments();
  const takeQuizCount = await TakeQuiz.countDocuments();
  const feedbackCount = await Feedback.countDocuments();
  res.render("admin/index", {
    recentQuiz: recentQuiz,
    recentExams: recentExam,
    userCount: userCount,
    examCount: examCount,
    questionCount: questionCount,
    quizCount: quizCount,
    takeExamCount: takeExamCount,
    takeQuizCount: takeQuizCount,
    feedbackCount: feedbackCount,
  });
});

router.get("/feedback", checkAdmin, async function (req, res, next) {
  const feedbacks = await Feedback.find({})
    .sort({ createdAt: -1 })
    .populate("user", "name");
  res.render("admin/feedback", { feedbacks: feedbacks });
});

router.post("/feedback/delete", checkAdmin, async function (req, res, next) {
  try {
    await Feedback.findByIdAndDelete(req.body.id);
    res.json({ status: true });
  } catch (e) {
    res.json({ status: false });
  }
});

router.get("/logout", checkAdmin, async function (req, res, next) {
  req.session.destroy();
  res.redirect("/");
});

router.use("/users", checkAdmin, userController);
router.use("/university", checkAdmin, universityController);
router.use("/question", checkAdmin, questionController);
router.use("/exam", checkAdmin, examController);
router.use("/quiz", checkAdmin, quizController);

module.exports = router;
