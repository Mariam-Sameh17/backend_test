const app = require('./app');
const { PrismaClient } = require('@prisma/client');
const socket = require('./socketHandler');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    const customers = await prisma.Users.findMany();
    console.log('Connection Successful!');
  } catch (error) {
    console.error('Connection Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
const port = process.env.PORT || 3000;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`app running on port ${port}...`);
});

socket.initializeWebSocketServer(server);
