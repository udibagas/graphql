const { compareSync } = require("bcrypt");
const { generateToken } = require("../helpers/auth");
const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
const { ObjectId } = require("mongodb");

const resolvers = {
  Query: {
    hello: () => "world",
    products: () => Product.findAll(),
    orders: () => Order.findAll(),
    order: (_, { id }) => Order.findById(id),
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
      });

      return Order.findById(res.insertedId);
    },
  },
};

module.exports = resolvers;
