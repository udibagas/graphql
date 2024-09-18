const { ObjectId } = require("mongodb");
const { database } = require("../config/database");

class Product {
  static collection() {
    return database.collection("products");
  }

  static findAll() {
    return this.collection().find();
  }

  static findById(id) {
    return this.collection().findOne({
      _id: ObjectId(String(id)),
    });
  }
}

module.exports = Product;
