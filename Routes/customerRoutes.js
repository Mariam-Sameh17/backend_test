const express = require('express');
const authController = require('../controllers/authControllers');
const customerController = require('../controllers/customerControllers');

const router = express.Router();

router.post(
  '/getRestaurants',
  authController.protect,
  authController.restrictToCustomer,
  customerController.getAllRestaurants
);

router.get(
  '/getItems',
  authController.protect,
  authController.restrictToCustomer,
  customerController.getAllItems
);

router.get(
  '/getRestaurantbyCategory',
  authController.protect,
  authController.restrictToCustomer,
  customerController.getRestaurantbyCategory
);

router.get(
  '/getRestaurantbyName',
  authController.protect,
  authController.restrictToCustomer,
  customerController.getRestaurantbyName
);

router.get(
  '/paymentPage',
  authController.protect,
  authController.restrictToCustomer,
  customerController.paymentPage
);

router.get(
  '/getOrders',
  authController.protect,
  authController.restrictToCustomer,
  customerController.getOrders
);

router.get(
  '/getOrderDetail',
  authController.protect,
  authController.restrictToCustomer,
  customerController.getOrderDetails
);

router.post(
  '/addWallet',
  authController.protect,
  authController.restrictToCustomer,
  customerController.addWallet
);

router.post(
  '/addLocation',
  authController.protect,
  authController.restrictToCustomer,
  customerController.addAddress
);

router.post(
  '/subscribe',
  authController.protect,
  authController.restrictToCustomer,
  customerController.subscribe
);

router.post(
  '/placeOrder',
  authController.protect,
  authController.restrictToCustomer,
  customerController.placeOrder
);

router.post(
  '/openTicket',
  authController.protect,
  authController.restrictToCustomer,
  customerController.openTicket
);

router.patch(
  '/tip',
  authController.protect,
  authController.restrictToCustomer,
  customerController.tip
);

router.patch(
  '/review',
  authController.protect,
  authController.restrictToCustomer,
  customerController.review
);

module.exports = router;
