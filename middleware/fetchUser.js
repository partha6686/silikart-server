const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const fetchuser = (req, res, next) => {
  //* Get user id from the jwt token and then add it to the req
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).json({ errors: "Please login to continue" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ errors: "Please login to continue" });
  }
};

module.exports = fetchuser;