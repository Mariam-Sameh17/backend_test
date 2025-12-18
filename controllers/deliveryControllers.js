const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getOrders = async (req, res, next) => {
  const orders = await prisma.orders.findMany({
    where: {
      OR: [
        {
          status: 'ready',
        },

        {
          status: { in: ['on-delivery', 'delivered'] },
          onDeliverOrders: {
            deliveryId: req.user.userName,
          },
        },
      ],
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
        status: 'on-delivery',
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
        status: 'delivered',
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

exports.stats = async (req, res) => {
  const now = new Date();

  const yesterdayEnd = new Date();
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  console.log(now, '  ', yesterdayEnd);

  const todayEarning = await prisma.orders.aggregate({
    _sum: {
      deliveryFee: true,
    },
    where: {
      orderTime: {
        gte: yesterdayEnd,
        lte: now,
      },
      onDeliverOrders: {
        deliveryId: req.user.userName,
      },
    },
  });

  const weekEarning = await prisma.orders.aggregate({
    _sum: { deliveryFee: true },
    where: {
      orderTime: {
        gt: sevenDaysAgo,
        lte: now,
      },
      onDeliverOrders: {
        deliveryId: req.user.userName,
      },
      status: 'delivered',
    },
  });

  const totalDeliveries = await prisma.orders.aggregate({
    _count: { _all: true },
    where: {
      onDeliverOrders: {
        deliveryId: req.user.userName,
      },
      status: 'delivered',
    },
  });

  const tips = await prisma.onDeliverOrders.aggregate({
    _sum: { tipAmount: true },
    where: {
      Orders: {
        status: 'delivered',
      },
      deliveryId: req.user.userName,
    },
  });

  const summary = await prisma.orders.groupBy({
    by: ['status'],
    _count: { _all: true },
    where: {
      onDeliverOrders: {
        deliveryId: req.user.userName,
      },
    },
  });

  const { rate, numberOfRates } = await prisma.orderReview.aggregate({
    _avg: { deliverRating: true },
    _count: { _all: true },
    where: {
      deliverRating: { not: null },
      Orders: {
        onDeliverOrders: {
          deliveryId: req.user.userName,
        },
      },
    },
  });

  const recent = await prisma.orders.findMany({
    where: {
      orderReview: {
        deliverRating: {
          not: null,
        },
      },
      onDeliverOrders: {
        deliveryId: req.user.userName,
      },
    },
    select: {
      orderReview: true,
      orderTime: true,
      customerId: true,
    },
  });

  for (const r of recent) {
    const { name } = await prisma.users.findFirst({
      where: {
        userName: r.customerId,
      },
      select: {
        name: true,
      },
    });
    r.customer = name;
    r.customerId = undefined;
    r.orderReview.customerId = undefined;
    r.orderReview.restaurantRating = undefined;
  }

  res.status(200).json({
    status: 'success',
    data: {
      todayEarning,
      weekEarning,
      totalDeliveries,
      tips,
      summary,
      rate,
      numberOfRates,
      recent,
    },
  });
};
