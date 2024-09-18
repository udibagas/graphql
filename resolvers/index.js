const { compareSync } = require("bcrypt");
const { generateToken } = require("../helpers/auth");
const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");

const resolvers = {
  Query: {
    hello: () => "world",
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
        name: user.name,
        email: user.email,
        role: user.role,
      });

      return { token };
    },

    async createProduct(_, { data }) {
      const res = await Product.create(data);
      return Product.findById(res.insertedId);
    },

    async createOrder(_, { data }) {
      const res = await Order.create(data);
      return Order.findById(res.insertedId);
    },
  },
};

module.exports = resolvers;
