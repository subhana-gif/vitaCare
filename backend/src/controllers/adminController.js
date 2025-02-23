const jwt = require("jsonwebtoken");
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

// Admin Login API
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ message: "Login successful", token });
};


