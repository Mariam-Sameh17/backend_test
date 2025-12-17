const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const validations = require('../utilis/validations');

const getRestId = async (req) => {
  const { restaurantId } = await prisma.Restaurant.findFirst({
    where: {
      managerID: req.user.userName,
    },
    select: {
      restaurantId: true,
    },
  });
  return restaurantId;
};

exports.addItems = async (req, res) => {
  try {
    const itemData = validations.validateItems(req);
    const restaurantId = await getRestId(req);
    const item = await prisma.menuItems.create({
      data: {
        ...itemData,
        photo: req.body.photo || null,
        restaurantId,
      },
    });
    res.status(201).json({
      status: 'success',
      item,
    });
  } catch (err) {
    let message;
    if (err.code === 'P2002') {
      message = 'There is already a menu item have this name';
    }

    res.status(400).json({
      status: 'fail',
      message: message || err.message,
    });
  }
};

exports.editItem = async (req, res) => {
  try {
    if (!req.body.name)
      return res.status(400).json({
        status: 'fail',
        message: 'You should select an item ',
      });

    const restaurantId = await getRestId(req);

    const itemData = await prisma.menuItems.findUnique({
      where: {
        name_restaurantId: {
          name: req.body.name,
          restaurantId,
        },
      },
    });

    const item = await prisma.menuItems.update({
      where: {
        name_restaurantId: { name: req.body.name, restaurantId },
      },
      data: {
        name: req.body.newName || itemData.name,
        discount: req.body.discount || itemData.discount,
        finalPrice: req.body.discount
          ? itemData.price - (req.body.discount / 100) * itemData.price
          : itemData.finalPrice,
        menuCategory: req.body.menuCategory || itemData.menuCategory,
        price: req.body.price || itemData.price,
        description: req.body.description || itemData.description,
        photo: req.body.photo || itemData.photo,
      },
    });

    res.status(200).json({
      status: 'success',
      item,
    });
  } catch (err) {
    if (err.code === 'P2002') {
      err.message = 'There is already a menu item have this name';
    }
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.setAvailability = async (req, res) => {
  try {
    if (!req.body.name) throw new Error('You should select an item ');
    if (req.body.available == null)
      throw new Error('You should enter availability ');
    let x;

    const restaurantId = await getRestId(req);
    console.log(req.body);
    const item = await prisma.menuItems.update({
      where: {
        name_restaurantId: { name: req.body.name, restaurantId },
      },
      data: {
        available: req.body.available,
      },
    });

    res.status(200).json({
      status: 'success',
      item,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    if (!req.params.name) throw new Error('select a name');
    const restaurantId = await getRestId(req);

    const deleted = await prisma.menuItems.delete({
      where: {
        name_restaurantId: {
          name: req.params.name,
          restaurantId,
        },
      },
    });
    if (deleted)
      res.status(200).json({
        status: 'success',
      });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getMenu = async (req, res) => {
  try {
    const restaurantId = await getRestId(req);

    const menu = await prisma.menuItems.findMany({
      where: {
        restaurantId,
      },
    });
    res.status(200).json({
      status: 'success',
      menu,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const restaurantId = await getRestId(req);
    const orders = await prisma.$queryRaw`
      call GetRestaurantOrders(${restaurantId})
    `;
    // const orders = await prisma.orders.findMany({
    //   where: {
    //     restaurantId,
    //   },
    // });
    // for (const o of orders) {
    //   const customer = await prisma.users.findFirst({
    //     where: {
    //       userName: o.customerId,
    //     },
    //     select: {
    //       name: true,
    //       phoneNumber: true,
    //     },
    //   });
    //   o.customer = customer;
    //   const items = await prisma.orderItems.aggregate({
    //     _sum: { quantity: true },
    //     where: {
    //       orderId: o.orderId,
    //     },
    //   });
    //   o.items = items._sum.quantity;
    // }
    res.status(200).json({
      status: 'success',
      orders,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);

    const order = await prisma.orders.findFirst({
      where: {
        orderId,
      },
      include: {
        orderItems: true,
        onPrepareOrders: true,
      },
    });
    const customer = await prisma.users.findFirst({
      where: {
        userName: order.customerId,
      },
      select: {
        name: true,
        phoneNumber: true,
      },
    });
    order.customer = customer;
    const items = await prisma.orderItems.aggregate({
      _sum: { quantity: true },
      where: {
        orderId: order.orderId,
      },
    });
    order.items = items._sum.quantity;
    if (order.status === 'preparing' || order.status === 'ready') {
      const staff = await prisma.users.findFirst({
        where: {
          userName: order.onPrepareOrders.kitchenStaffId,
        },
        select: {
          name: true,
        },
      });
      order.staff = staff;
    }
    res.status(200).json({
      status: 'success',
      order,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.addKitchenStaff = async (req, res) => {
  try {
    const staffData = await validations.validateUser(req);
    const restaurantId = await getRestId(req);
    const kitchenStaff = await prisma.users.create({
      data: {
        ...staffData,
        type: 'k',
        photo: req.body.photo || null,
        kitchenStaff: {
          create: {
            restaurantId,
          },
        },
      },
    });
    res.status(201).json({
      status: 'success',
      data: { ...kitchenStaff },
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

exports.getStaff = async (req, res) => {
  const restaurantId = await getRestId(req);

  const kitStaff = await prisma.$queryRaw`
      EXEC GetKitchenStaff @restaurantId = ${restaurantId}
    `;

  // const kitStaff = await prisma.users.findMany({
  //   where: {
  //     kitchenStaff: {
  //       restaurantId,
  //     },
  //   },
  // });
  // for (const k of kitStaff) {
  //   const x = await prisma.onPrepareOrders.aggregate({
  //     where: {
  //       Orders: {
  //         status: 'ready',
  //       },
  //       kitchenStaffId: k.userName,
  //     },
  //     _count: { _all: true },
  //   });
  //   k.numberOfPreparedOrders = x._count._all;
  // }
  res.status(200).json({
    status: 'success',
    data: { kitStaff },
  });
};

exports.deleteStaff = async (req, res) => {
  try {
    if (!req.params.userName) throw new Error('select a name');
    const deleted = await prisma.users.delete({
      where: {
        userName: req.params.userName,
      },
    });
    if (deleted)
      res.status(200).json({
        status: 'success',
      });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.createSubscription = async (req, res) => {
  try {
    const restaurantID = await getRestId(req);
    const subData = validations.validateSub(req);
    const subscription = await prisma.Subscription.create({
      data: {
        ...subData,
        restaurantID,
      },
    });
    res.status(201).json({
      status: 'success',
      subscription,
    });
  } catch (err) {
    if (err.code === 'P2002') {
      err.message = 'This subscription name already exist';
    }
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.editSubscription = async (req, res) => {
  try {
    const restaurantID = await getRestId(req);
    if (!req.body.name) throw new Error('You should select the Subscription');
    if (req.body.price && isNaN(parseFloat(req.body.price)))
      throw new Error(
        'You should enter the price of the subscription as a number'
      );
    if (req.body.amount && isNaN(parseFloat(req.body.amount)))
      throw new Error('You should enter the discount as a number');

    const subData = await prisma.subscription.findFirst({
      where: {
        planName: req.body.name,
        restaurantID,
      },
    });
    const subscription = await prisma.subscription.update({
      where: {
        planName_restaurantID: {
          planName: req.body.name,
          restaurantID,
        },
      },
      data: {
        planName: req.body.newName || subData.planName,
        price: req.body.price || subData.price,
        amount: req.body.amount || subData.amount,
        FreeDelivery:
          req.body.FreeDelivery == null
            ? subData.FreeDelivery
            : req.body.FreeDelivery,
      },
    });
    res.status(200).json({
      status: 'success',
      data: {
        subscription,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      err.message = 'This subscription name already exist';
    }
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    if (!req.params.name) throw new Error('select a plan');
    const restaurantId = await getRestId(req);

    const deleted = await prisma.subscription.delete({
      where: {
        planName_restaurantID: {
          restaurantID: restaurantId,
          planName: req.params.name,
        },
      },
    });
    if (deleted)
      res.status(200).json({
        status: 'success',
      });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getSubscriptions = async (req, res) => {
  const restaurantID = await getRestId(req);
  const subscriptions = await prisma.subscription.findMany({
    where: {
      restaurantID,
    },
  });
  for (const s of subscriptions) {
    const x = await prisma.customerSubscription.aggregate({
      where: {
        subscriptionId: s.planName,
      },
      _count: { _all: true },
    });
    s.numberOfSubscribers = x._count._all;
  }
  res.status(200).json({
    status: 'success',
    data: { subscriptions },
  });
};

exports.createCoupon = async (req, res) => {
  try {
    const restaurantID = await getRestId(req);
    const couponData = validations.validateCoupon(req);
    const coupon = await prisma.Coupons.create({
      data: {
        ...couponData,
        restaurantID,
      },
    });
    res.status(201).json({
      status: 'success',
      coupon,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.stats = async (req, res) => {
  const restaurantId = await getRestId(req);

  const items = await prisma.orderItems.groupBy({
    by: ['itemName'],
    _sum: { quantity: true },
    orderBy: {
      _sum: { quantity: 'desc' },
    },
    where: {
      restaurantId,
    },
  });
  const names = items.map((i) => i.itemName);
  const itemsData = await prisma.menuItems.findMany({
    where: {
      restaurantId,
      name: { in: names },
    },
  });

  const now = new Date();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const endOfLastMonth = startOfThisMonth;

  const startOfLastWeek = new Date();
  startOfLastWeek.setDate(now.getDate() - 14);

  const ordersPerSevenDays = await prisma.orders.groupBy({
    by: ['orderTime'],
    _sum: { itemsPrice: true },
    _count: { orderId: true },
    where: {
      restaurantId,
      orderTime: {
        gt: sevenDaysAgo,
        lte: now,
      },
      status: 'delivered',
    },
  });

  const revenuePerSevenDays = ordersPerSevenDays.reduce((sum, o) => {
    sum += parseFloat(o._sum.itemsPrice);
    return sum;
  }, 0);

  const monthRevenue = await prisma.orders.aggregate({
    _sum: { itemsPrice: true },
    where: {
      restaurantId,
      orderTime: {
        gt: startOfThisMonth,
        lte: now,
      },
      status: 'delivered',
    },
  });

  const lastMonthRevenue = await prisma.orders.aggregate({
    _sum: { itemsPrice: true },
    where: {
      restaurantId,
      orderTime: {
        gt: startOfLastMonth,
        lte: endOfLastMonth,
      },
      status: 'delivered',
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      items,
      itemsData,
      ordersPerSevenDays,
      revenuePerSevenDays,
      monthRevenue,
      lastMonthRevenue,
    },
  });
};

exports.getRate = async (req, res) => {
  const restaurantId = await getRestId(req);
  const [{ rate }] = await prisma.$queryRaw`
  EXEC GetRestaurantRating @restaurantId = ${restaurantId}
`;

  res.status(200).json({
    status: 'success',
    data: {
      rate,
    },
  });
};

exports.getBalance = async (req, res) => {
  const restaurantId = await getRestId(req);

  const ordersRevenue = await prisma.orders.aggregate({
    _sum: { itemsPrice: true },
    where: {
      restaurantId,
      status: 'delivered',
    },
  });

  const [{ subRevenue }] = await prisma.$queryRaw`
     EXEC GetSubscriptionRevenue @restaurantId = ${restaurantId}
    `;

  const subLoss = await prisma.paymentWithSubscription.aggregate({
    _sum: { paymentAmount: true },
    where: {
      Orders: {
        restaurantId,
      },
    },
  });
  const couponsLoss = await prisma.paymentWithCoupons.aggregate({
    _sum: { paymentAmount: true },
    where: {
      Orders: {
        restaurantId,
      },
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      ordersRevenue,
      subRevenue,
      subLoss,
      couponsLoss,
    },
  });
};
