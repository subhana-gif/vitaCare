const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const doctorSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, default: null }, // Store hashed password
  speciality: String,
  degree: String,
  experience: String,
  address1: String,
  address2: String,
  about: String,
  image: String,
});


module.exports = mongoose.model("Doctor", doctorSchema);
