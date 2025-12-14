const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const deliveryControllers = require('../controllers/deliveryControllers');

router.get(
  '/getOrders',
  authController.protect,
  authController.restrictToDelivery,
  deliveryControllers.getOrders
);

router.patch(
  '/deliver',
  authController.protect,
  authController.restrictToDelivery,
  deliveryControllers.deliver
);

router.patch(
  '/leave',
  authController.protect,
  authController.restrictToDelivery,
  deliveryControllers.leaveOrder
);

module.exports = router;
