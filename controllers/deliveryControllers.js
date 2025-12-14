const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getOrders = async (req, res, next) => {
  const orders = await prisma.orders.findMany({
    where: {
      status: { in: ['done', 'on delivery', 'deliverd'] },
      onDeliverOrders: {
        deliveryId: req.user.userName,
      },
    },
    include: {
      onDeliverOrders: {
        select: { tipAmount: true },
      },
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      orders,
    },
  });
};

exports.deliver = async (req, res, next) => {
  try {
    if (!req.body.deliveryTime)
      throw new Error('You should enter the delivery time');
    const order = await prisma.orders.update({
      where: {
        orderId: req.body.orderId,
      },
      data: {
        status: 'on delivery',
        onDeliverOrders: {
          create: {
            deliveryTime: req.body.deliveryTime,
            deliveryId: req.user.userName,
          },
        },
      },
    });
    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.leaveOrder = async (req, res, next) => {
  try {
    const order = await prisma.orders.update({
      where: {
        orderId: req.body.orderId,
      },
      data: {
        status: 'deliverd',
      },
    });
    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
