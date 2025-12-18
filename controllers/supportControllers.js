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
  const usersData = await prisma.$queryRaw`call GetDelivery`;

  const users = usersData.map((u) => ({
    userName: u.f0,
    name: u.f1,
    photo: u.f3,
    email: u.f4,
    phoneNumber: u.f5,
    type: u.f6,
    bankId: u.f9,
    vehicleType: u.f10,
    licenseNumber: u.f11,
    deliveryPersonId: u.f12,
    numberOfDeliveredOrders: Number(u.f13),
    rate: parseFloat(u.f14) || 0,
  }));

  // const users = await prisma.users.findMany({
  //   where: {
  //     type: 'd',
  //   },
  //   include: {
  //     deliveryPerson: true,
  //   },
  // });

  // for (const d of users) {
  //   const x = await prisma.onDeliverOrders.aggregate({
  //     where: {
  //       Orders: {
  //         status: 'delivered',
  //       },
  //       deliveryId: d.userName,
  //     },
  //     _count: { _all: true },
  //   });
  //   d.numberOfDeliveredOrders = x._count._all;

  //   const y = await prisma.orderReview.aggregate({
  //     _avg: { deliverRating: true },

  //     where: {
  //       Orders: {
  //         onDeliverOrders: {
  //           deliveryId: d.userName,
  //         },
  //       },
  //     },
  //   });

  //   const rate = y._avg.restaurantRating ? y._avg.restaurantRating : 0;
  //   d.rate = rate;
  // }
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
      status: 'not solved',
    },
  });

  const { _count: resolvedTickets } = await prisma.proccessedTickets.aggregate({
    _count: { _all: true },
    where: {
      supportId: req.user.userName,
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      tickets,
      resolvedTickets,
    },
  });
};

exports.getAllRestaurants = async (req, res) => {
  const restaurants = await prisma.restaurant.findMany();
  for (r of restaurants) {
    const x = await prisma.orderReview.aggregate({
      _avg: { restaurantRating: true },
      where: {
        Orders: {
          restaurantId: r.restaurantId,
        },
      },
    });
    r.rate = x._avg.restaurantRating ? x._avg.restaurantRating : 0;
  }
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
        photo: req.body.photo || null,
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
