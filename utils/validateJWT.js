const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.validateJWT = async (req, res, next) => {
  /* #swagger.security = [{
            "bearerAuth": []
    }] */
  const headers = req.headers["authorization"];
  console.log("Headers:", headers);
  if (headers) {
    const tokens = headers.split(" ")[1];

    if (tokens == null) return res.status(401);
    jwt.verify(tokens, process.env.ACCESS_TOKEN, (error, user) => {
      if (error)
        return res.status(403).json({
          status: false,
          code: 403,
          error: "Oops! You don't have access",
        });
      req.user = user;
      next();
    });
  } else {
    return res
      .status(403)
      .json({ status: false, code: 403, error: "Oops! You don't have access" });
  }
};
