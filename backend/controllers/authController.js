const authMiddleware = require("../middlewares/authMiddleware");
const authService = require("../services/authService");
const tenantService = require("../services/tenantService");

async function login(req, res) {
    try {
        const { codigo, email, password } = req.body;

        if(!codigo || codigo == "" || codigo == null || !email || email == "" || email == null || !password || password == "" || password == null){
            return res.status(401).json({
                success: false,
                message: "Envie todos os dados necessarios."
            });
        }

        const tenant = await tenantService.getTenantByCodigo(codigo);
        
        if(!tenant || tenant == false){
            return res.status(401).json({
                success: false,
                message: "Código Invalido."
            });
        }

        const user = await authService.login({tenant:tenant.id, email, password});

        if(!user || user == null){
            return res.status(401).json({
                success: false,
                message: "Usuario não encontrado."
            })
        }

        return res.status(200).json({
            success: true,
            message: "Login Realizado com Sucesso.",
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function logout(req, res) {
    try {
        const { id } = req.user;
        const log = await authService.logout(id);

        return res.status(200).json({
            success: true,
            message: "Usuario Deslogado"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


module.exports = {
    login,
    logout
}