const http = require("http");
require("dotenv").config();

const app = require("./app");
const startWebSocket = require("./ws.js");

const redis = require("./configs/redis");
const pool = require("./configs/database");
const { connectMinio } = require("./configs/minio");

const PORT = process.env.PORT || 3000;

async function start() {
    console.log("==================================");
    console.log("        PAPO CHAT SERVER");
    console.log("==================================");
    console.log("Conectando MySQL...");
    await pool.query("SELECT 1");
    console.log("🟢 MySQL conectado");
    console.log("Conectando Redis...");
    await redis.connect();
    console.log("Conectando MinIO...");
    await connectMinio();


    const server = http.createServer(app);
    startWebSocket(server);

    
    server.listen(PORT, () => {
        console.log(`Servidor iniciado na porta ${PORT}`);
    });

}

start();