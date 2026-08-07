const profileService = require("../services/profileService");

async function getProfile(req, res) {
    try {
        const userId = req.user.id;
        const { tenant_id } = req.user;
        const {id} = req.params;


        const data = await profileService.getProfile(tenant_id, id);
 
        return res.status(200).json({
            success: true,
            message: "Perfil encontrado!",
            fromMe: userId == id ? true : false,
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {
    getProfile
}