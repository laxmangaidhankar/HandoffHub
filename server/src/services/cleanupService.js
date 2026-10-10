const Room = require("../models/Room");

let cleanupInterval = null;

// ─────────────────────────────────────────────────────────────────
// startCleanupService
//
// Runs every `intervalMs` milliseconds (default 30 s).
// Finds any active rooms whose expiresAt has passed, marks them
// expired, and notifies connected participants so the frontend
// can redirect or show an expiry notice.
// ─────────────────────────────────────────────────────────────────
const startCleanupService = (io, intervalMs = 30000) => {
  if (cleanupInterval) clearInterval(cleanupInterval);

  cleanupInterval = setInterval(async () => {
    try {
      const now = new Date();

      const expiredRooms = await Room.find({
        status: "active",
        expiresAt: { $lte: now },
      });

      for (const room of expiredRooms) {
        room.status = "expired";
        await room.save();

        if (io) {
          io.to(room.roomId).emit("room:expired", {
            roomId: room.roomId,
            message:
              "This project has reached its expiration time. " +
              "All encrypted data has been permanently erased.",
          });
        }
      }
    } catch (_) {
      // Cleanup errors are non-fatal — log silently
    }
  }, intervalMs);
};

const stopCleanupService = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};

module.exports = { startCleanupService, stopCleanupService };
