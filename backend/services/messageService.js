const pool = require("../configs/database");
const storage = require("./storageService");

// Retorna as últimas 20 mensagens de um chat.
// userId é usado para:
// - verificar se o usuário participa do chat
// - identificar fromMe
// - verificar leitura
async function getInitial(tenant_id, chatId, userId) {
    try {
        /*
         * Primeiro garantimos que o usuário pertence ao chat.
         */
        const [access] = await pool.query(`
            SELECT 1
            FROM chat_participantes
            WHERE
                tenant_id = ?
                AND chat_id = ?
                AND user_id = ?
                AND left_at IS NULL
            LIMIT 1
        `, [
            tenant_id,
            chatId,
            userId
        ]);

        if (access.length === 0) {
            throw new Error("Usuário não participa deste chat.");
        }

        /*
         * Busca as últimas 20 mensagens.
         *
         * Buscamos DESC para pegar as mais recentes.
         * Depois ordenamos novamente em ASC no resultado,
         * para o frontend receber:
         *
         * mensagem antiga
         * mensagem
         * mensagem
         * mensagem nova
         */
        const [rows] = await pool.query(`
            SELECT
                m.id,
                m.chat_id,
                m.sender_id,
                m.type,
                m.texto,
                m.device,
                m.reply_to,
                m.edited_at,
                m.deleted_at,
                m.created_at,
                m.updated_at,

                u.nome AS sender_name,
                u.avatar AS sender_avatar,

                /*
                 * Reply
                 */
                rm.id AS reply_id,
                rm.sender_id AS reply_sender_id,
                rm.type AS reply_type,
                rm.texto AS reply_texto,
                rm.deleted_at AS reply_deleted_at,

                ru.nome AS reply_sender_name,

                /*
                 * Arquivo
                 */
                ma.id AS arquivo_id,
                ma.nome_original AS arquivo_nome,
                ma.mime_type AS arquivo_mime,
                ma.storage_key AS arquivo_storage_key,
                ma.tamanho AS arquivo_tamanho,
                ma.thumbnail_key AS arquivo_thumbnail_key,
                ma.duracao AS arquivo_duracao

            FROM mensagens m

            INNER JOIN users u
                ON u.id = m.sender_id
                AND u.tenant_id = m.tenant_id

            LEFT JOIN mensagens rm
                ON rm.id = m.reply_to
                AND rm.tenant_id = m.tenant_id

            LEFT JOIN users ru
                ON ru.id = rm.sender_id
                AND ru.tenant_id = rm.tenant_id

            LEFT JOIN mensagem_arquivo ma
                ON ma.mensagem_id = m.id
                AND ma.tenant_id = m.tenant_id
                AND ma.deleted_at IS NULL

            WHERE
                m.tenant_id = ?
                AND m.chat_id = ?

            ORDER BY m.created_at DESC, m.id DESC
            LIMIT 20
        `, [
            tenant_id,
            chatId
        ]);

        /*
         * Reverte para ordem cronológica.
         */
        rows.reverse();

        /*
         * Monta os dados adicionais de cada mensagem.
         */
        const messages = await Promise.all(
            rows.map(async (message) => {

                /*
                 * Avatar do remetente
                 */
                let senderAvatar = message.sender_avatar;

                if (senderAvatar) {
                    senderAvatar = await storage.getSignedUrl(
                        senderAvatar
                    );
                }

                /*
                 * Arquivo
                 */
                let arquivo = null;

                if (message.arquivo_id) {
                    arquivo = {
                        id: message.arquivo_id,
                        nome: message.arquivo_nome,
                        mime_type: message.arquivo_mime,
                        tamanho: message.arquivo_tamanho,
                        duracao: message.arquivo_duracao,
                        url: null,
                        thumbnail: null
                    };

                    if (message.arquivo_storage_key) {
                        arquivo.url = await storage.getSignedUrl(
                            message.arquivo_storage_key
                        );
                    }

                    if (message.arquivo_thumbnail_key) {
                        arquivo.thumbnail = await storage.getSignedUrl(
                            message.arquivo_thumbnail_key
                        );
                    }
                }

                /*
                 * Reply
                 */
                let reply = null;

                if (message.reply_id) {
                    reply = {
                        id: message.reply_id,
                        sender_id: message.reply_sender_id,
                        sender_name: message.reply_sender_name,
                        type: message.reply_type,
                        texto: message.reply_deleted_at
                            ? null
                            : message.reply_texto,
                        deleted: !!message.reply_deleted_at
                    };
                }

                return {
                    id: message.id,
                    chat_id: message.chat_id,

                    sender: {
                        id: message.sender_id,
                        nome: message.sender_name,
                        avatar: senderAvatar
                    },

                    fromMe: message.sender_id === userId,

                    type: message.type,
                    texto: message.deleted_at
                        ? null
                        : message.texto,

                    device: message.device,

                    edited_at: message.edited_at,
                    deleted: !!message.deleted_at,

                    created_at: message.created_at,
                    updated_at: message.updated_at,

                    reply_to: reply,

                    arquivo,

                    reactions: []
                };
            })
        );

        /*
         * Busca as reações das mensagens.
         *
         * Fazemos uma segunda query para evitar duplicar
         * mensagens por causa do JOIN.
         */
        if (messages.length > 0) {
            const messageIds = messages.map(message => message.id);

            const placeholders = messageIds
                .map(() => "?")
                .join(",");

            const [reactions] = await pool.query(`
                SELECT
                    mr.mensagem_id,
                    mr.user_id,
                    mr.emoji,
                    u.nome AS user_name
                FROM mensagem_reacao mr

                INNER JOIN users u
                    ON u.id = mr.user_id
                    AND u.tenant_id = mr.tenant_id

                WHERE
                    mr.tenant_id = ?
                    AND mr.mensagem_id IN (${placeholders})

                ORDER BY mr.id ASC
            `, [
                tenant_id,
                ...messageIds
            ]);

            const reactionsByMessage = {};

            for (const reaction of reactions) {
                if (!reactionsByMessage[reaction.mensagem_id]) {
                    reactionsByMessage[reaction.mensagem_id] = [];
                }

                reactionsByMessage[reaction.mensagem_id].push({
                    user_id: reaction.user_id,
                    user_name: reaction.user_name,
                    emoji: reaction.emoji,
                    fromMe: reaction.user_id === userId
                });
            }

            for (const message of messages) {
                message.reactions =
                    reactionsByMessage[message.id] || [];
            }
        }

        return messages;

    } catch (error) {
        throw new Error(error.message);
    }
}


async function create( tenant_id, userId, chatId, type, text, replyTo = null, arquivo = null, device = null ) {
    const connection = await pool.getConnection();
    //console.log("[debug][create message] ",tenant_id, userId, chatId, type, text, replyTo, arquivo, device);
    try {

        await connection.beginTransaction();

        /*
         * ==========================================
         * 1. VERIFICA SE O USUÁRIO PARTICIPA DO CHAT
         * ==========================================
         */
        const [participant] = await connection.query(`
            SELECT 1
            FROM chat_participantes
            WHERE
                tenant_id = ?
                AND chat_id = ?
                AND user_id = ?
                AND left_at IS NULL
            LIMIT 1
        `, [
            tenant_id,
            chatId,
            userId
        ]);

        if (participant.length === 0) {
            throw new Error(
                "Usuário não participa deste chat."
            );
        }


        /*
         * ==========================================
         * 2. VERIFICA O CHAT
         * ==========================================
         */
        const [chat] = await connection.query(`
            SELECT
                id,
                type
            FROM chat
            WHERE
                id = ?
                AND tenant_id = ?
                AND deleted_at IS NULL
            LIMIT 1
        `, [
            chatId,
            tenant_id
        ]);

        if (chat.length === 0) {
            throw new Error(
                "Chat não encontrado."
            );
        }


        /*
         * ==========================================
         * 3. VALIDA REPLY
         * ==========================================
         *
         * A mensagem respondida precisa:
         *
         * - existir
         * - pertencer ao mesmo tenant
         * - pertencer ao mesmo chat
         */
        if (replyTo) {

            const [reply] = await connection.query(`
                SELECT 1
                FROM mensagens
                WHERE
                    id = ?
                    AND tenant_id = ?
                    AND chat_id = ?
                LIMIT 1
            `, [
                replyTo,
                tenant_id,
                chatId
            ]);

            if (reply.length === 0) {
                throw new Error(
                    "Mensagem de resposta não encontrada."
                );
            }
        }


        /*
         * ==========================================
         * 4. INSERE A MENSAGEM
         * ==========================================
         */
        const [messageResult] = await connection.query(`
            INSERT INTO mensagens (
                tenant_id,
                chat_id,
                sender_id,
                type,
                texto,
                reply_to
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            tenant_id,
            chatId,
            userId,
            type,
            text || null,
            replyTo || null
        ]);

        const messageId = messageResult.insertId;


        /*
         * ==========================================
         * 5. INSERE ARQUIVO
         * ==========================================
         */
        if (arquivo) {

            if (!arquivo.storage_key) {
                throw new Error(
                    "Storage key do arquivo não informado."
                );
            }

            await connection.query(`
                INSERT INTO mensagem_arquivo (
                    tenant_id,
                    mensagem_id,
                    nome_original,
                    mime_type,
                    storage_key,
                    tamanho,
                    thumbnail_key,
                    duracao
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                tenant_id,
                messageId,
                arquivo.nome_original || null,
                arquivo.mime_type || null,
                arquivo.storage_key,
                arquivo.tamanho || null,
                arquivo.thumbnail_key || null,
                arquivo.duracao || null
            ]);
        }


        /*
         * ==========================================
         * 6. ATUALIZA ÚLTIMA MENSAGEM DO CHAT
         * ==========================================
         */
        await connection.query(`
            UPDATE chat
            SET
                last_message_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE
                id = ?
                AND tenant_id = ?
        `, [
            messageId,
            chatId,
            tenant_id
        ]);


        /*
         * ==========================================
         * 7. COMMIT
         * ==========================================
         */
        await connection.commit();


        /*
         * ==========================================
         * 8. BUSCA A MENSAGEM CRIADA
         * ==========================================
         *
         * Fazemos uma nova query depois do commit
         * para retornar exatamente o formato usado
         * pelo getInitial().
         */
        const [rows] = await pool.query(`
            SELECT
                m.id,
                m.chat_id,
                m.sender_id,
                m.type,
                m.texto,
                m.device,
                m.reply_to,
                m.edited_at,
                m.deleted_at,
                m.created_at,
                m.updated_at,

                u.nome AS sender_name,
                u.avatar AS sender_avatar,

                /*
                 * Reply
                 */
                rm.id AS reply_id,
                rm.sender_id AS reply_sender_id,
                rm.type AS reply_type,
                rm.texto AS reply_texto,
                rm.deleted_at AS reply_deleted_at,

                ru.nome AS reply_sender_name,

                /*
                 * Arquivo
                 */
                ma.id AS arquivo_id,
                ma.nome_original AS arquivo_nome,
                ma.mime_type AS arquivo_mime,
                ma.storage_key AS arquivo_storage_key,
                ma.tamanho AS arquivo_tamanho,
                ma.thumbnail_key AS arquivo_thumbnail_key,
                ma.duracao AS arquivo_duracao

            FROM mensagens m

            INNER JOIN users u
                ON u.id = m.sender_id
                AND u.tenant_id = m.tenant_id

            LEFT JOIN mensagens rm
                ON rm.id = m.reply_to
                AND rm.tenant_id = m.tenant_id

            LEFT JOIN users ru
                ON ru.id = rm.sender_id
                AND ru.tenant_id = rm.tenant_id

            LEFT JOIN mensagem_arquivo ma
                ON ma.mensagem_id = m.id
                AND ma.tenant_id = m.tenant_id
                AND ma.deleted_at IS NULL

            WHERE
                m.id = ?
                AND m.tenant_id = ?

            LIMIT 1
        `, [
            messageId,
            tenant_id
        ]);


        if (rows.length === 0) {
            throw new Error(
                "Mensagem criada, mas não foi possível recuperá-la."
            );
        }


        const message = rows[0];


        /*
         * ==========================================
         * 9. AVATAR DO REMETENTE
         * ==========================================
         */
        let senderAvatar = message.sender_avatar;

        if (senderAvatar) {
            senderAvatar = await storage.getSignedUrl(
                senderAvatar
            );
        }


        /*
         * ==========================================
         * 10. ARQUIVO
         * ==========================================
         */
        let messageFile = null;

        if (message.arquivo_id) {

            messageFile = {
                id: message.arquivo_id,
                nome: message.arquivo_nome,
                mime_type: message.arquivo_mime,
                tamanho: message.arquivo_tamanho,
                duracao: message.arquivo_duracao,
                url: null,
                thumbnail: null
            };

            if (message.arquivo_storage_key) {
                messageFile.url =
                    await storage.getSignedUrl(
                        message.arquivo_storage_key
                    );
            }

            if (message.arquivo_thumbnail_key) {
                messageFile.thumbnail =
                    await storage.getSignedUrl(
                        message.arquivo_thumbnail_key
                    );
            }
        }


        /*
         * ==========================================
         * 11. REPLY
         * ==========================================
         */
        let reply = null;

        if (message.reply_id) {

            reply = {
                id: message.reply_id,
                sender_id: message.reply_sender_id,
                sender_name: message.reply_sender_name,
                type: message.reply_type,

                texto: message.reply_deleted_at
                    ? null
                    : message.reply_texto,

                deleted: !!message.reply_deleted_at
            };
        }


        /*
         * ==========================================
         * 12. RESULTADO FINAL
         * ==========================================
         */
        return {
            id: message.id,
            chat_id: message.chat_id,

            sender: {
                id: message.sender_id,
                nome: message.sender_name,
                avatar: senderAvatar
            },

            fromMe: true,

            type: message.type,

            texto: message.deleted_at
                ? null
                : message.texto,

            device: message.device,

            edited_at: message.edited_at,
            deleted: !!message.deleted_at,

            created_at: message.created_at,
            updated_at: message.updated_at,

            reply_to: reply,

            arquivo: messageFile,

            reactions: []
        };


    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();

    }
}



module.exports = {
    getInitial,
    create
};

