const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.generateJwtTokens = (user) => {
  console.log("Generating token for user:", user.id);

  // Only encode essential user data in JWT
  const payload = {
    id: user.id,
    email: user.email,
  };

  const ACCESS_TOKEN = jwt.sign(payload, process.env.ACCESS_TOKEN, {
    expiresIn: "7d", // Token expires in 7 days
  });

  const response = {
    ACCESS_TOKEN,
  };
  return response;
};
