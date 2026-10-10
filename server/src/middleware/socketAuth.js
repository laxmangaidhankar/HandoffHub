const jwt = require("jsonwebtoken");
const env = require("../config/env");

// ─────────────────────────────────────────────────────────────────
// socketAuth
//
// Socket.IO middleware that validates the `session` JWT cookie
// before allowing a socket connection. Attaches decoded user
// payload to socket.user for use in socketService event handlers.
// ─────────────────────────────────────────────────────────────────
const socketAuth = (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("Authentication required."));
    }

    // Parse the raw cookie header into a key/value map
    const cookies = {};
    cookieHeader.split(";").forEach((cookie) => {
      const [name, ...valueParts] = cookie.trim().split("=");
      cookies[name] = decodeURIComponent(valueParts.join("="));
    });

    const sessionToken = cookies.session;

    if (!sessionToken) {
      return next(new Error("Session cookie missing."));
    }

    const decoded = jwt.verify(sessionToken, env.JWT_SECRET);

    if (!decoded.roomId || !decoded.participantId) {
      return next(new Error("Invalid project session."));
    }

    socket.user = {
      roomId: decoded.roomId,
      participantId: decoded.participantId,
      displayName: decoded.displayName,
      role: decoded.role,
      expiresAt: decoded.expiresAt,
    };

    next();
  } catch (error) {
    next(new Error("Socket authentication failed."));
  }
};

module.exports = { socketAuth };
