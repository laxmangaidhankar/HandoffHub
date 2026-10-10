const Room = require("../models/Room");

// ─────────────────────────────────────────────────────────────────
// verifyRoomActive
//
// Looks up the room by :roomId, confirms it exists and is still
// active, and attaches it to req.room for downstream handlers.
// Returns appropriate HTTP errors for expired or missing projects.
// ─────────────────────────────────────────────────────────────────
const verifyRoomActive = async (req, res, next) => {
  try {
    const roomId = req.params.roomId || req.body.roomId;

    if (!roomId) {
      return res.status(400).json({ success: false, error: "Project ID is required." });
    }

    const room = await Room.findOne({ roomId: roomId.toUpperCase() });

    if (!room) {
      return res.status(404).json({ success: false, error: "Project not found or has been deleted." });
    }

    if (room.status !== "active") {
      return res.status(410).json({
        success: false,
        error: `Project is no longer active (status: ${room.status}).`,
      });
    }

    if (new Date() > new Date(room.expiresAt)) {
      room.status = "expired";
      await room.save();
      return res.status(410).json({
        success: false,
        error: "Project has expired.",
      });
    }

    req.room = room;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error while verifying project status.",
    });
  }
};

module.exports = { verifyRoomActive };
