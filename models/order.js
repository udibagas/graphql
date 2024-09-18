const { ObjectId } = require("mongodb");
const { database } = require("../config/database");

class Order {
  static collection() {
    return database.collection("orders");
  }

  static create(payload) {
    return this.collection().insertOne(payload);
  }

  static async findAll() {
    const agg = [
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const res = await this.collection().aggregate(agg);
    return await res.toArray();
  }

  static async findById(id) {
    // return this.collection().findOne({
    //   _id: new ObjectId(String(id)),
    // });

    const agg = [
      {
        $match: {
          _id: new ObjectId(String(id)),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const res = await this.collection().aggregate(agg);
    return (await res.toArray())[0];
  }
}

module.exports = Order;
