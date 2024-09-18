const { ObjectId } = require("mongodb");
const { database } = require("../config/database");

class Product {
  static collection() {
    return database.collection("products");
  }

  static create(payload) {
    return this.collection().insertOne(payload);
  }

  static async findAll() {
    const res = this.collection().find();
    return res.toArray();
  }

  static findById(id) {
    return this.collection().findOne({
      _id: new ObjectId(String(id)),
    });
  }
}

module.exports = Product;
