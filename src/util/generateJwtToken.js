const env = require("../config/config");
const jwt = require("jsonwebtoken");

const generateAccessToken = (id, email, expiry=null, SECRET=null) => {
  let expiryTime = expiry
  if (!expiry) {
    const currentTime = Math.floor(Date.now() / 1000);
    expiryTime = currentTime + (30 * 60);
  }
  const token = !SECRET ? env.access_secret : SECRET

  return jwt.sign(
      {
        _id: id,
        account: email,
        exp: expiryTime
      },
      token
  );
}

module.exports = generateAccessToken