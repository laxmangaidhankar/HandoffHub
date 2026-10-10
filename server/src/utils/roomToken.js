const jwt = require("jsonwebtoken");
const env = require('../config/env');

function generateRoomToken({
  roomId,
  participantId,
  displayName,
  role,
  expiresAt,
}) {
  const expiresInSeconds = Math.floor(
    (new Date(expiresAt).getTime() - Date.now()) / 1000
  );

  return jwt.sign(
    {
      roomId,
      participantId,
      displayName,
      role,
    },
    env.JWT_SECRET,
    {
      expiresIn: expiresInSeconds,
    }
  );
}

module.exports = {
  generateRoomToken,
};