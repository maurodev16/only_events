import { Server } from 'socket.io';

function configureSocketServer(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://192.168.1.5:3000",
            methods: ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE"],
        }
    });

    io.on('connection', (socket) => {
        console.log('Um cliente se conectou:', socket.id);
        
        socket.on('disconnect', () => {
            console.log('Um cliente se desconectou:', socket.id);
        });
    });

    return io;
}

export default configureSocketServer;
