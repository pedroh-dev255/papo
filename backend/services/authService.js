const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const redis = require("../configs/redis");
const pool = require("../configs/database");
const storageService = require("./storageService");


async function login(data) {
    try {

        const [rows] = await pool.query("SELECT id, nome, avatar, unit_id, status, email, senha FROM users WHERE email = ? AND tenant_id = ?", [data.email, data.tenant]);

        if (rows.length === 0) {
            throw new Error("Usuário não encontrado");
        }

        const user = rows[0];

        if (!user.status || user.status !== "ativo" ) {
            throw new Error(`Usuario ${user.status} no sistema!`);
        }

        // =========================
        // VERIFICA SENHA
        // =========================
        const isPasswordValid = await bcrypt.compare(data.password, user.senha);

        if (!isPasswordValid) {
            throw new Error("Senha inválida");
        }

        let avatar=null;
        if(user.avatar !== null){
            avatar = await storageService.getSignedUrl(user.avatar);
        }

        const token = jwt.sign(
            { id: user.id, tenant_id: data.tenant, unit_id: user.unit_id, email: user.email, nome: user.nome },
            process.env.JWT_SECURITY,
            { expiresIn: process.env.JWT_EXPIRES },
        );

        await redis.set(
            `user:${user.id}:token`,
            token,
            "EX",
            process.env.JWT_EXPIRES_IN,
        );

        return {
            token,
            userdata: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                unit_id: user.unit_id,
                avatar,
            }
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

async function logout(id) {
  try {
    await redis.del(`user:${id}:token`);
    //await disconnectUserWS(id);

    return true;
  } catch (error) {
    throw new Error("Erro ao realizar logout");
  }

}

module.exports = {
    login,
    logout
}