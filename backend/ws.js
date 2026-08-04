const { WebSocketServer } = require("ws");
const jwt = require("jsonwebtoken");

function startWebSocket(server) {

    const wss = new WebSocketServer({
        server
    });

    const clients = new Map();

    wss.on("connection", (socket) => {

        console.log("Novo socket conectado.");

        socket.on("message", async (buffer) => {

            try {

                const data = JSON.parse(buffer.toString());

                switch (data.type) {

                    case "auth":

                        try {

                            const payload = jwt.verify(
                                data.token,
                                process.env.JWT_SECRET
                            );

                            socket.user = payload;

                            clients.set(payload.id, socket);

                            socket.send(JSON.stringify({
                                type: "authenticated"
                            }));

                        } catch {

                            socket.close();

                        }

                    break;

                }

            } catch (err) {

                console.error(err);

            }

        });

        socket.on("close", () => {

            if (socket.user) {
                clients.delete(socket.user.id);
            }

        });

    });

    console.log("🟢 WebSocket iniciado.");

    return wss;

}

module.exports = startWebSocket;