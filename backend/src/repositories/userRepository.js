const User = require("../models/user");

class UserRepository {
  async createUser(userData) {
    return await User.create(userData);
  }

  async findByEmail(email) {
    console.log("Finding user with email:", email);
    return await User.findOne({ email });
  }
}

module.exports = new UserRepository();
