const { compareSync } = require("bcrypt");
const { generateToken } = require("../helpers/auth");
const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
const { ObjectId } = require("mongodb");
const Redis = require("ioredis");
const redis = new Redis();
// const { REDIS_HOST, REDIS_PORT, REDIS_PASS, REDIS_DB } = process.env;
// const redis = new Redis({
//   port: Number(REDIS_PORT), // Redis port
//   host: REDIS_HOST, // Redis host
//   password: REDIS_PASS,
//   db: 0,
// });

const resolvers = {
  Query: {
    hello: () => "world",

    products: async (parent, args, { auth }) => {
      auth();

      // 1. Check di redis apakah ada cache yg tersimpan
      const cache = await redis.get("products");

      // 2. Kalau ada return data yang ada di cache
      if (cache) {
        console.log("Ambil data dari cache");
        return JSON.parse(cache);
      }

      // 3. Kalau ga ada ambil dari database,
      const products = await Product.findAll();

      // 4. Simpan datanya di cache
      await redis.set("products", JSON.stringify(products));

      // 5. Return data dari database
      console.log("Ambil data dari database");
      return products;
    },

    orders: (parent, args, { auth }) => {
      auth();
      return Order.findAll();
    },

    order: (_, { id }, { auth }) => {
      auth();
      return Order.findById(id);
    },
  },

  Mutation: {
    async register(_, args) {
      const { name, email, password } = args;
      const res = await User.create({ name, email, password });
      return User.getOneById(res.insertedId);
    },

    async login(_, { email, password }) {
      const user = await User.getOneByEmail(email);

      if (!user) throw new Error("Invalid username or password");

      if (!compareSync(password, user.password)) {
        throw new Error("Invalid username or password");
      }

      const token = generateToken({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

      return { token };
    },

    async createProduct(_, { data }, contextValue) {
      contextValue.auth();
      const res = await Product.create(data);
      // cache invalidation
      await redis.del("products");
      return Product.findById(res.insertedId);
    },

    async createOrder(_, { data }, { auth }) {
      const user = auth();
      const { productId, ...payload } = data;

      const res = await Order.create({
        ...payload,
        date: new Date(),
        customerId: new ObjectId(String(user.id)),
        productId: new ObjectId(String(productId)),
        status: "unpaid",
        paidAt: null,
      });

      return Order.findById(res.insertedId);
    },

    async payOrder(_, { id }, { auth }) {
      auth();
      return Order.pay(id);
    },
  },
};

module.exports = resolvers;
