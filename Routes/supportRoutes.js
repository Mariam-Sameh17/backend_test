const express = require('express');
const supportController = require('../controllers/supportControllers');
const authController = require('../controllers/authControllers');

const router = express.Router();

router.get(
  '/getAllDelivery',
  authController.protect,
  authController.restrictToSupport,
  supportController.getAllDelivery
);

router.get(
  '/getAllRestaurants',
  authController.protect,
  authController.restrictToSupport,
  supportController.getAllRestaurants
);

router.get(
  '/getAllTickets',
  authController.protect,
  authController.restrictToSupport,
  supportController.getAllTickets
);

router.post(
  '/addSupportStaff',
  authController.protect,
  authController.restrictToSupport,
  authController.uploadPhoto,
  authController.Photo,
  supportController.addSupportStaff
);

router.post(
  '/solveTicket',
  authController.protect,
  authController.restrictToSupport,
  supportController.solveTicket
);

module.exports = router;
