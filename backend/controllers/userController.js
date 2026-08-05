const tenantService = require("../services/tenantService");
const userService = require("../services/userService");

function validateRegister(data) {

    if (!data.codigo || !data.codigo.trim()) {
        return "Código da empresa é obrigatório.";
    }

    if (!data.unit) {
        return "Unidade é obrigatória.";
    }

    if (!data.nome || !data.nome.trim()) {
        return "Nome é obrigatório.";
    }

    if (data.nome.trim().length < 3) {
        return "Nome deve possuir pelo menos 3 caracteres.";
    }

    if (!data.email || !data.email.trim()) {
        return "E-mail é obrigatório.";
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(data.email)) {
        return "E-mail inválido.";
    }

    if (!data.password) {
        return "Senha é obrigatória.";
    }

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=\[\]{};:,.<>])[A-Za-z\d@$!%*?&#^()_\-+=\[\]{};:,.<>]{8,}$/;

    if (!passwordRegex.test(data.password)) {
        return "A senha deve possuir no mínimo 8 caracteres, contendo letra maiúscula, letra minúscula, número e caractere especial.";
    }

    return null;

}

async function register(req, res) {

    try {

        const { codigo, unit, nome, email, password } = req.body;

        const validation = validateRegister(req.body, req.file);

        if (validation) {
            return res.status(400).json({
                success: false,
                message: validation
            });
        }

        const tenant = await tenantService.getTenantByCodigo(codigo);
        

        if (!tenant) {
            return res.status(400).json({
                success: false,
                message: "Código inválido."
            });
        }

        const unidade = await tenantService.getUnitById(tenant.id, unit);

        if (!unidade) {
            return res.status(400).json({
                success: false,
                message: "Unidade Invalida."
            });
        }

        const user = await userService.register({
            tenant: tenant.id,
            unit: unidade.id,
            nome,
            email,
            password,
            avatar: req.file ?? null
        });

        return res.json({
            success: true,
            data: user
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

}

module.exports = {
    register
};