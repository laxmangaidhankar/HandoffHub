const crypto = require("crypto");

let socketIO = null;

// ─────────────────────────────────────────────────────────────────
// Notify all participants in a project that the shared data blob
// has been updated so their panels reload.
// Called by envController after a successful save.
// ─────────────────────────────────────────────────────────────────
const emitProjectDataUpdated = (roomId, updatedBy) => {
  if (!socketIO) return;

  // The client still listens for "env:updated" — keep the event name
  // for backward compatibility with the frontend listener in RoomLayout.
  socketIO.to(roomId).emit("env:updated", {
    roomId,
    updatedBy,
  });
};

// ─────────────────────────────────────────────────────────────────
// Socket.IO server setup
// ─────────────────────────────────────────────────────────────────
const initSocketService = (io) => {
  socketIO = io;

  // roomId → Map(participantId → { participantId, displayName, socketIds: Set, publicKey })
  const roomParticipants = new Map();

  io.on("connection", (socket) => {

    // ── join-room ─────────────────────────────────────────────────
    // Called by the client immediately after connecting.
    // Adds the participant to the in-memory room map and broadcasts
    // the updated member list to everyone in the room.
    socket.on("join-room", () => {
      const { roomId, participantId, displayName } = socket.user;

      if (!roomId || !participantId || !displayName) return;

      // Prevent duplicate joins on the same socket
      if (socket.currentRoomId) return;

      const cleanRoomId = roomId.toUpperCase();

      socket.join(cleanRoomId);
      socket.currentRoomId = cleanRoomId;
      socket.participantId = participantId;
      socket.displayName = displayName;

      // Initialise room map if needed
      if (!roomParticipants.has(cleanRoomId)) {
        roomParticipants.set(cleanRoomId, new Map());
      }

      const participants = roomParticipants.get(cleanRoomId);

      if (!participants.has(participantId)) {
        participants.set(participantId, {
          participantId,
          displayName,
          socketIds: new Set(),
          publicKey: null,
        });
      }

      participants.get(participantId).socketIds.add(socket.id);

      // Broadcast updated member list to the whole room
      const participantList = Array.from(participants.values()).map((p) => ({
        participantId: p.participantId,
        displayName: p.displayName,
      }));

      io.to(cleanRoomId).emit("room:members", {
        participants: participantList,
        participantCount: participantList.length,
      });

      // Send existing public keys (for ECDH key exchange) to the new joiner
      const existingPublicKeys = Array.from(participants.values())
        .filter((p) => p.publicKey && p.participantId !== participantId)
        .map((p) => ({
          participantId: p.participantId,
          displayName: p.displayName,
          publicKey: p.publicKey,
        }));

      socket.emit("key:existing-participants", {
        participants: existingPublicKeys,
      });
    });

    // ── chat:send ─────────────────────────────────────────────────
    // Client sends an AES-GCM encrypted message.
    // Server relays ciphertext + iv to the whole room — never decrypts.
    socket.on("chat:send", ({ ciphertext, iv }) => {
      if (!socket.currentRoomId || !socket.participantId) return;

      if (
        typeof ciphertext !== "string" || !ciphertext ||
        typeof iv !== "string" || !iv
      ) return;

      io.to(socket.currentRoomId).emit("chat:message", {
        messageId: crypto.randomUUID(),
        participantId: socket.participantId,
        displayName: socket.displayName,
        ciphertext,
        iv,
        timestamp: new Date().toISOString(),
      });
    });

    // ── chat:key:request ──────────────────────────────────────────
    // Requester asks all peers for the chat AES key.
    socket.on("chat:key:request", () => {
      if (!socket.currentRoomId || !socket.participantId) return;

      socket.to(socket.currentRoomId).emit("chat:key:request", {
        participantId: socket.participantId,
        displayName: socket.displayName,
      });
    });

    // ── chat:key:share ────────────────────────────────────────────
    // Peer wraps the chat AES key with the recipient's pairwise key
    // and sends it. Server unicasts to the recipient's socket IDs.
    socket.on("chat:key:share", ({ recipientParticipantId, wrappedKey, iv }) => {
      if (!socket.currentRoomId || !socket.participantId) return;
      if (!recipientParticipantId || !wrappedKey || !iv) return;

      const participants = roomParticipants.get(socket.currentRoomId);
      if (!participants) return;

      const recipient = participants.get(recipientParticipantId);
      if (!recipient) return;

      for (const socketId of recipient.socketIds) {
        io.to(socketId).emit("chat:key:share", {
          senderParticipantId: socket.participantId,
          recipientParticipantId,
          wrappedKey,
          iv,
        });
      }
    });

    // ── key:publish ───────────────────────────────────────────────
    // Client publishes its ECDH public key so peers can derive
    // pairwise keys for wrapping the room / chat AES keys.
    socket.on("key:publish", ({ publicKey }) => {
      if (!socket.currentRoomId || !socket.participantId) return;
      if (typeof publicKey !== "string" || !publicKey) return;

      const participants = roomParticipants.get(socket.currentRoomId);
      if (!participants) return;

      const participant = participants.get(socket.participantId);
      if (!participant) return;

      participant.publicKey = publicKey;

      socket.to(socket.currentRoomId).emit("key:participant-public", {
        participantId: socket.participantId,
        displayName: socket.displayName,
        publicKey,
      });
    });

    // ── room:key:request ──────────────────────────────────────────
    // New participant asks peers to send them the room AES key.
    socket.on("room:key:request", () => {
      if (!socket.currentRoomId || !socket.participantId) return;

      socket.to(socket.currentRoomId).emit("room:key:request", {
        participantId: socket.participantId,
        displayName: socket.displayName,
      });
    });

    // ── room:key:share ────────────────────────────────────────────
    // Peer wraps the room AES key with the recipient's pairwise key.
    // Server broadcasts to the whole room; the client filters by
    // recipientParticipantId. Server never sees the plaintext key.
    socket.on("room:key:share", ({ recipientParticipantId, wrappedKey, iv }) => {
      if (!socket.currentRoomId || !socket.participantId) return;
      if (!recipientParticipantId || !wrappedKey || !iv) return;

      const participants = roomParticipants.get(socket.currentRoomId);
      if (!participants) return;

      const recipient = participants.get(recipientParticipantId);
      if (!recipient) return;

      io.to(socket.currentRoomId).emit("room:key:share", {
        senderParticipantId: socket.participantId,
        recipientParticipantId,
        wrappedKey,
        iv,
      });
    });

    // ── leave-room ────────────────────────────────────────────────
    socket.on("leave-room", () => {
      if (!socket.currentRoomId || !socket.participantId) return;

      removeParticipantConnection(
        socket.currentRoomId,
        socket.participantId,
        socket.id
      );
    });

    // ── disconnect ────────────────────────────────────────────────
    socket.on("disconnect", () => {
      if (socket.currentRoomId && socket.participantId) {
        removeParticipantConnection(
          socket.currentRoomId,
          socket.participantId,
          socket.id
        );
      }
    });

    // ─────────────────────────────────────────────────────────────
    // removeParticipantConnection
    // Removes a socket from the participant's active socket set.
    // Removes the participant entirely when their last socket goes.
    // Broadcasts an updated member list after removal.
    // ─────────────────────────────────────────────────────────────
    function removeParticipantConnection(roomId, participantId, socketId) {
      const participants = roomParticipants.get(roomId);
      if (!participants) return;

      const participant = participants.get(participantId);
      if (!participant) return;

      participant.socketIds.delete(socketId);
      socket.leave(roomId);

      // Only fully remove participant when their last socket closes
      if (participant.socketIds.size === 0) {
        participants.delete(participantId);
      }

      // Clean up empty room
      if (participants.size === 0) {
        roomParticipants.delete(roomId);
        return;
      }

      // Broadcast updated member list
      const participantList = Array.from(participants.values()).map((p) => ({
        participantId: p.participantId,
        displayName: p.displayName,
      }));

      io.to(roomId).emit("room:members", {
        participants: participantList,
        participantCount: participantList.length,
      });
    }
  });
};

module.exports = {
  initSocketService,
  emitProjectDataUpdated,
  // keep old name as alias so any existing import still works
  emitEnvUpdated: emitProjectDataUpdated,
};
