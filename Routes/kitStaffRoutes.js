const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const staffController = require('../controllers/kitStaffControllers');

router.get(
  '/getOrders',
  authController.protect,
  authController.restrictToStaff,
  staffController.getOrders
);

router.patch(
  '/prepare',
  authController.protect,
  authController.restrictToStaff,
  staffController.prepare
);

router.patch(
  '/finish',
  authController.protect,
  authController.restrictToStaff,
  staffController.finishOrder
);

module.exports = router;
