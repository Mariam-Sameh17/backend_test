const { Server } = require('socket.io');

let io;

module.exports = {
  initializeWebSocketServer: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: ['http://localhost:5173', 'https://yumrush-m.netlify.app'],
        methods: ['GET', 'POST'],
      },
    });
    console.log('Socket.io initialized!');
    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.io is not initialized yet!');
    }
    return io;
  },
};
