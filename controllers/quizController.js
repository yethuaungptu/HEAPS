var express = require("express");
var router = express.Router();
var Question = require("../models/Question");
var Quiz = require("../models/Quiz");
var moment = require("moment-timezone");

/* GET users listing. */
router.get("/", async function (req, res, next) {
  var query = { isDeleted: false };
  var filterValue = "";
  if (req.query.search) {
    filterValue = req.query.search;
    query = { category: { $in: filterValue }, isDeleted: false };
  }
  const quiz = await Quiz.find(query).sort({ created: -1 });
  res.render("admin/quiz/index", { quiz: quiz, filterValue: filterValue });
});

router.get("/create", async function (req, res, next) {
  const questions = await Question.find({});
  res.render("admin/quiz/create", { questions: JSON.stringify(questions) });
});

router.post("/create", async function (req, res) {
  try {
    const quiz = new Quiz();
    quiz.title = req.body.title;
    quiz.description = req.body.description;
    quiz.quizCount = req.body.quizCount;
    quiz.mark = req.body.mark;
    quiz.durationMinutes = req.body.durationMinutes;
    quiz.category = req.body.category;
    await quiz.save();
    res.redirect("/admin/quiz");
  } catch (e) {
    console.log(e);
    res.redirect("/admin/quiz/create");
  }
});

router.get("/detail/:id", async function (req, res) {
  const quiz = await Quiz.findById(req.params.id);
  res.render("admin/quiz/detail", { quiz: quiz });
});

router.get("/update/:id", async function (req, res) {
  const quiz = await Quiz.findById(req.params.id);
  console.log(quiz);
  res.render("admin/quiz/update", { quiz: quiz });
});

router.post("/update", async function (req, res) {
  try {
    const update = {
      title: req.body.title,
      mark: req.body.mark,
      description: req.body.description,
      durationMinutes: req.body.durationMinutes,
      category: req.body.category,
      quizCount: req.body.quizCount,
    };

    await Quiz.findByIdAndUpdate(req.body.id, { $set: update });
    res.redirect("/admin/quiz");
  } catch (e) {
    console.log(e);
    res.redirect("/admin/quiz");
  }
});

router.post("/publishQuiz", async function (req, res) {
  try {
    const update = {
      isPublished: true,
      updated: moment.utc(Date.now()).tz("Asia/Yangon").format(),
    };
    await Quiz.findByIdAndUpdate(req.body.quizId, { $set: update });
    res.json({ status: "success" });
  } catch (e) {
    console.error("Error publish exam:", e);
    res.json({ status: "error" });
  }
});

router.post("/delete", async function (req, res) {
  try {
    const update = {
      isDelete: true,
      updated: moment.utc(Date.now()).tz("Asia/Yangon").format(),
    };
    await Quiz.findByIdAndUpdate(req.body.quizId, { $set: update });
    res.json({ status: "success" });
  } catch (e) {
    console.error("Error deleting exam:", e);
    res.json({ status: "error" });
  }
});

module.exports = router;
