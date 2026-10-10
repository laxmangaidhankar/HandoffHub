const { createClient } = require("redis");
const config = require('./env');

const redis = createClient({
  url: config.REDIS_URL,
});

redis.on("error", (error) => {
  console.error("[Redis] Error:", error);
});

redis.on("connect", () => {
  console.log("[Redis] Connecting...");
});

redis.on("ready", () => {
  console.log("[Redis] Ready");
});

redis.on("reconnecting", () => {
  console.log("[Redis] Reconnecting...");
});

const connectRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }
};

module.exports = redis;
module.exports.connectRedis = connectRedis;