const {
  saveEncryptedEnv,
  getEncryptedEnv,
  deleteEncryptedEnv,
} = require("../services/envStore");

const { emitProjectDataUpdated } = require("../services/socketService");

const Room = require("../models/Room");

// ─────────────────────────────────────────────────────────────────
// POST /api/v1/rooms/:roomId/env
// Save the encrypted project data blob (overview, milestones,
// deliverables, credentials — all stored as one AES-GCM ciphertext).
// ─────────────────────────────────────────────────────────────────
const saveEnv = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { encryptedEnv } = req.body;

    if (!roomId) {
      return res.status(400).json({ success: false, error: "Project ID is required." });
    }

    if (!encryptedEnv) {
      return res.status(400).json({ success: false, error: "Encrypted data is required." });
    }

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const remainingMs = new Date(room.expiresAt).getTime() - Date.now();

    if (remainingMs <= 0) {
      return res.status(410).json({ success: false, error: "Project has expired." });
    }

    // TTL in seconds for Redis
    const ttl = Math.floor(remainingMs / 1000);

    if (ttl <= 0) {
      return res.status(410).json({ success: false, error: "Project is about to expire." });
    }

    await saveEncryptedEnv(roomId, encryptedEnv, ttl);

    // Notify other participants so their panels reload
    emitProjectDataUpdated(roomId, req.user.participantId);

    return res.status(200).json({ success: true, message: "Project data saved." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to save project data." });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/v1/rooms/:roomId/env
// Retrieve the encrypted project data blob.
// ─────────────────────────────────────────────────────────────────
const getEnv = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ success: false, error: "Project ID is required." });
    }

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    if (new Date(room.expiresAt).getTime() <= Date.now()) {
      return res.status(410).json({ success: false, error: "Project has expired." });
    }

    const encryptedEnv = await getEncryptedEnv(roomId);

    return res.status(200).json({ encryptedEnv: encryptedEnv ?? null });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to retrieve project data." });
  }
};

// ─────────────────────────────────────────────────────────────────
// DELETE /api/v1/rooms/:roomId/env
// Wipe the encrypted blob from Redis.
// ─────────────────────────────────────────────────────────────────
const deleteEnv = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ success: false, error: "Project ID is required." });
    }

    await deleteEncryptedEnv(roomId);

    return res.status(200).json({ success: true, message: "Project data deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete project data." });
  }
};

module.exports = { saveEnv, getEnv, deleteEnv };
