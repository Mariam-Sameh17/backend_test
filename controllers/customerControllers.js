const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllRestaurants = async (req, res) => {
  try {
    const Restaurants = await prisma.Restaurant.findMany({
      select: {
        category: true,
        openingHours: true,
        restaurantName: true,
        description: true,
        location: true,
      },
    });
    res.status(200).json({
      status: 'success',
      data: {
        Restaurants,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getAllItems = async (req, res) => {
  const items = await prisma.menuItems.findMany({
    where: {
      availableAmount: {
        gt: 0,
      },
    },
    orderBy: {
      discount: 'desc',
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      items,
    },
  });
};

exports.getRestaurantbyCategory = async (req, res) => {
  try {
    if (!req.query.category) throw new Error('select a category');

    const Restaurants = await prisma.Restaurant.findMany({
      where: {
        category: req.query.category,
      },
      select: {
        category: true,
        openingHours: true,
        restaurantName: true,
        description: true,
        location: true,
      },
    });
    res.status(200).json({
      status: 'success',
      data: {
        Restaurants,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getRestaurantbyName = async (req, res) => {
  try {
    if (!req.query.name) throw new Error('select a name');

    const Restaurant = await prisma.Restaurant.findFirst({
      where: {
        restaurantName: req.query.name,
      },
      select: {
        category: true,
        openingHours: true,
        restaurantName: true,
        description: true,
        location: true,
        menuItems: {
          where: {
            availableAmount: {
              gt: 0,
            },
          },
        },
      },
    });
    res.status(200).json({
      status: 'success',
      data: {
        Restaurant,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.searchRestaurant = async (req, res) => {
  try {
    if (!req.query.name) throw new Error('type a letter');

    const Restaurants = await prisma.Restaurant.findMany({
      where: {
        restaurantName: {
          contains: req.query.name,
        },
      },
      select: {
        category: true,
        openingHours: true,
        restaurantName: true,
        description: true,
        location: true,
      },
    });
    res.status(200).json({
      status: 'success',
      data: {
        Restaurants,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.paymentPage = async (req, res) => {
  const coupons = await prisma.coupons.findMany({
    where: {
      restaurantID: req.query.restId,
      available_uses: { gt: 0 },
    },
  });
  const locations = await prisma.customerAddress.findMany({
    where: {
      customerId: req.user.userName,
    },
  });

  const wallets = await prisma.wallets_Cards.findMany({
    where: {
      customerId: req.user.userName,
    },
  });

  let subscription = await prisma.subscription.findFirst({
    where: {
      restaurantID: req.query.restId,
      customerSubscription: {
        some: { customerId: req.user.userName },
      },
    },
    include: {
      customerSubscription: true,
    },
  });
  if (subscription) {
    const endDate = new Date(subscription.customerSubscription[0].startDate);
    endDate.setDate(endDate.getDate() + subscription.period);
    if (endDate < new Date()) {
      await prisma.customerSubscription.update({
        where: {
          customerId_subscriptionId_restaurantID: {
            subscriptionId: subscription.planName,
            customerId: req.user.userName,
            restaurantID: subscription.restaurantID,
          },
        },
        data: {
          status: 'expired',
        },
      });
      subscription = null;
    }
  }

  if (subscription) subscription.customerSubscription = undefined;
  res.status(200).json({
    status: 'success',
    data: {
      coupons,
      wallets,
      locations,
      subscription,
    },
  });
};

exports.placeOrder = async (req, res) => {
  try {
    if (!req.body.location) throw new Error('You should enter a location');
    if (!req.body.items || req.body.items.length == 0)
      throw new Error('at least select an item');
    if (!req.body.number) throw new Error('You should select a payment method');
    const orderData = await prisma.$transaction(async (prisma) => {
      const total = parseFloat(req.body.total);
      const deliveryFee = parseFloat(req.body.deliveryFee);
      const random = Math.random();
      let paymentStatus;
      if (random > 0.2) paymentStatus = 'accepted';
      else paymentStatus = 'declined';

      const { paymentId } = await prisma.payment.create({
        data: {
          amount: total,
          paymentStatus: paymentStatus,
          time: new Date(),
        },
      });

      if (paymentStatus === 'accepted') {
        const order = await prisma.Orders.create({
          data: {
            location: req.body.location,
            orderTime: new Date(),
            deliveryFee,
            status: 'received',
            customerId: req.user.userName,
            restaurantId: req.body.restId,
            itemsPrice: total - deliveryFee,
          },
        });

        if (req.body.subscription) {
          const subscription = await prisma.paymentWithSubscription.create({
            data: {
              customerId: req.user.userName,
              paymentId,
              subscriptionId: req.body.subscription.planName,
              restaurantID: req.body.restId,
              paymentAmount: req.body.subscriptionPayment,
              orderId: order.orderId,
            },
          });
        }
        if (req.body.couponId) {
          const coupon = await prisma.paymentWithCoupons.create({
            data: {
              paymentId,
              couponId: req.body.couponId,
              paymentAmount: req.body.couponPayment,
              orderId: order.orderId,
            },
          });
          await prisma.coupons.update({
            where: { couponId: req.body.couponId },
            data: { available_uses: { decrement: 1 } },
          });
        }
        const wallet = await prisma.paymentWithCard_Wallet.create({
          data: {
            number: req.body.number,
            paymentId,
            customerId: req.user.userName,
            paymentAmount: req.body.walletPayment,
            orderId: order.orderId,
          },
        });
        // await prisma.restaurant.update({
        //   where: {
        //     restaurantId: req.body.restId,
        //   },
        //   data: {
        //     balance: {
        //       increment: req.body.walletPayment,
        //     },
        //   },
        // });

        for (const i of req.body.items) {
          await prisma.orderItems.create({
            data: {
              quantity: i.quantity,
              orderId: order.orderId,
              itemName: i.name,
              restaurantId: req.body.restId,
            },
          });
          await prisma.menuItems.update({
            where: {
              name_restaurantId: {
                name: i.name,
                restaurantId: req.body.restId,
              },
            },
            data: {
              availableAmount: {
                decrement: i.quantity,
              },
            },
          });
        }
        return order;
      } else throw new Error('payment declined try again');
    });

    res.status(201).json({
      status: 'success',
      data: {
        orderData,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.addWallet = async (req, res) => {
  try {
    if (!req.body.number)
      throw new Error('You should enter the number of the card or wallet');
    if (!req.body.type) throw new Error('You should select a type');
    const wallet = await prisma.Wallets_Cards.create({
      data: {
        number: req.body.number,
        type: req.body.type,
        customerId: req.user.userName,
      },
    });
    res.status(201).json({
      status: 'success',
      data: {
        wallet,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      err.message = 'You already have a wallet or card with this number';
    }
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.subscribe = async (req, res) => {
  try {
    if (!req.body.restId) throw new Error('select a restaurant');
    if (!req.body.subscriptionId)
      throw new Error('You should select a subscription');
    const { price } = await prisma.subscription.findFirst({
      where: {
        planName: req.body.subscriptionId,
        restaurantID: req.body.restId,
      },
    });

    const { paymentId } = await prisma.payment.create({
      data: { amount: price, paymentStatus: 'accepted', time: Date.now() },
    });

    const subscription = await prisma.customerSubscription.create({
      data: {
        status: 'active',
        startDate: new Date(),
        subscriptionId: req.body.subscriptionId,
        restaurantID: req.body.restId,
        customerId: req.user.userName,
        paymentId,
      },
    });

    // await prisma.restaurant.update({
    //   where: {
    //     restaurantId: req.body.restId,
    //   },
    //   data: {
    //     balance: {
    //       increment: price,
    //     },
    //   },
    // });

    res.status(201).json({
      status: 'success',
      data: {
        subscription,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.addAddress = async (req, res) => {
  try {
    if (!req.body.location) throw new Error('You should enter a location');

    const location = await prisma.customerAddress.create({
      data: {
        location: req.body.location,
        customerId: req.user.userName,
      },
    });
    res.status(201).json({
      status: 'success',
      data: {
        location,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      message = 'You already have added this location before';
    }
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await prisma.orders.findMany({
      where: {
        customerId: req.user.userName,
      },
      include: {
        orderItems: true,
      },
    });
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

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await prisma.orderItems.findMany({
      where: {
        orderId: req.body.orderId,
      },

      select: {
        quantity: true,
        menuItems: {
          select: {
            name: true,
            photo: true,
            price: true,
          },
        },
      },
    });
    order.map((i) => {
      i.totalPrice = i.quantity * i.menuItems.price;
    });
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

exports.tip = async (req, res) => {
  try {
    if (req.body.tips)
      if (!isNaN(parseFloat(req.body.tips)))
        await prisma.onDeliverOrders.update({
          where: {
            orderId: req.body.orderId,
          },
          data: {
            tipAmount: req.body.tips,
          },
        });
      else {
        throw new Error('make sure that the tips is a number');
      }
    else throw new Error('Enter a tip amount first!');
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

exports.review = async (req, res) => {
  try {
    if (!(req.body.delReview || req.body.restReview))
      throw new Error('Enter any field of your review first');
    if (req.body.delReview && isNaN(parseFloat(req.body.delReview)))
      throw new Error('make sure that the delivery review is a number');
    if (req.body.restReview && isNaN(parseFloat(req.body.restReview)))
      throw new Error('make sure that the restaurant review is a number');

    const review = await prisma.orderReview.create({
      data: {
        orderId: req.body.orderId,
        deliverRating: req.body.delReview,
        restaurantRating: req.body.restReview,
        customerId: req.user.userName,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        review,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.openTicket = async (req, res) => {
  try {
    if (!req.body.message) throw new Error('you should write the message');
    const message = await prisma.tickets.create({
      data: {
        status: 'not solved',
        message: req.body.message,
        customerId: req.user.userName,
        createdAt: new Date(),
        subject: req.body.subject ? req.body.subject : null,
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
