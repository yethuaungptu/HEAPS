var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController");
var universityController = require("../controllers/universityController");
var questionController = require("../controllers/questionController");
var examController = require("../controllers/examController");
var quizController = require("../controllers/quizController");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("admin/index");
});

router.use("/users", userController);
router.use("/university", universityController);
router.use("/question", questionController);
router.use("/exam", examController);
router.use("/quiz", quizController);

module.exports = router;
