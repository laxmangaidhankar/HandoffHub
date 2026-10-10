const express = require("express");
const { saveEnv, getEnv, deleteEnv } = require("../../controllers/envController");
const { verifyRoomActive } = require("../../middleware/roomAccess");
const { authenticateSession } = require("../../middleware/authenticateSession");

const router = express.Router();

// POST /api/v1/rooms/:roomId/env  — Save encrypted project data blob
router.post("/:roomId/env", verifyRoomActive, authenticateSession, saveEnv);

// GET  /api/v1/rooms/:roomId/env  — Retrieve encrypted project data blob
router.get("/:roomId/env", verifyRoomActive, authenticateSession, getEnv);

// DELETE /api/v1/rooms/:roomId/env — Wipe encrypted data from Redis
router.delete("/:roomId/env", verifyRoomActive, authenticateSession, deleteEnv);

module.exports = router;
