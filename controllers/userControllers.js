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
  const orderId = parseInt(req.params.orderId);
  const { status } = await prisma.orders.findFirst({
    where: {
      orderId,
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
        orderId,
        SRFlag: req.user.type == 'c' ? 'd' : 'c',
      },
      data: {
        status: 'seen',
      },
    });
    messages = await prisma.deliveryChat.findMany({
      where: {
        orderId,
      },
    });
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
        orderId,
        SRFlag: req.user.type == 'c' ? { in: ['m', 'k'] } : 'c',
      },
      data: {
        status: 'seen',
      },
    });
    messages = await prisma.restaurantChat.findMany({
      where: {
        orderId,
      },
    });
    let types;
    if (req.user.type == 'k' || req.user.type == 'm') types = ['k', 'm'];
    else types = ['c'];
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

exports.profile = async (req, res) => {
  let user;
  if (req.user.type === 'c' || req.user.type === 's' || req.user.type === 'k')
    user = await prisma.users.findFirst({
      where: {
        userName: req.user.userName,
      },
    });
  else if (req.user.type === 'm') {
    user = await prisma.users.findFirst({
      where: {
        userName: req.user.userName,
      },
      include: { restaurantOwner: { include: { Restaurant: true } } },
    });
  } else if (req.user.type === 'd') {
    user = await prisma.users.findFirst({
      where: {
        userName: req.user.userName,
      },
      include: { deliveryPerson: true },
    });
  }
  user.password = undefined;
  user.passwordChangedAt = undefined;
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};

exports.updateProfile = async (req, res) => {
  const user = await prisma.users.update({
    where: {
      userName: req.user.userName,
    },
    data: {
      name: req.body.name || req.user.name,
      email: req.body.email || req.user.email,
      phoneNumber: req.body.phoneNumber || req.user.phoneNumber,
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};
