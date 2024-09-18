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
}

module.exports = Order;
