//authMiddleware
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const redis = require("../configs/redis");

dotenv.config();

async function authMiddleware(req, res, next) {
  try {
    // =========================
    // TOKEN
    // =========================

    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Acesso não autorizado",
      });
    }

    // =========================
    // JWT
    // =========================

    const decoded = jwt.verify(token, process.env.JWT_SECURITY);

    // =========================
    // validate jwt
    // =========================

    const redisToken = await redis.get(`user:${decoded.id}:token`);

    if (!redisToken || redisToken !== token) {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    // =========================
    // SAVE USER
    // =========================

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }
}

module.exports = authMiddleware;
