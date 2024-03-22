// socketServer.js
import { Server } from 'socket.io';

export default function configureSocketServer() {
    const io = new Server({
        cors: {
            origin: '*',
        }
    });

    io.on('connection', (socket) => {
        console.log('Um cliente se conectou:', socket.id);

        // Manipular eventos Socket.IO aqui
        socket.on('disconnect', () => {
            console.log('Um cliente se desconectou:', socket.id);
        });
    });

    return io; // Retorne a instância do servidor Socket.IO configurado
}
