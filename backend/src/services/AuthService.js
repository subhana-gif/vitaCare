const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/userRepository");

class AuthService {
  async register(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await UserRepository.createUser({ email, password: hashedPassword });
  }

  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    console.log("User found:", user); 
    if (!user) throw new Error("Invalid credentials");

    console.log("Stored Password:", user.password);
    console.log("Entered Password:", password);
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return { token, user };
  }
}

module.exports = new AuthService();
