const redis = require("../config/redis");

const getEnvKey = (roomId) => {
  if (!roomId) {
    throw new Error("Room ID is required.");
  }

  return `room:${roomId}:env`;
};

// Save encrypted ENV data
const saveEncryptedEnv = async (
  roomId,
  encryptedEnv,
  ttl
) => {
  if (!roomId) {
    throw new Error("Room ID is required.");
  }

  if (!encryptedEnv) {
    throw new Error("Encrypted ENV data is required.");
  }

  if (!Number.isInteger(ttl) || ttl <= 0) {
    throw new Error("Valid TTL is required.");
  }

  const key = getEnvKey(roomId);

  await redis.set(
    key,
    JSON.stringify(encryptedEnv),
    {
      EX: ttl,
    }
  );

  return true;
};

// Get encrypted ENV data
const getEncryptedEnv = async (roomId) => {
  const key = getEnvKey(roomId);

  const data = await redis.get(key);

  if (!data) {
    return null;
  }

  return JSON.parse(data);
};

// Delete encrypted ENV data
const deleteEncryptedEnv = async (roomId) => {
  const key = getEnvKey(roomId);

  await redis.del(key);

  return true;
};

module.exports = {
  saveEncryptedEnv,
  getEncryptedEnv,
  deleteEncryptedEnv,
};