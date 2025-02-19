const express = require("express");
const { resendotp,sendOTP,verifyOTP,register, login ,signup} = require("../controllers/AuthController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/signup", signup);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp",resendotp);  

module.exports = router;
