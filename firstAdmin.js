const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const createFirstAdmin = async () => {
  const password = await bcrypt.hash('12345678', 12);
  const admin = await prisma.Users.create({
    data: {
      userName: 'MariamSamehYasin',
      password,
      name: 'Mariam',
      email: 'yumrushdb@gmail.com',
      photo:
        'https://res.cloudinary.com/dhmcbcqj6/image/upload/v1765972538/YumRush/bkq6ug43ef3djfbqcqfr.jpg',
      phoneNumber: '01129553434',
      type: 's',
    },
  });
};

createFirstAdmin();
