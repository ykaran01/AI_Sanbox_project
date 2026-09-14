import {subscriber} from "../db/connetDB.js";

export const websocket = (io) => {
    subscriber.psubscribe("job:*");
    subscriber.on("pmessage", (pattern, channel, message) => {
        const jobId = channel.split(":")[1];
        const parsedMessage = JSON.parse(message);
        io.to(jobId).emit("jobUpdate", parsedMessage);
    });
    io.on("connection", (socket) => {
        console.log("socket connexted", socket.id)

        socket.on("jobEmmiting", (job) => {
            socket.join(job)
        })
        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    })
}