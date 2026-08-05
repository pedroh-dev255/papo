const pool = require("../configs/database");


async function getTenantByCodigo(codigo) {
    try {
        const [tenant] = await pool.query("SELECT * FROM tenant WHERE codigo = ?", [codigo]);

        if(tenant.length == 0){
            return false;
        }

        return tenant[0];
    } catch (error) {
        throw new Error("Erro ao validar Tenant");
    }
}


async function getUnitById(tenantId, UnitId) {
    try {
        const [unit] = await pool.query("SELECT u.nome, u.id FROM unit u INNER JOIN tenant t ON t.id = u.tenant_id WHERE u.tenant_id = ? AND u.id = ?", [tenantId, UnitId]);
        
        if(unit.length == 0){
            throw new Error("Unidade Invalida");
        }

        return unit[0];
    } catch (error) {
        throw new Error("Erro ao validar Unidade");
    }
}

module.exports = {
    getTenantByCodigo,
    getUnitById
}