const { ObjectId } = require("mongodb");
const { database } = require("../config/database");

class Order {
  static collection() {
    return database.collection("orders");
  }

  static create(payload) {
    return this.collection().insertOne(payload);
  }

  static findAll() {
    return this.collection().find();
  }

  static findById(id) {
    return this.collection().findOne({
      _id: new ObjectId(String(id)),
    });
  }
}

module.exports = Order;
