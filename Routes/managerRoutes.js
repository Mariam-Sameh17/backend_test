const express = require('express');
const managerController = require('../controllers/managerControllers');
const authController = require('../controllers/authControllers');
const router = express.Router();

router.post(
  '/addItem',
  authController.protect,
  authController.restrictToOwner,
  authController.uploadPhoto,
  managerController.addItems
);

router.post(
  '/setItemDiscount',
  authController.protect,
  authController.restrictToOwner,
  managerController.setItemDiscount
);

router.get(
  '/getMenu',
  authController.protect,
  authController.restrictToOwner,
  managerController.getMenu
);

router.get(
  '/stats',
  authController.protect,
  authController.restrictToOwner,
  managerController.stats
);

router.get(
  '/getOrders',
  authController.protect,
  authController.restrictToOwner,
  managerController.getOrders
);

router.post(
  '/addKitchenStaff',
  authController.protect,
  authController.restrictToOwner,
  authController.uploadPhoto,
  managerController.addKitchenStaff
);

router.post(
  '/addSubscription',
  authController.protect,
  authController.restrictToOwner,
  managerController.createSubscription
);

router.delete(
  '/deleteSubscription',
  authController.protect,
  authController.restrictToOwner,
  managerController.deleteSubscription
);

router.post(
  '/addCoupon',
  authController.protect,
  authController.restrictToOwner,
  managerController.createCoupon
);

module.exports = router;
