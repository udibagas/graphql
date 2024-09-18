const { generateToken } = require("../helpers/auth");
const User = require("../models/user");

const resolvers = {
  Query: {
    hello: () => "world",
  },

  Mutation: {
    async register(parent, args, contextValue) {
      const { name, email, password } = args;
      const res = await User.create({ name, email, password });
      return User.getOneById(res.insertedId);
    },
  },
};

module.exports = resolvers;
