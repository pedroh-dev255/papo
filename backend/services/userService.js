const bcrypt = require("bcrypt");
const pool = require("../configs/database");

const storageService = require("./storageService");

async function register(data) {
    let avatar = null
    try {
        if(data.avatar !== null && data.avatar !== ""){
            avatar = await storageService.uploadAvatar(
                data.avatar,
                data.tenant
            );
        }
        
        const hash = await bcrypt.hash(data.password, 10);
        const [result] = await pool.query(
            `
            INSERT INTO users
            (
                tenant_id,
                unit_id,
                nome,
                email,
                senha,
                avatar
            )
            VALUES
            (?,?,?,?,?,?)
            `,
            [
                data.tenant,
                data.unit,
                data.nome,
                data.email,
                hash,
                avatar
            ]
        );

        return {
            id: result.insertId
        };

    } catch (error) {
        if(avatar != null){
            await storageService.deleteObject(avatar);
        }
        
        throw new Error("Erro ao realizar cadastro do usuario: ", error.message);
    }

}

module.exports = {
    register
};