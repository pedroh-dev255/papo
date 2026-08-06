const {
    AccessToken,
    apiKey,
    apiSecret,
    roomService
} = require("../configs/livekit");

class CallService {

    async createRoom(roomName) {
        try {
            return await roomService.createRoom({
                name: roomName
            });
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteRoom(roomName) {
        try {
            await roomService.deleteRoom(roomName);
            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async listRooms() {
        try {
            return await roomService.listRooms();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async roomExists(roomName) {
        const rooms = await roomService.listRooms();
        return rooms.some(room => room.name === roomName);
    }

    async listParticipants(roomName) {
        try {
            return await roomService.listParticipants(roomName);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async removeParticipant(roomName, identity) {
        try {
            await roomService.removeParticipant(roomName, identity);
            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async generateToken(roomName, user) {
        try {

            const token = new AccessToken(
                apiKey,
                apiSecret,
                {
                    identity: String(user.id),
                    name: user.name
                }
            );

            token.addGrant({
                roomJoin: true,
                room: roomName,
                canPublish: true,
                canSubscribe: true,
                canPublishData: true
            });

            return await token.toJwt();

        } catch (error) {
            throw new Error(error.message);
        }
    }

}

module.exports = new CallService();