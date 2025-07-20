var express = require("express");
var router = express.Router();
var Question = require("../models/Question");
var Exam = require("../models/Exam");
var moment = require("moment-timezone");

/* GET users listing. */
router.get("/", async function (req, res, next) {
  var query = { isDelete: false };
  var filterValue = "";
  if (req.query.search) {
    filterValue = req.query.search;
    query = { category: { $in: filterValue }, isDelete: false };
  }
  const exams = await Exam.find(query).sort({ created: -1 });
  res.render("admin/exam/index", { exams: exams, filterValue: filterValue });
});

router.get("/create", async function (req, res, next) {
  const questions = await Question.find({});
  res.render("admin/exam/create", { questions: JSON.stringify(questions) });
});

router.post("/create", async function (req, res) {
  try {
    const exam = new Exam();
    exam.title = req.body.title;
    exam.description = req.body.description;
    exam.questions = req.body.question[0];
    exam.totalMarks = req.body.totalMarks;
    exam.durationMinutes = req.body.durationMinutes;
    exam.category = req.body.category;
    await exam.save();
    res.redirect("/admin/exam");
  } catch (e) {
    console.log(e);
    res.redirect("/admin/exam/create");
  }
});

router.get("/detail/:id", async function (req, res) {
  const exam = await Exam.findById(req.params.id).populate("questions");
  console.log(exam);
  res.render("admin/exam/detail", { exam: exam });
});

router.get("/update/:id", async function (req, res) {
  const exam = await Exam.findById(req.params.id);
  console.log(exam);
  res.render("admin/exam/update", { exam: exam });
});

router.post("/update", async function (req, res) {
  try {
    const update = {
      title: req.body.title,
      description: req.body.description,
      totalMarks: req.body.totalMarks,
      durationMinutes: req.body.durationMinutes,
      category: req.body.category,
    };

    await Exam.findByIdAndUpdate(req.body.id, { $set: update });
    console.log("updated", update, req.body);
    res.redirect("/admin/exam");
  } catch (e) {
    console.log(e);
    res.redirect("/admin/exam");
  }
});

router.post("/publishExam", async function (req, res) {
  try {
    const update = {
      isPublished: true,
      updated: moment.utc(Date.now()).tz("Asia/Yangon").format(),
    };
    await Exam.findByIdAndUpdate(req.body.examId, { $set: update });
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
    await Exam.findByIdAndUpdate(req.body.examId, { $set: update });
    res.json({ status: "success" });
  } catch (e) {
    console.error("Error deleting exam:", e);
    res.json({ status: "error" });
  }
});

module.exports = router;
