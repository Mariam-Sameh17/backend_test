module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join_chat', ({ orderId }) => {
      const roomName = `order_${orderId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    });

    socket.on('leave_chat', ({ orderId }) => {
      const roomName = `order_${orderId}`;
      socket.leave(roomName);
    });
  });
};
