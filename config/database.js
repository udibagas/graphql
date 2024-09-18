require("dotenv").config();
const { MongoClient } = require("mongodb");

const url = process.env.DB_URL;
const client = new MongoClient(url);

// (async () => {
//   await client.connect();
//   console.log("Connected!");
// })();

const database = client.db(process.env.DB_NAME);

module.exports = { database, client };
