const bcrypt = require('bcryptjs');
exports.validateUser = async (req) => {
  if (!req.body.userName) throw new Error('You sould enter your userName');
  if (!req.body.name) throw new Error('You sould enter your name');

  if (!req.body.email) throw new Error('You sould enter your email');

  if (!req.body.phoneNumber)
    throw new Error('You sould enter your phoneNumber');

  if (req.body.phoneNumber.length > 15)
    throw new Error('The phoneNumber must be less than 15 digits');

  if (!req.body.password) throw new Error('You sould enter your password');

  if (!req.body.name) throw new Error('You sould enter your name');

  const data = {
    userName: req.body.userName,
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: await bcrypt.hash(req.body.password, 12),
    passwordChangedAt: req.body.passwordChangedAt
      ? new Date(req.body.passwordChangedAt)
      : null,
  };
  return data;
};

exports.validateItems = (req) => {
  if (!req.body.name) throw new Error('You should enter the name of the item');

  if (!req.body.menuCategory)
    throw new Error('You should enter the category of the item');

  if (!req.body.price || isNaN(parseFloat(req.body.price)))
    throw new Error('You should enter the price of the item as a number');

  if (!req.body.available) throw new Error('You should enter the availability');
  const data = {
    name: req.body.name,
    menuCategory: req.body.menuCategory,
    price: parseFloat(req.body.price),
    available: req.body.available === 'true' ? true : false,
    description: req.body.description ? req.body.description : null,
    discount: req.body.discount ? req.body.discount : null,
    finalPrice: req.body.discount
      ? parseFloat(req.body.price) -
        (req.body.discount / 100) * parseFloat(req.body.price)
      : parseFloat(req.body.price),
  };
  return data;
};

exports.validateSub = (req) => {
  if (!req.body.planName)
    throw new Error('You should enter the name of the Subscription');
  if (!req.body.price || isNaN(parseFloat(req.body.price)))
    throw new Error(
      'You should enter the price of the subscription as a number'
    );
  if (!req.body.amount || isNaN(parseFloat(req.body.amount)))
    throw new Error('You should enter the discount as a number');

  const data = {
    planName: req.body.planName,
    price: parseFloat(req.body.price),
    amount: parseFloat(req.body.amount),
    FreeDelivery: req.body.FreeDelivery,
    period: 30,
  };
  return data;
};

exports.validateCoupon = (req) => {
  if (!req.body.amount || isNaN(parseFloat(req.body.amount)))
    throw new Error('You should enter the discount as a number');

  if (!req.body.available_uses || isNaN(parseInt(req.body.available_uses)))
    throw new Error('You should enter the available_uses as a number');

  const data = {
    amount: parseFloat(req.body.amount),
    available_uses: parseInt(req.body.available_uses),
  };
  return data;
};

exports.validateDelivery = (req) => {
  if (!req.body.bankId) throw new Error('You should enter your bank id');

  if (!req.body.vehicleType)
    throw new Error('You should enter your vehicle type');

  if (!req.body.licenseNumber)
    throw new Error('You should enter your license number');

  if (!req.body.id) throw new Error('You should enter your id');

  const data = {
    bankId: req.body.bankId,
    vehicleType: req.body.vehicleType,
    licenseNumber: req.body.licenseNumber,
    id: req.body.id,
  };
  return data;
};

exports.validateRestaurant = (req) => {
  if (!req.body.category) throw new Error('You should enter the category');

  if (!req.body.openingHours)
    throw new Error('You should enter the opening hours');

  if (!req.body.restaurantName)
    throw new Error('You should enter the restaurant name');

  if (!req.body.location) throw new Error('You should enter the location');

  const data = {
    category: req.body.category,
    openingHours: req.body.openingHours,
    restaurantName: req.body.restaurantName,
    description: req.body.description ? req.body.description : null,
    location: req.body.location,
  };
  return data;
};

exports.validateOrder = (req) => {};
