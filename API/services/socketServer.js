import { Server } from 'socket.io';
import http from 'http'; // Importe o módulo http

 function configureSocketServer() {
    const server = http.createServer(); // Crie uma instância http.Server
    const io = new Server(server, {
        cors: {
            origin: "*",
        }
    });

    io.on('connection', (socket) => {
        console.log('Um cliente se conectou:', socket.id);

        // Manipular eventos Socket.IO aqui
        socket.on('disconnect', () => {
            console.log('Um cliente se desconectou:', socket.id);
        });
    });
    return server; // Retorne o servidor http.Server configurado
}
export default configureSocketServer;
