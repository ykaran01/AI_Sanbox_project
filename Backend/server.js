
import dotenv from 'dotenv'
dotenv.config()
import { createServer } from "http";
import {Server} from "socket.io"
import { websocket } from './src/websocket/websocketconnection.js';
import {app} from './src/app.js'


const server = createServer(app)

const io = new Server(server,{
    cors:{origin:"*"}
})
websocket(io)






server.listen(3000, () => {
    console.log('Server is running on port 3000');
});