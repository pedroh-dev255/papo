const pool = require("../configs/database");
const storage = require("./storageService");

async function getProfile(tenant_id, id) {
    try {
        const [rows] = await pool.query("SELECT u.id, u.unit_id, u.avatar, u.nome, u.email, u.telefone, u.ramal, u.ultimo_acesso, un.nome as unidade FROM users u INNER JOIN unit un ON u.unit_id = un.id WHERE u.status = 'ativo' AND u.tenant_id = ? AND u.id = ?", [tenant_id, id])
    
        await Promise.all(
            rows.map(async (contact) => {
                if (contact.avatar) {
                    contact.avatar = await storage.getSignedUrl(contact.avatar);
                }
            })
        );

        return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    getProfile
}