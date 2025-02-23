const express = require("express");
const {login} = require("../controllers/adminController")
const { addDoctor } = require("../controllers/doctorController");

const router = express.Router();

router.post("/login", login);
router.post("/add-doctor", addDoctor);

module.exports = router;
