const {
    AccessToken,
    RoomServiceClient,
    EgressClient,
    IngressClient
} = require("livekit-server-sdk");
require("dotenv").config();

const host = process.env.LIVEKIT_HOST;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

if (!host || !apiKey || !apiSecret) {
    throw new Error("Variáveis do LiveKit não configuradas.");
}

const roomService = new RoomServiceClient(
    host,
    apiKey,
    apiSecret
);

const egressService = new EgressClient(
    host,
    apiKey,
    apiSecret
);

const ingressService = new IngressClient(
    host,
    apiKey,
    apiSecret
);

module.exports = {
    host,
    apiKey,
    apiSecret,
    AccessToken,
    roomService,
    egressService,
    ingressService
};