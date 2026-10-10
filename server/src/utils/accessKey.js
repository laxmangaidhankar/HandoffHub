const crypto = require("crypto");
const bcrypt = require("bcrypt");

const ACCESS_KEY_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateAccessKey() {
  let key = "";

  for (let i = 0; i < 8; i++) {
    const index = crypto.randomInt(ACCESS_KEY_CHARS.length);
    key += ACCESS_KEY_CHARS[index];
  }

  return key;
}

async function hashAccessKey(accessKey) {
  return await bcrypt.hash(accessKey, 12);
}

async function verifyAccessKey(accessKey, accessKeyHash) {
  return await bcrypt.compare(accessKey, accessKeyHash);
}

module.exports = {
  generateAccessKey,
  hashAccessKey,
  verifyAccessKey,
};