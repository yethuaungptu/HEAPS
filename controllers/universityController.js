var express = require("express");
var router = express.Router();
var multer = require("multer");
var moment = require("moment-timezone");
const fs = require("fs");
var University = require("../models/University");
const upload = multer({ dest: "public/images/uploads" });

/* GET users listing. */
router.get("/", async function (req, res, next) {
  var query = {};
  var filterValue = "";
  if (req.query.search) {
    filterValue = req.query.search;
    query = { region: filterValue };
  }
  const university = await University.find(query);
  res.render("admin/university/index", {
    university: university,
    filterValue: filterValue,
  });
});

router.get("/create", async function (req, res, next) {
  res.render("admin/university/create");
});

router.post("/create", upload.single("image"), async function (req, res) {
  try {
    const university = new University();
    university.name = req.body.name;
    university.category = req.body.category;
    university.address = req.body.address;
    university.ranking = req.body.ranking;
    university.minScore = req.body.minScore;
    university.websiteUrl = req.body.websiteUrl;
    university.region = req.body.region;
    if (req.file) university.image = "/images/uploads/" + req.file.filename;
    await university.save();
    res.redirect("/admin/university");
  } catch (e) {
    console.error("Error creating university:", e);
    return;
  }
});

router.get("/detail/:id", async (req, res) => {
  const university = await University.findById(req.params.id);
  res.render("admin/university/detail", { university: university });
});

router.get("/update/:id", async (req, res) => {
  const university = await University.findById(req.params.id);
  res.render("admin/university/update", { university: university });
});

router.post("/update", upload.single("image"), async function (req, res) {
  try {
    const universityData = await University.findById(req.body.id);
    const update = {
      name: req.body.name,
      category: req.body.category,
      address: req.body.address,
      ranking: req.body.ranking,
      minScore: req.body.minScore,
      websiteUrl: req.body.websiteUrl,
      region: req.body.region,
      updated: moment.utc(Date.now()).tz("Asia/Yangon").format(),
    };
    if (req.file) {
      try {
        fs.unlinkSync("public" + universityData.image);
        update.image = "/images/uploads/" + req.file.filename;
      } catch (e) {
        console.log("Image error");
      }
    }
    await University.findByIdAndUpdate(req.body.id, { $set: update });
    res.redirect("/admin/university");
  } catch (e) {
    console.error("Error updating tip:", e);
    return;
  }
});

module.exports = router;
