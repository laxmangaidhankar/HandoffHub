const jwt = require("jsonwebtoken");
const env = require("../config/env");

// ─────────────────────────────────────────────────────────────────
// authenticateSession
//
// REST middleware that reads the `session` HttpOnly JWT cookie,
// verifies it, and attaches the decoded payload to req.user.
// Returns 401 if the cookie is missing or invalid.
// ─────────────────────────────────────────────────────────────────
function authenticateSession(req, res, next) {
  try {
    const token = req.cookies.session;

    if (!token) {
      return res.status(401).json({ success: false, error: "No active session." });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Invalid or expired session." });
  }
}

module.exports = { authenticateSession };
