const Room = require("../models/Room");

// ─────────────────────────────────────────────────────────────────
// roomMiddleware
//
// Lightweight middleware for the join route — looks up the room by
// roomId (case-insensitive) and attaches it to req.room without
// performing any status checks (those happen in verifyRoomActive).
// ─────────────────────────────────────────────────────────────────
async function roomMiddleware(req, res, next) {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId: String(roomId || "").toUpperCase() });

    if (!room) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    req.room = room;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to retrieve project." });
  }
}

module.exports = { roomMiddleware };
