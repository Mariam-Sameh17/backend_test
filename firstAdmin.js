const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const createFirstAdmin = async () => {
  const password = await bcrypt.hash('YumRush12@#', 12);
  const admin = await prisma.Users.create({
    data: {
      userName: 'MariamSamehYasin',
      password,
      name: 'Mariam',
      email: 'yumrushdb@gmail.com',
      photo: 'images/users/MariamSamehYasin.jpg',
      phoneNumber: '01129553434',
      type: 's',
    },
  });
};

createFirstAdmin();
