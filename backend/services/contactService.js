const pool = require("../configs/database");
const storage = require("./storageService");


async function getInitialContacts(tenant_id, id) {
    try {
        const [rows] = await pool.query(`
            SELECT u.id, u.unit_id, u.avatar, u.nome, u.email, u.telefone, u.ramal, u.ultimo_acesso, un.nome as unidade FROM users u INNER JOIN unit un ON u.unit_id = un.id WHERE u.status = 'ativo' AND u.tenant_id = ? AND u.id != ?
        `, [tenant_id, id]);
        
        await Promise.all(
            rows.map(async (contact) => {
                if (contact.avatar) {
                    contact.avatar = await storage.getSignedUrl(contact.avatar);
                }
            })
        );

        const contactsByUnit = rows.reduce((acc, contact) => {
            const unit = contact.unit_id;

            if (!acc[unit]) {
                acc[unit] = {
                    nome: contact.unidade,
                    contatos: []
                };
            }

            acc[unit].contatos.push(contact);

            return acc;
        }, {});

        return contactsByUnit;
        
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    getInitialContacts
};