var express = require("express");
var router = express.Router();
var User = require("../models/User");

/* GET users listing. */
router.get("/", async function (req, res, next) {
  const users = await User.find({});
  res.render("admin/user/index", { users: users });
});

module.exports = router;
