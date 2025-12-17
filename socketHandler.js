// socket.js
const { Server } = require('socket.io');

let io;

module.exports = {
  // 1. Initialize function (called once in app.js)
  initializeWebSocketServer: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: 'http://localhost:5173', // Adjust to your frontend URL
        methods: ['GET', 'POST'],
      },
    });
    console.log('Socket.io initialized!');
    return io;
  },

  // 2. Getter function (called in controllers)
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io is not initialized yet!');
    }
    return io;
  },
};
