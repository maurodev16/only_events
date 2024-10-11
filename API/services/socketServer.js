import socketIO from 'socket.io'; // Importa socket.io como padrão

function configureSocketServer(server) {
    const io = socketIO(server, { // Aqui você cria uma instância de Socket.io
        cors: {
            origin: "https://velhodalancha.onrender.com", // Ajuste para a origem correta
            methods: ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE"],
        },
    });

    io.on('connection', (socket) => {
        console.log('Um cliente se conectou:', socket.id);
        
        socket.on('disconnect', () => {
            console.log('Um cliente se desconectou:', socket.id);
        });
    });

    return io; // Retorna a instância do Socket.io
}

export default configureSocketServer;
