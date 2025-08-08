var express = require("express");
var router = express.Router();
var User = require("../models/User");
var University = require("../models/University");
var Exam = require("../models/Exam");
var Quiz = require("../models/Quiz");
var Feedback = require("../models/Feedback");
// const { CohereClient } = require("cohere-ai");
// require("dotenv").config();

// const cohere = new CohereClient({
//   token: process.env.COHERE_API_KEY,
// });

/* GET home page. */
router.get("/", async function (req, res, next) {
  const feedback = await Feedback.find({ rating: { $gte: 2 } })
    .populate("user", "name")
    .sort({ created: -1 })
    .limit(3);
  res.render("index", { title: "Express22", feedback: feedback });
});

router.get("/university", async function (req, res) {
  const university = await University.find({});
  res.render("university", { university: university });
});

router.get("/university/:id", async function (req, res) {
  const university = await University.findById(req.params.id);
  console.log(university);
  res.render("universityDetail", { university: university });
});

router.get("/exam", async function (req, res) {
  const exams = await Exam.find({ isDelete: false });
  res.render("exam", { exams: exams });
});

router.get("/quiz", async function (req, res) {
  const quiz = await Quiz.find({ isDelete: false });
  res.render("quiz", { quiz: quiz });
});

router.get("/feedback", async function (req, res) {
  const feedbackList = await Feedback.find().populate("user");
  res.render("feedback", { feedbackList: feedbackList });
});

router.get("/adminLogin", function (req, res) {
  res.render("alogin");
});

router.post("/adminLogin", function (req, res) {
  if (
    req.body.email === "heap@admin.com" &&
    req.body.password === "heapadmin2025"
  ) {
    req.session.admin = {
      email: req.body.email,
    };
    res.redirect("/admin");
  } else {
    res.redirect("/adminLogin?error=Invalid credentials");
  }
});

router.get("/register", function (req, res) {
  res.render("register");
});

router.post("/register", async (req, res, next) => {
  try {
    const exitingUser = await User.findOne({ email: req.body.email });
    if (exitingUser) {
      res.json({ status: false, message: "Exit user with this email" });
      return;
    }
    const user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.password = req.body.password;
    await user.save();
    res.json({ status: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.json({ status: false, message: "Registration failed" });
  }
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user != null && User.compare(req.body.password, user.password)) {
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    res.json({ status: true, message: "Login successful" });
  } else {
    res.json({
      status: false,
      message: "Email not found or password not match",
    });
  }
});

router.get("/aboutus", function (req, res) {
  res.render("aboutus");
});

router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

// router.get("/test", async (req, res) => {
//   console.log("call");
//   // const { question, correctAnswer, studentAnswer } = req.body;

//   // if (!question || !correctAnswer || !studentAnswer) {
//   //   return res.status(400).json({ error: 'Missing fields.' });
//   // }
//   const question = [
//     "What is Biology?",
//     "How many season in Myanmar?",
//     "What is the PI value?",
//     "What is water boiling point?",
//   ];
//   const correctAnswer = [
//     "Biology is the study of living things.",
//     "3 seasons",
//     "3.142",
//     "100",
//   ];
//   const studentAnswer = [
//     "Biology is study of living organisms.",
//     "3",
//     "3.14",
//     "100",
//   ];

//   // const question = [
//   //   {
//   //     no: 1,
//   //     question: "What is Biology?",
//   //   },
//   //   { no: 2, question: "How many season in Myanmar?" },
//   //   { no: 3, question: "What is the PI value?" },
//   //   { no: 4, question: "What is water boiling point?" },
//   // ];
//   // const correctAnswer = [
//   //   { no: 1, answer: "Biology is the study of living things." },
//   //   { no: 2, answer: "3 seasons" },
//   //   { no: 3, answer: "3.142" },
//   //   { no: 4, answer: "100" },
//   // ];
//   // const studentAnswer = [
//   //   { no: 1, answer: "Biology is study of living organisms." },
//   //   { no: 2, answer: "3" },
//   //   { no: 3, answer: "3.142" },
//   //   { no: 4, answer: "100" },
//   // ];

//   const prompt = `
// You are an exam grader.
// Question List as array: ${question}
// Correct Answer List as array: ${correctAnswer}
// Student Answer List as array: ${studentAnswer}

// Give a only score array for each value with question no and max is 1 mark for each and result like[{no:1,result:1},{no:2,result:0.7}].If result is 0, add remark for why and his answer.
// `;

//   console.log(prompt);
//   try {
//     const response = await cohere.chat({
//       model: "command-r",
//       message: prompt,
//       temperature: 0.3,
//     });

//     const aiFeedback = response.text.trim();
//     console.log(response.text);
//     res.json({ evaluation: aiFeedback });
//   } catch (error) {
//     console.error("Cohere API error:", error);
//     res.status(500).json({ error: "Failed to evaluate answer." });
//   }
// });

module.exports = router;
