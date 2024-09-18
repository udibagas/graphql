const { sign, verify } = require("jsonwebtoken");

exports.generateToken = (payload) => {
  return sign(payload, process.env.JWT_SECRET);
};

exports.auth = (authorization) => {
  if (!authorization) throw new Error("Unauthenticated");
  const [type, token] = authorization.split(" ");
  if (type !== "Bearer") throw new Error("Invalid authorization type");
  if (!token) throw new Error("No token provided");
  const decoded = verify(token, process.env.JWT_SECRET);
  return decoded;
};
