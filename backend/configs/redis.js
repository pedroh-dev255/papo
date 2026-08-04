const { createClient } = require("redis");
require("dotenv").config();

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

client.on("error", (err) => {
  console.error("Redis Error:", err);
});

client.on("connect", () => {
  console.log("🟢 Redis conectado");
});

client.on("reconnecting", () => {
  console.log("🟡 Redis reconectando...");
});

module.exports = client;
