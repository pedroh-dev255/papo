const { WebSocketServer, WebSocket } = require("ws");
const jwt = require("jsonwebtoken");
const messageService = require("./services/messageService");

function startWebSocket(server) {

    const wss = new WebSocketServer({
        server
    });

    /*
     * userId -> Set<WebSocket>
     *
     * Um usuário pode ter mais de uma conexão.
     *
     * Ex:
     *
     * 1 -> Set(socketA, socketB)
     */
    const clients = new Map();

    /*
     * Adiciona socket do usuário
     */
    function addClient(userId, socket) {

        if (!clients.has(userId)) {
            clients.set(userId, new Set());
        }

        clients.get(userId).add(socket);
    }

    /*
     * Remove socket do usuário
     */
    function removeClient(userId, socket) {

        const userSockets = clients.get(userId);

        if (!userSockets) {
            return;
        }

        userSockets.delete(socket);

        if (userSockets.size === 0) {
            clients.delete(userId);
        }
    }

    /*
     * Envia evento para todas as conexões
     * de um usuário.
     */
    function sendToUser(userId, data) {

        const userSockets = clients.get(userId);

        if (!userSockets) {
            return;
        }

        const message = JSON.stringify(data);

        for (const socket of userSockets) {

            if (socket.readyState === WebSocket.OPEN) {
                socket.send(message);
            }

        }
    }

    /*
     * Verifica se o usuário está online
     */
    function isUserOnline(userId) {

        const userSockets = clients.get(userId);

        return !!(
            userSockets &&
            userSockets.size > 0
        );
    }

    /*
     * Nova conexão
     */
    wss.on("connection", (socket, request) => {

        console.log("Novo socket conectado.");

        /*
         * Por padrão, o socket ainda NÃO está autenticado.
         */
        socket.user = null;
        socket.isAlive = true;

        /*
         * Heartbeat
         */
        socket.on("pong", () => {
            socket.isAlive = true;
        });

        /*
         * Mensagens
         */
        socket.on("message", async (buffer) => {

            try {

                const data = JSON.parse(
                    buffer.toString()
                );

                /*
                 * O primeiro evento precisa obrigatoriamente
                 * ser auth.
                 */
                if (!socket.user && data.type !== "auth") {

                    socket.send(
                        JSON.stringify({
                            type: "error",
                            message: "Socket não autenticado."
                        })
                    );

                    socket.close(1008, "Unauthorized");

                    return;
                }

                switch (data.type) {

                    /*
                     * ============================
                     * AUTH
                     * ============================
                     */
                    case "auth": {

                        try {

                            if (socket.user) {
                                return;
                            }

                            const payload = jwt.verify(
                                data.token,
                                process.env.JWT_SECURITY
                            );

                            /*
                             * Validação mínima do JWT
                             */
                            if (!payload.id) {
                                throw new Error(
                                    "Token inválido."
                                );
                            }

                            if (!payload.tenant_id) {
                                throw new Error(
                                    "Tenant inválido."
                                );
                            }

                            socket.user = payload;

                            addClient(
                                payload.id,
                                socket
                            );

                            console.log(
                                `[WS] Usuário ${payload.id} autenticado.`
                            );

                            socket.send(
                                JSON.stringify({
                                    type: "authenticated",
                                    userId: payload.id
                                })
                            );

                        } catch (error) {

                            console.error(
                                "[WS] Falha na autenticação:",
                                error.message
                            );

                            socket.send(
                                JSON.stringify({
                                    type: "auth_error",
                                    message: "Token inválido."
                                })
                            );

                            socket.close(
                                1008,
                                "Unauthorized"
                            );
                        }

                        break;
                    }

                    /*
                     * ============================
                     * PING
                     * ============================
                     */
                    case "ping": {

                        socket.send(
                            JSON.stringify({
                                type: "pong"
                            })
                        );

                        break;
                    }

                    case "message:create": {
                        
                        console.log("[WS] Mensagem recebida: ",data, socket.user);
                        try {
                            const mensagem = await messageService.create( socket.user.tenant_id, socket.user.id, data.data.chat_id, data.data.type, data.data.texto, data.data.reply_to )

                        } catch (error) {
                            socket.send(
                                JSON.stringify({
                                    type: "Error",
                                    message: error.message
                                })
                            )
                        }
                        break;
                    }

                    /*
                     * ============================
                     * TESTE
                     * ============================
                     */
                    case "echo": {

                        socket.send(
                            JSON.stringify({
                                type: "echo",
                                data: data.data
                            })
                        );

                        break;
                    }

                    /*
                     * ============================
                     * EVENTO DESCONHECIDO
                     * ============================
                     */
                    default: {

                        console.log(
                            `[WS] Evento desconhecido: ${data.type}`
                        );

                        socket.send(
                            JSON.stringify({
                                type: "error",
                                message: "Evento desconhecido."
                            })
                        );

                    }

                }

            } catch (error) {

                console.error(
                    "[WS] Erro ao processar mensagem:",
                    error
                );

                socket.send(
                    JSON.stringify({
                        type: "error",
                        message: "Mensagem inválida."
                    })
                );

            }

        });

        /*
         * Fechamento
         */
        socket.on("close", () => {

            if (socket.user) {

                removeClient(
                    socket.user.id,
                    socket
                );

                console.log(
                    `[WS] Usuário ${socket.user.id} desconectado.`
                );

            } else {

                console.log(
                    "[WS] Socket não autenticado desconectado."
                );

            }

        });

        /*
         * Erro
         */
        socket.on("error", (error) => {

            console.error(
                "[WS] Socket error:",
                error.message
            );

        });

    });

    /*
     * ================================
     * HEARTBEAT GLOBAL
     * ================================
     *
     * Detecta conexões mortas.
     */
    const heartbeatInterval = setInterval(() => {

        for (const socket of wss.clients) {

            if (socket.isAlive === false) {

                console.log(
                    "[WS] Socket morto. Encerrando."
                );

                socket.terminate();

                continue;
            }

            socket.isAlive = false;

            socket.ping();

        }

    }, 30000);

    /*
     * Limpa o intervalo quando o servidor fecha.
     */
    wss.on("close", () => {

        clearInterval(
            heartbeatInterval
        );

    });

    console.log(
        "🟢 WebSocket iniciado."
    );

    /*
     * Expõe algumas funções para o restante
     * da aplicação.
     */
    return {
        wss,

        sendToUser,

        isUserOnline
    };
}

module.exports = startWebSocket;
