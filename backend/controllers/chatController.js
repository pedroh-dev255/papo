const chatService = require("../services/chatService");
const messageService = require("../services/messageService");

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

async function getChat(req, res) {
    try {
        const {tenant_id} = req.user;
        const userId = req.user.id;
        const {id} = req.body;

        if(!id || id == null || id == ""){
            throw new Error("Não foi possivel identificar usuario.");
        }

        if(userId == id){
            throw new Error("Você não pode falar consigo mesmo!");
        }

        const chat = await chatService.getChat(tenant_id, userId, id);

        return res.status(200).json({
            success: true,
            message: "Chat encontrado",
            chat
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function getChatData(req, res) {
    try {
        const { tenant_id } = req.user;
        const userId = req.user.id;
        const { id } = req.params;

         if(!id || id == null || id == ""){
            throw new Error("Não foi possivel identificar conversa.");
        }

        const chatData = await chatService.getChatData(tenant_id, id, userId);
        const messages = await messageService.getInitial(tenant_id, id, userId);

        return res.status(200).json({
            success: true,
            message: "Chat encontrado",
            chatData,
            messages
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    getInitial,
    getChat,
    getChatData
}