var express = require("express");
var router = express.Router();
const Exam = require("../models/Exam");
const Quiz = require("../models/Quiz");
const User = require("../models/User");
const TakeExam = require("../models/TakeExam");
const TakeQuiz = require("../models/TakeQuiz");
const Feedback = require("../models/Feedback");
var moment = require("moment-timezone");
const { CohereClient } = require("cohere-ai");
const Question = require("../models/Question");
const University = require("../models/University");
require("dotenv").config();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const checkUser = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login?error=Please login");
  }
};

const checkExam = async function (questions, correctAnswers, studentAnswers) {
  const prompt = `
You are an exam grader.
Question List as array: ${questions}
Correct Answer List as array: ${correctAnswers}
Student Answer List as array: ${studentAnswers}

Give a only score array for each value with question no and max is 1 mark for each and result like[{no:1,result:1}].If result is 0, add remark for why and his answer.
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
    return { data: aiFeedback, status: true };
  } catch (error) {
    console.error("Cohere API error:", error);
    return { message: error, status: false };
  }
};

const checkQuiz = async function (question, correctAnswer, studentAnswer) {
  const prompt = `
You are an quiz grader.
Question : ${question}
Correct Answer : ${correctAnswer}
Student Answer : ${studentAnswer}

Give a only score object and max is 1 mark and result like{result:1}.If result is 0, add remark for why and his answer.
`;
  console.log(prompt);
  try {
    const response = await cohere.chat({
      model: "command-r",
      message: prompt,
      temperature: 0.3,
    });

    const aiFeedback = response.text.trim();
    console.log(typeof response.text, response.text);
    return { data: aiFeedback, status: true };
  } catch (error) {
    console.error("Cohere API error:", error);
    return { message: error, status: false };
  }
};

/* GET users listing. */
router.get("/", checkUser, async function (req, res, next) {
  const user = await User.findById(req.session.user.id);
  const recentExam = await Exam.find({ isDelete: false })
    .sort({ created: -1 })
    .limit(3);
  const recentQuiz = await Quiz.find({ isDeleted: false })
    .sort({ created: -1 })
    .limit(3);
  res.render("user/index", {
    user: user,
    recentExam: recentExam,
    recentQuiz: recentQuiz,
  });
});

router.get("/exam/:id", checkUser, async function (req, res) {
  const exam = await Exam.findById(req.params.id);
  const user = await User.findById(req.session.user.id);
  const isDone = user.takenExam.some(
    (exam) => exam.examId.toString() === req.params.id
  );
  console.log(isDone);
  res.render("user/exam", { exam: exam, isDone: isDone });
});

router.get("/quiz/:id", checkUser, async function (req, res) {
  const quiz = await Quiz.findById(req.params.id);
  const user = await User.findById(req.session.user.id);
  const isDone = user.takenQuiz.some(
    (quiz) => quiz.id.toString() === req.params.id
  );
  console.log(isDone);
  res.render("user/quiz", { quiz: quiz, isDone: isDone });
});

//need push takenExam at user and already taken redirect to profile page
router.get("/exam/taken/:id", checkUser, async function (req, res) {
  const exam = await Exam.findById(req.params.id).populate("questions");
  res.render("user/answerExam", { exam: exam });
});

router.get("/quiz/taken/:id", checkUser, async function (req, res) {
  const quiz = await Quiz.findById(req.params.id);
  const randomQuestions = await Question.aggregate([
    {
      $sample: { size: quiz.quizCount }, // Then get a random sample from the remaining
    },
  ]);
  console.log(randomQuestions);
  res.render("user/answerQuiz", {
    quiz: quiz,
    randomQuestions: randomQuestions,
  });
});

router.post("/exam/taken", checkUser, async function (req, res) {
  try {
    const takeExam = new TakeExam();
    const duration =
      Math.floor(Number(req.body.duration) / 60) +
      " Mins : " +
      (Number(req.body.duration) % 60) +
      " Sec";
    const questions = [];
    const correctAnswers = [];
    const markList = [];
    const answerKey = [];
    const questionIdList = [];

    const examData = await Exam.findById(req.body.examId).populate("questions");

    takeExam.user = req.session.user.id;
    takeExam.exam = req.body.examId;
    takeExam.examMarks = examData.totalMarks;
    takeExam.durationTaken = duration;

    examData.questions.map((item, i) => {
      questionIdList.push(item._id);
      answerKey.push("q" + (i + 1));
      questions.push(item.question);
      correctAnswers.push(item.correctAnswer);
      markList.push(item.marks);
    });
    const answers = answerKey.map((key) => req.body[key] || "");
    console.log(markList);
    const result = await checkExam(questions, correctAnswers, answers);
    console.log("Result", result.data);
    if (result.status) {
      const finalAnswers = [];
      let totalScore = 0;
      let totalMarks = 0;
      await JSON.parse(result.data).map((item, i) => {
        totalMarks += markList[i] * item.result;
        totalScore += item.result;
        finalAnswers.push({
          question: questionIdList[i],
          answer: answers[i],
          score: item.result,
          remark: item.remark ? item.remark : "",
          mark: markList[i] * item.result,
        });
      });
      takeExam.answers = finalAnswers;
      takeExam.totalScore = totalScore;
      takeExam.totalMarks = totalMarks;
      await takeExam.save();
      await User.findByIdAndUpdate(req.session.user.id, {
        $push: {
          takenExam: {
            examId: req.body.examId,
            joined: moment.utc(Date.now()).tz("Asia/Yangon").format(),
          },
        },
      });
      res.json({ status: true });
    } else {
      res.json({ status: false, message: result.message });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: false, message: e });
  }
});

router.post("/quiz/taken", checkUser, async function (req, res) {
  try {
    const takeQuiz = new TakeQuiz();
    const duration =
      Math.floor(Number(req.body.duration) / 60) +
      " Mins : " +
      (Number(req.body.duration) % 60) +
      " Sec";
    let answerKey = [];
    let questionKey = [];
    let questions = [];
    let correctAnswers = [];
    const markList = [];
    const quizData = await Quiz.findById(req.body.quizId);
    for (var i = 0; i < quizData.quizCount; i++) {
      answerKey.push("answer_" + i);
      questionKey.push("question_" + i);
    }
    const answers = answerKey.map((key) => req.body[key] || "");
    const questionIdList = questionKey.map((key) => req.body[key] || "");
    for (var i = 0; i < quizData.quizCount; i++) {
      const question = await Question.findById(questionIdList[i]);
      questions.push(question.question);
      correctAnswers.push(question.correctAnswer);
      markList.push(question.marks);
    }
    takeQuiz.user = req.session.user.id;
    takeQuiz.quiz = req.body.quizId;
    takeQuiz.quizMark = quizData.mark;
    takeQuiz.durationTaken = duration;
    console.log(questions, correctAnswers, answers);
    const result = await checkExam(questions, correctAnswers, answers);
    console.log(result);
    if (result.status) {
      const finalAnswers = [];
      let totalScore = 0;
      let totalMarks = 0;
      await JSON.parse(result.data).map((item, i) => {
        totalMarks += markList[i] * item.result;
        totalScore += item.result;
        finalAnswers.push({
          question: questionIdList[i],
          answer: answers[i],
          score: item.result,
          remark: item.remark ? item.remark : "",
          mark: markList[i] * item.result,
        });
      });
      takeQuiz.answers = finalAnswers;
      takeQuiz.totalScore = totalScore;
      takeQuiz.totalMarks = totalMarks;
      await takeQuiz.save();
      await User.findByIdAndUpdate(req.session.user.id, {
        $push: {
          takenQuiz: {
            id: req.body.quizId,
            joined: moment.utc(Date.now()).tz("Asia/Yangon").format(),
          },
        },
      });
      res.json({ status: true });
    } else {
      res.json({ status: false, message: result.message });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: false, message: e });
  }
});

router.get("/exam/result/:id", checkUser, async function (req, res) {
  try {
    const history = await TakeExam.findOne({
      exam: req.params.id,
      user: req.session.user.id,
    })
      .populate("exam")
      .populate("answers.question");
    const score = Math.floor(
      (history.totalScore / history.exam.questions.length) * 100
    );
    const universityList = await University.find({ minScore: { $lte: score } });
    console.log(universityList);
    if (history)
      res.render("user/examResult", {
        history: history,
        universityList: universityList,
      });
    else res.redirect("/user");
  } catch (e) {
    res.redirect("/user");
  }
});

router.get("/quiz/result/:id", checkUser, async function (req, res) {
  try {
    const history = await TakeQuiz.findOne({
      quiz: req.params.id,
      user: req.session.user.id,
    })
      .populate("quiz")
      .populate("answers.question");
    if (history) res.render("user/quizResult", { history: history });
    else res.redirect("/user");
  } catch (e) {
    res.redirect("/user");
  }
});

router.get("/myExam/history", checkUser, async function (req, res) {
  const history = await User.findById(req.session.user.id).populate(
    "takenExam.examId"
  );
  console.log(history);
  res.render("user/takenExamList", { history: history });
});

router.get("/myQuiz/history", checkUser, async function (req, res) {
  const history = await User.findById(req.session.user.id).populate(
    "takenQuiz.id"
  );
  console.log(history);
  res.render("user/takenQuizList", { history: history });
});

router.post("/feedback", checkUser, async function (req, res) {
  try {
    const feedback = new Feedback();
    feedback.user = req.session.user.id;
    feedback.rating = req.body.rating ? req.body.rating : 3;
    feedback.feedbackText = req.body.feedbackText;
    await feedback.save();
    res.redirect("/feedback");
  } catch (e) {
    res.redirect("/feedback");
  }
});

module.exports = router;
