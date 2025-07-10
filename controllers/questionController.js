var express = require("express");
var router = express.Router();
var Question = require("../models/Question");
var moment = require("moment");

/* GET users listing. */
router.get("/", async function (req, res, next) {
  var query = {};
  var filterValue = "";
  if (req.query.search) {
    filterValue = req.query.search;
    query = { category: { $in: filterValue } };
  }
  const questions = await Question.find(query).sort({ created: -1 });
  res.render("admin/question/index", {
    questions: questions,
    filterValue: filterValue,
  });
});

router.get("/create", async function (req, res, next) {
  res.render("admin/question/create");
});

router.post("/create", async function (req, res, next) {
  try {
    const question = new Question();
    question.question = req.body.question;
    question.type = req.body.type;
    question.marks = req.body.marks;
    question.choices = req.body.choices;
    question.category = req.body.category;
    question.correctAnswer = req.body.correctAnswer;
    question.explanation = req.body.explanation;
    await question.save();
    res.redirect("/admin/question");
  } catch (e) {
    console.error("Error creating question:", e);
    return;
  }
});

router.get("/detail/:id", async function (req, res) {
  const question = await Question.findById(req.params.id);
  res.render("admin/question/detail", { question: question });
});

router.get("/update/:id", async function (req, res) {
  const question = await Question.findById(req.params.id);
  res.render("admin/question/update", { question: question });
});

router.post("/update", async function (req, res) {
  try {
    const update = {
      question: req.body.question,
      type: req.body.type,
      marks: req.body.marks,
      choices: req.body.choices,
      category: req.body.category,
      correctAnswer: req.body.correctAnswer,
      explanation: req.body.explanation,
      updated: moment.utc(Date.now()).tz("Asia/Yangon").format(),
    };
    await Question.findByIdAndUpdate(req.body.id, { $set: update });
    res.redirect("/admin/question");
  } catch (e) {
    console.error("Error updating tip:", e);
    return;
  }
});

module.exports = router;
