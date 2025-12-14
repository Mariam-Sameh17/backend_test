const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getRestId = async (req) => {
  const { restaurantId } = await prisma.kitchenStaff.findFirst({
    where: {
      userName: req.user.userName,
    },
    select: {
      restaurantId: true,
    },
  });
  return restaurantId;
};
exports.getOrders = async (req, res, next) => {
  const restaurantId = await getRestId(req);
  const orders = await prisma.orders.findMany({
    where: {
      restaurantId,
      status: 'received',
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      orders,
    },
  });
};

exports.prepare = async (req, res, next) => {
  try {
    if (!req.body.preparingTime)
      throw new Error('You should enter the preparation time');
    const order = await prisma.orders.update({
      where: {
        orderId: req.body.orderId,
      },
      data: {
        status: 'being prepared',
        onPrepareOrders: {
          create: {
            preparingTime: req.body.preparingTime,
            kitchenStaffId: req.user.userName,
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

exports.finishOrder = async (req, res, next) => {
  try {
    const order = await prisma.orders.update({
      where: {
        orderId: req.body.orderId,
      },
      data: {
        status: 'done',
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
