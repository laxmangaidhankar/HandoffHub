const express = require("express");
const {
  createRoom,
  getRoom,
  joinRoom,
  getRoomStatus,
} = require("../../controllers/roomController");
const { verifyRoomActive } = require("../../middleware/roomAccess");
const { roomCreateLimiter, roomJoinLimiter } = require("../../middleware/rateLimiter");
const { roomMiddleware } = require("../../middleware/roomMiddleware");
const { authenticateSession } = require("../../middleware/authenticateSession");

const router = express.Router();

// POST   /api/v1/rooms              — Create a new project space
router.post("/", roomCreateLimiter, createRoom);

// GET    /api/v1/rooms/:roomId/status — Public existence + status check (no auth)
router.get("/:roomId/status", verifyRoomActive, getRoomStatus);

// GET    /api/v1/rooms/:roomId        — Authenticated project detail
router.get("/:roomId", authenticateSession, verifyRoomActive, getRoom);

// POST   /api/v1/rooms/:roomId/join   — Verify access key + issue session
router.post("/:roomId/join", roomMiddleware, roomJoinLimiter, joinRoom);

module.exports = router;
