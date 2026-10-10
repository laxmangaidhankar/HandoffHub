const { v4: uuidv4 } = require("uuid");
const Room = require("../models/Room");
const logger = require("../utils/logger");
const { generateRoomId } = require("../utils/roomId");
const { sessionCookieOptions } = require("../utils/sessionCookie");
const { generateRoomToken } = require("../utils/roomToken");
const {
  generateAccessKey,
  hashAccessKey,
  verifyAccessKey,
} = require("../utils/accessKey");

// ─────────────────────────────────────────────────────────────────
// POST /api/v1/rooms
// Create a new project space.
// ─────────────────────────────────────────────────────────────────
async function createRoom(req, res) {
  try {
    const { roomName, displayName, durationMinutes = 1440 } = req.body;

    const trimmedRoomName = String(roomName || "").trim();
    const trimmedDisplayName = String(displayName || "").trim();

    if (!trimmedRoomName || !trimmedDisplayName) {
      return res.status(400).json({
        success: false,
        error: "Project name and your display name are required.",
      });
    }

    if (trimmedRoomName.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Project name must be at least 3 characters.",
      });
    }

    if (trimmedRoomName.length > 40 || trimmedDisplayName.length > 40) {
      return res.status(400).json({
        success: false,
        error: "Project name and display name must not exceed 40 characters.",
      });
    }

    const parsedDuration = Number(durationMinutes);
    const validDuration =
      Number.isInteger(parsedDuration) &&
      parsedDuration > 0 &&
      parsedDuration <= 1440
        ? parsedDuration
        : 1440;

    // Generate a unique room ID + access key
    let roomId, accessKey;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      roomId = generateRoomId(6);
      accessKey = generateAccessKey();
      const existingRoom = await Room.exists({ roomId });
      if (!existingRoom) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      logger.error(
        { event: "room_id_generation_failed", attempts },
        "Failed to generate unique project ID"
      );
      return res.status(500).json({
        success: false,
        error: "Failed to generate a unique project ID. Please try again.",
      });
    }

    const accessKeyHash = await hashAccessKey(accessKey);
    const expiresAt = new Date(Date.now() + validDuration * 60 * 1000);

    const room = await Room.create({
      roomId,
      roomName: trimmedRoomName,
      displayName: trimmedDisplayName,
      accessKeyHash,
      expiresAt,
      status: "active",
    });

    // Issue session JWT for the creator (role: owner)
    const participantId = uuidv4();
    const sessionToken = generateRoomToken({
      roomId: room.roomId,
      participantId,
      displayName: room.displayName,
      role: "owner",
      expiresAt: room.expiresAt,
    });

    res.cookie("session", sessionToken, {
      ...sessionCookieOptions,
      expires: room.expiresAt,
    });

    logger.info(
      {
        event: "project_created",
        roomId: room.roomId,
        roomName: room.roomName,
        durationMinutes: validDuration,
      },
      "Project created"
    );

    return res.status(201).json({
      success: true,
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        displayName: room.displayName,
        accessKey,
        expiresAt: room.expiresAt,
        status: room.status,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    logger.error(
      { event: "project_creation_failed", err: error },
      "Failed to create project"
    );
    return res.status(500).json({
      success: false,
      error: "Failed to create project.",
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/v1/rooms/:roomId/status
// Public status check (no auth required).
// ─────────────────────────────────────────────────────────────────
async function getRoomStatus(req, res) {
  try {
    const { room } = req;

    return res.status(200).json({
      success: true,
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        displayName: room.displayName,
        expiresAt: room.expiresAt,
        status: room.status,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    logger.error(
      { event: "project_status_failed", roomId: req.params.roomId, err: error },
      "Failed to retrieve project status"
    );
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve project status.",
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/v1/rooms/:roomId
// Authenticated project detail (session required).
// ─────────────────────────────────────────────────────────────────
async function getRoom(req, res) {
  try {
    const { room } = req;

    return res.status(200).json({
      success: true,
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        expiresAt: room.expiresAt,
        participantId: req.user.participantId,
        displayName: req.user.displayName,
        role: req.user.role,
        status: room.status,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    logger.error(
      { event: "project_retrieval_failed", roomId: req.params.roomId, err: error },
      "Failed to retrieve project"
    );
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve project.",
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// POST /api/v1/rooms/:roomId/join
// Verify access key and issue a session for the joining participant.
// ─────────────────────────────────────────────────────────────────
async function joinRoom(req, res) {
  try {
    const { accessKey, displayName } = req.body;
    const { room } = req;

    if (!accessKey || !displayName) {
      return res.status(400).json({
        success: false,
        error: "Access key and display name are required.",
      });
    }

    const trimmedDisplayName = String(displayName).trim();
    const trimmedAccessKey = String(accessKey).trim();

    if (!trimmedDisplayName) {
      return res.status(400).json({
        success: false,
        error: "Display name cannot be empty.",
      });
    }

    if (trimmedDisplayName.length > 40) {
      return res.status(400).json({
        success: false,
        error: "Display name must not exceed 40 characters.",
      });
    }

    // Check room expiration
    if (new Date(room.expiresAt).getTime() <= Date.now()) {
      return res.status(410).json({
        success: false,
        error: "This project has expired.",
      });
    }

    // Verify access key against bcrypt hash
    const isValid = await verifyAccessKey(trimmedAccessKey, room.accessKeyHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid access key.",
      });
    }

    // Issue session JWT for the joining participant (role: member)
    const participantId = uuidv4();
    const sessionToken = generateRoomToken({
      roomId: room.roomId,
      participantId,
      displayName: trimmedDisplayName,
      role: "member",
      expiresAt: room.expiresAt,
    });

    res.cookie("session", sessionToken, {
      ...sessionCookieOptions,
      expires: room.expiresAt,
    });

    logger.info(
      {
        event: "project_joined",
        roomId: room.roomId,
        displayName: trimmedDisplayName,
      },
      "Participant joined project"
    );

    return res.status(200).json({
      success: true,
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        expiresAt: room.expiresAt,
        status: room.status,
      },
      participant: {
        participantId,
        displayName: trimmedDisplayName,
        role: "member",
      },
    });
  } catch (error) {
    logger.error(
      { event: "project_join_failed", roomId: req.params.roomId, err: error },
      "Failed to join project"
    );
    return res.status(500).json({
      success: false,
      error: "Failed to join project.",
    });
  }
}

module.exports = { createRoom, getRoom, joinRoom, getRoomStatus };
