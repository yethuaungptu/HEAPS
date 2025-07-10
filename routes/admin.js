var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController");
var universityController = require("../controllers/universityController");
var questionController = require("../controllers/questionController");
var examController = require("../controllers/examController");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("admin/index");
});

router.use("/users", userController);
router.use("/university", universityController);
router.use("/question", questionController);
router.use("/exam", examController);

module.exports = router;
