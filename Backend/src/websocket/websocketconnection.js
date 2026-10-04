import { subscriber } from "../db/connetDB.js";

export const websocket = (io) => {
    subscriber.psubscribe("thread:*");
    subscriber.on("pmessage", (pattern, channel, message) => {
        const threadId = channel.split(":")[1];
        const parsedMessage = JSON.parse(message);
        io.to(threadId).emit("jobUpdate", parsedMessage);
    });

    io.on("connection", (socket) => {

       

        socket.on("joinThread", (threadId) => {

            socket.join(threadId);

            
        });
        socket.on("disconnect", () => {

            console.log(
                `Client disconnected: ${socket.id}`
            );

        });

    });
};