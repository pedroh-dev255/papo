const contactService = require("../services/contactService");

async function getInitial(req, res) {
    try {
        const {id, tenant_id} = req.user;

        const dados = await contactService.getInitialContacts(tenant_id, id);
        
        return res.status(200).json({
            success: true,
            message: "Contatos Encontrados",
            data: dados
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {
    getInitial
}