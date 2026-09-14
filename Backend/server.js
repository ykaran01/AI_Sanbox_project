import {app} from './src/app.js'
import dotenv from 'dotenv'
import { connectDB } from './src/db/connetDB.js';
import { createServer } from "http";
import {Server} from "socket.io"
import { websocket } from './src/websocket/websocketconnection.js';
const server = createServer(app)
const io = new Server(server,{
    cors:{origin:"*"}
})
websocket(io)



dotenv.config()
connectDB()

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});