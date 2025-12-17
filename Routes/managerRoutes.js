const express = require('express');
const managerController = require('../controllers/managerControllers');
const authController = require('../controllers/authControllers');
const router = express.Router();

router.post(
  '/addItem',
  authController.protect,
  authController.restrictToOwner,
  authController.uploadPhoto,
  authController.Photo,
  managerController.addItems
);

router.patch(
  '/editItem',
  authController.protect,
  authController.restrictToOwner,
  authController.uploadPhoto,
  authController.Photo,
  managerController.editItem
);

router.delete(
  '/deleteItem/:name',
  authController.protect,
  authController.restrictToOwner,
  managerController.deleteItem
);

router.patch(
  '/setAvailability',
  authController.protect,
  authController.restrictToOwner,
  managerController.setAvailability
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

router.get(
  '/getOrderDetail/:orderId',
  authController.protect,
  authController.restrictToOwner,
  managerController.getOrderDetail
);

router.get(
  '/getStaff',
  authController.protect,
  authController.restrictToOwner,
  managerController.getStaff
);

router.post(
  '/addKitchenStaff',
  authController.protect,
  authController.restrictToOwner,
  authController.uploadPhoto,
  authController.Photo,
  managerController.addKitchenStaff
);

router.post(
  '/addSubscription',
  authController.protect,
  authController.restrictToOwner,
  managerController.createSubscription
);

router.delete(
  '/deleteSubscription/:name',
  authController.protect,
  authController.restrictToOwner,
  managerController.deleteSubscription
);

router.patch(
  '/editSubscription',
  authController.protect,
  authController.restrictToOwner,
  managerController.editSubscription
);

router.get(
  '/getSub',
  authController.protect,
  authController.restrictToOwner,
  managerController.getSubscriptions
);

router.get(
  '/getRate',
  authController.protect,
  authController.restrictToOwner,
  managerController.getRate
);

router.get(
  '/getBalance',
  authController.protect,
  authController.restrictToOwner,
  managerController.getBalance
);

router.delete(
  '/deleteStaff/:userName',
  authController.protect,
  authController.restrictToOwner,
  managerController.deleteStaff
);

router.post(
  '/addCoupon',
  authController.protect,
  authController.restrictToOwner,
  managerController.createCoupon
);

module.exports = router;
