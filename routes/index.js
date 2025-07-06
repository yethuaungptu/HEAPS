var express = require("express");
var router = express.Router();
const { CohereClient } = require("cohere-ai");
require("dotenv").config();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express22" });
});

router.get("/university", function (req, res) {
  res.render("university");
});

router.get("/question", function (req, res) {
  res.render("question");
});

router.get("/feedback", function (req, res) {
  res.render("feedback");
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.get("/aboutus", function (req, res) {
  res.render("aboutus");
});

router.get("/test", async (req, res) => {
  console.log("call");
  // const { question, correctAnswer, studentAnswer } = req.body;

  // if (!question || !correctAnswer || !studentAnswer) {
  //   return res.status(400).json({ error: 'Missing fields.' });
  // }
  const question = [
    "What is Biology?",
    "How many season in Myanmar?",
    "What is the PI value?",
    "What is water boiling point?",
  ];
  const correctAnswer = [
    "Biology is the study of living things.",
    "3 seasons",
    "3.142",
    "100",
  ];
  const studentAnswer = [
    "Biology is study of living organisms.",
    "3",
    "3.14",
    "100",
  ];

  // const question = [
  //   {
  //     no: 1,
  //     question: "What is Biology?",
  //   },
  //   { no: 2, question: "How many season in Myanmar?" },
  //   { no: 3, question: "What is the PI value?" },
  //   { no: 4, question: "What is water boiling point?" },
  // ];
  // const correctAnswer = [
  //   { no: 1, answer: "Biology is the study of living things." },
  //   { no: 2, answer: "3 seasons" },
  //   { no: 3, answer: "3.142" },
  //   { no: 4, answer: "100" },
  // ];
  // const studentAnswer = [
  //   { no: 1, answer: "Biology is study of living organisms." },
  //   { no: 2, answer: "3" },
  //   { no: 3, answer: "3.142" },
  //   { no: 4, answer: "100" },
  // ];

  const prompt = `
You are an exam grader.
Question List as array: ${question}
Correct Answer List as array: ${correctAnswer}
Student Answer List as array: ${studentAnswer}

Give a only score array for each value with question no and max is 1 mark for each and result like[{no:1,result:1},{no:2,result:0.7}].If result is 0, add remark for why and his answer.
`;

  console.log(prompt);
  try {
    const response = await cohere.chat({
      model: "command-r",
      message: prompt,
      temperature: 0.3,
    });

    const aiFeedback = response.text.trim();
    console.log(response.text);
    res.json({ evaluation: aiFeedback });
  } catch (error) {
    console.error("Cohere API error:", error);
    res.status(500).json({ error: "Failed to evaluate answer." });
  }
});

module.exports = router;
