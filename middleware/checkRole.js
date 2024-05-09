const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split("Bearer ")[1];
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let { Role } = decoded;
    req.auth = decoded;
    if (Role == 1) {
        return next();
    } else {
        return res.status(403).send({
            status:403,
            message: "Your Are Not Admin"
        });
    }
  } catch (err) {
    return res.status(401).json({
      message: "Auth failed",
    });
  }
};
