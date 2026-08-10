const jwt = require("jsonwebtoken");

// Verifies the token if one is provided, but does not block the request.
// Sets req.user when a valid token is present.
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // ignore invalid token - treat as anonymous
  }

  next();
};

module.exports = optionalAuth;
