const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const validations = require('../utilis/validations');
const sharp = require('sharp');

const staffPhoto = async (req) => {
  if (!req.file) return;
  req.file.filename = `${req.body.userName}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`images/users/${req.file.filename}`);
};

exports.getAllDelivery = async (req, res) => {
  const users = await prisma.users.findMany({
    where: {
      type: 'd',
    },
    include: {
      deliveryPerson: true,
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
};

exports.getAllTickets = async (req, res) => {
  const tickets = await prisma.tickets.findMany({
    where: {
      status: { in: ['solved', 'not solved'] },
      proccessedTickets: {
        supportId: req.body.userName,
      },
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      tickets,
    },
  });
};

exports.getAllRestaurants = async (req, res) => {
  const restaurants = await prisma.restaurant.findMany();
  res.status(200).json({
    status: 'success',
    data: {
      restaurants,
    },
  });
};

exports.addSupportStaff = async (req, res) => {
  try {
    const staffData = await validations.validateUser(req);
    const SupportStaff = await prisma.users.create({
      data: {
        ...staffData,
        type: 's',
        photo: req.file ? `images/users/${req.body.userName}` : null,
      },
    });
    staffPhoto(req);
    res.status(201).json({
      status: 'success',
      SupportStaff,
    });
  } catch (err) {
    let message;
    if (err.code === 'P2002') {
      message = 'This UserName already exist';
    }

    res.status(400).json({
      status: 'fail',
      message: message || err.message,
    });
  }
};

exports.solveTicket = async (req, res) => {
  try {
    if (!req.body.message) throw new Error('you should write the message');
    const message = await prisma.proccessedTickets.create({
      data: {
        responseMessage: req.body.message,
        responseTime: new Date(),
        ticketId: req.body.ticketId,
        supportId: req.user.userName,
      },
    });

    await prisma.tickets.update({
      where: {
        ticketId: req.body.ticketId,
      },
      data: {
        status: 'solved',
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        message,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
