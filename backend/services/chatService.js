const pool = require("../configs/database");
const storage = require("./storageService");

async function getInitial(user_id, tenant_id) {
    try {
        const [rows] = await pool.query(`
            SELECT
                c.id,
                c.type,

                CASE
                    WHEN c.type = 'privado' THEN other_user.nome
                    ELSE c.nome
                END AS nome,

                CASE
                    WHEN c.type = 'privado' THEN other_user.avatar
                    ELSE c.avatar
                END AS avatar,

                c.descricao,
                c.updated_at,

                cpu.fixado,
                cpu.silenciado_ate,

                m.id AS last_message_id,
                m.type AS last_message_type,
                m.texto AS last_message,
                m.created_at AS last_message_date,

                u.id AS sender_id,
                u.nome AS sender_name,

                (
                    SELECT COUNT(*)
                    FROM mensagens mm
                    LEFT JOIN mensagem_leitura ml
                        ON ml.mensagem_id = mm.id
                        AND ml.user_id = ?
                    WHERE
                        mm.chat_id = c.id
                        AND mm.sender_id <> ?
                        AND mm.deleted_at IS NULL
                        AND ml.id IS NULL
                ) AS unread

            FROM chat c

            INNER JOIN chat_participantes cp
                ON cp.chat_id = c.id

            LEFT JOIN chat_configuracao_usuario cpu
                ON cpu.chat_id = c.id
                AND cpu.user_id = ?

            LEFT JOIN mensagens m
                ON m.id = c.last_message_id

            LEFT JOIN users u
                ON u.id = m.sender_id

            /* Busca o outro participante do chat privado */
            LEFT JOIN chat_participantes other_cp
                ON other_cp.chat_id = c.id
                AND other_cp.user_id <> ?
                AND other_cp.left_at IS NULL

            LEFT JOIN users other_user
                ON other_user.id = other_cp.user_id

            WHERE
                cp.user_id = ?
                AND cp.left_at IS NULL
                AND c.deleted_at IS NULL
                AND c.tenant_id = ?

            ORDER BY
                cpu.fixado DESC,
                COALESCE(m.created_at, c.created_at) DESC
        `, [
            user_id, // unread
            user_id, // unread
            user_id, // chat_configuracao_usuario
            user_id, // other participant
            user_id, // chat_participantes
            tenant_id
        ]);

        await Promise.all(
            rows.map(async (chat) => {
                if (chat.avatar) {
                    chat.avatar = await storage.getSignedUrl(chat.avatar);
                }
            })
        );

        return rows;


    } catch (error) {
        throw new Error(error.message);
    }
}

async function getChat(tenant_id, userId, contactId) {
    try {
        const [rows] = await pool.query(`
            SELECT c.id
            FROM chat c
            INNER JOIN chat_participantes cp
                ON cp.chat_id = c.id
                AND cp.tenant_id = c.tenant_id
            WHERE c.tenant_id = ?
                AND c.type = 'privado'
                AND c.deleted_at IS NULL
                AND cp.left_at IS NULL
                AND cp.user_id IN (?, ?)
            GROUP BY c.id
            HAVING COUNT(DISTINCT cp.user_id) = 2
                AND COUNT(*) = 2
            LIMIT 1
        `, [tenant_id, userId, contactId]);

        if (rows.length > 0) {
            return rows[0].id;
        }

        return await createPrivateChat(
            tenant_id,
            userId,
            contactId
        );

    } catch (error) {
        throw new Error(error.message);
    }
}

async function createPrivateChat(tenant_id, userId, contactId) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const privateKey = [userId, contactId]
            .sort((a, b) => a - b)
            .join(':');

        const [chatResult] = await connection.query(`
            INSERT INTO chat (
                tenant_id,
                type,
                owner,
                private_key
            )
            VALUES (?, 'privado', ?, ?)
        `, [
            tenant_id,
            userId,
            privateKey
        ]);

        const chatId = chatResult.insertId;

        await connection.query(`
            INSERT INTO chat_participantes (
                tenant_id,
                chat_id,
                user_id,
                role
            )
            VALUES
                (?, ?, ?, 'owner'),
                (?, ?, ?, 'membro')
        `, [
            tenant_id,
            chatId,
            userId,

            tenant_id,
            chatId,
            contactId
        ]);

        await connection.commit();

        return chatId;

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
}


async function getChatData(tenant_id, chatId, userId) {
    try {
        const [rows] = await pool.query(`
            SELECT
                c.id,
                c.type,

                CASE
                    WHEN c.type = 'privado' THEN other_user.id
                    ELSE c.id
                END AS target_id,

                CASE
                    WHEN c.type = 'privado' THEN other_user.nome
                    ELSE c.nome
                END AS nome,

                CASE
                    WHEN c.type = 'privado' THEN other_user.avatar
                    ELSE c.avatar
                END AS avatar

            FROM chat c

            INNER JOIN chat_participantes cp
                ON cp.chat_id = c.id
                AND cp.tenant_id = c.tenant_id
                AND cp.user_id = ?
                AND cp.left_at IS NULL

            LEFT JOIN chat_participantes other_cp
                ON other_cp.chat_id = c.id
                AND other_cp.tenant_id = c.tenant_id
                AND other_cp.user_id <> ?
                AND other_cp.left_at IS NULL

            LEFT JOIN users other_user
                ON other_user.id = other_cp.user_id

            WHERE
                c.id = ?
                AND c.tenant_id = ?
                AND c.deleted_at IS NULL

            LIMIT 1
        `, [
            userId,
            userId,
            chatId,
            tenant_id
        ]);

        if (rows.length === 0) {
            return null;
        }

        const chat = rows[0];

        if (chat.avatar) {
            chat.avatar = await storage.getSignedUrl(chat.avatar);
        }

        return {
            id: chat.id,
            type: chat.type,
            target_id: chat.target_id,
            nome: chat.nome,
            avatar: chat.avatar
        };

    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    getInitial,
    getChat,
    getChatData
};