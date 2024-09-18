require("dotenv").config();
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { auth } = require("./helpers/auth");

const server = new ApolloServer({
  typeDefs: require("./schema"),
  resolvers: require("./resolvers"),
});

(async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: ({ req, res }) => {
      const { authorization } = req.headers;
      return { auth: () => auth(authorization) };
    },
  });
  console.log(`🚀 Server listening at: ${url}`);
})();
