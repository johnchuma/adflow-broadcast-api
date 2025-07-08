const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.generateJwtTokens = (user) => {
  console.log("generation token");
  console.log(process.env.ACCESS_TOKEN);
  const ACCESS_TOKEN = jwt.sign(user.dataValues, process.env.ACCESS_TOKEN);
  //   const REFRESH_TOKEN = jwt.sign(user.dataValues, process.env.REFRESH_TOKEN);

  const response = {
    ACCESS_TOKEN,
  };
  return response;
};
