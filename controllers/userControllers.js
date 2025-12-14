const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.sendMessage = async (req, res, next) => {
  try {
    if (req.user.type == 's') throw new Error('this user type is not allowed');
    if (!req.body.message) throw new Error('you should write message first');

    let message;
    const { status } = await prisma.orders.findFirst({
      where: {
        orderId: req.body.orderId,
      },
      select: {
        status: true,
      },
    });

    if (
      req.user.type == 'd' ||
      (req.user.type == 'c' && status == 'on delivery')
    ) {
      message = await prisma.deliveryChat.create({
        data: {
          message: req.body.message,
          timeSent: new Date(),
          status: 'sent',
          SRFlag: req.user.type,
          orderId: req.body.orderId,
        },
      });
      await prisma.deliveryChat.updateMany({
        where: {
          orderId: req.body.orderId,
          SRFlag: req.user.type == 'c' ? 'd' : 'c',
        },
        data: {
          status: 'seen',
        },
      });
    } else {
      message = await prisma.restaurantChat.create({
        data: {
          message: req.body.message,
          timeSent: new Date(),
          status: 'sent',
          SRFlag: req.user.type,
          orderId: req.body.orderId,
        },
      });
      await prisma.restaurantChat.updateMany({
        where: {
          orderId: req.body.orderId,
          SRFlag: req.user.type == 'c' ? { in: ['m', 'k'] } : 'c',
        },
        data: {
          status: 'seen',
        },
      });
    }

    res.status(201).json({
      status: 'success',
      data: { message },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getMessages = async (req, res) => {
  const { status } = await prisma.orders.findFirst({
    where: {
      orderId: req.body.orderId,
    },
    select: {
      status: true,
    },
  });
  let messages;
  if (
    req.user.type == 'd' ||
    (req.user.type == 'c' && status == 'on delivery')
  ) {
    await prisma.deliveryChat.updateMany({
      where: {
        orderId: req.body.orderId,
        SRFlag: req.user.type == 'c' ? 'd' : 'c',
      },
      data: {
        status: 'seen',
      },
    });
    messages = await prisma.deliveryChat.findMany({
      where: {
        orderId: req.body.orderId,
      },
    });
    console.log(messages);
    for (const m of messages) {
      if (m.SRFlag === req.user.type) {
        m.flag = 'sent';
      } else {
        m.flag = 'received';
      }
    }
  } else {
    await prisma.restaurantChat.updateMany({
      where: {
        orderId: req.body.orderId,
        SRFlag: req.user.type == 'c' ? { in: ['m', 'k'] } : 'c',
      },
      data: {
        status: 'seen',
      },
    });
    messages = await prisma.restaurantChat.findMany({
      where: {
        orderId: req.body.orderId,
      },
    });
    let types;
    if (req.user.type == 'k' || req.user.type == 'm') types = ['k', 'm'];
    else types = ['c'];
    console.log(req.user.type, types);
    for (const m of messages) {
      if (types.includes(m.SRFlag)) {
        m.flag = 'sent';
      } else {
        m.flag = 'received';
      }
    }
  }

  res.status(201).json({
    status: 'success',
    data: { messages },
  });
};
