const { hashSync } = require("bcrypt");
const { database } = require("../config/database");
const { ObjectId } = require("mongodb");

class User {
  static collection() {
    return database.collection("users");
  }

  static create(payload) {
    const { name, email, password, role = "customer" } = payload;
    const hashedPassword = hashSync(password, 10);
    return this.collection().insertOne({
      name,
      email,
      role,
      password: hashedPassword,
    });
  }

  static getOneByEmail(email) {
    return this.collection().findOne({ email });
  }

  static getOneById(id) {
    const _id = new ObjectId(String(id));
    return this.collection().findOne({ _id });
  }
}

module.exports = User;
