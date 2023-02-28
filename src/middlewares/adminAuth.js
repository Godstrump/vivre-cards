const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("admin-token");
  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    if (req.body.userId && req.body.userId !== req.user.userId) {
      throw "Invalid user ID";
    } else {
      next();
    }
  } catch (err) {
    res.status(400).send("Invalid token.");
  }
};

