const chatService = require("../services/chatService");

async function getInitial(req, res) {
    try {
        const {id, tenant_id } = req.user;

        const chats = await chatService.getInitial(id, tenant_id);

        return res.status(200).json({
            success: true,
            message: "Conversas encontradas.",
            chats
        })

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