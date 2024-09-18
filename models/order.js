const { ObjectId } = require("mongodb");
const { database, client } = require("../config/database");
const Product = require("./product");

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

  static async pay(id) {
    const session = client.startSession();

    try {
      const order = await session.withTransaction(async () => {
        // 1. Ambil data order berdasarkan id
        const order = await Order.collection().findOne(
          { _id: new ObjectId(String(id)) },
          { session }
        );

        if (!order) throw new Error("Order not found");

        // 2. Cek status order apakah unpaid
        if (order.status == "paid") throw new Error("Order has been paid");

        // 3. Pastikan stock cukup
        const product = await Product.collection().findOne(
          {
            _id: new ObjectId(String(order.productId)),
          },
          { session }
        );

        if (product.stock < order.qty)
          throw new Error("Stock is not sufficient");

        // 4. Update status order & paidAt
        await Order.collection().updateOne(
          { _id: new ObjectId(String(id)) },
          {
            $set: {
              status: "paid",
              paidAt: new Date(),
            },
          },
          { session }
        );

        // 5. Kurangi stock product terkait
        await Product.collection().updateOne(
          {
            _id: new ObjectId(String(order.productId)),
          },
          { $set: { stock: product.stock - order.qty } },
          { session }
        );

        return Order.findById(id);
      });

      return order;
    } finally {
      session.endSession();
    }
  }
}

module.exports = Order;
