const { compareSync } = require("bcrypt");
const { generateToken } = require("../helpers/auth");
const User = require("../models/user");

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

    async login(parent, args) {
      console.log(parent);
      const { email, password } = args;
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
  },
};

module.exports = resolvers;
