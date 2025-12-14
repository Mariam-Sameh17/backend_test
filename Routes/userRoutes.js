const express = require('express');
const authController = require('../controllers/authControllers');
const userController = require('../controllers/userControllers');

const router = express.Router();

router.post(
  '/customerSignup',
  authController.uploadPhoto,
  authController.customerSignup
);

router.post(
  '/managerSignup',
  authController.uploadOwner,
  authController.managerSignup
);

router.post(
  '/deliverySignup',
  authController.uploadPhoto,
  authController.deliverySignup
);

router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.patch(
  '/changePassword',
  authController.protect,
  authController.changePassword
);

router.post('/sendMessage', authController.protect, userController.sendMessage);

router.get('/getMessages', authController.protect, userController.getMessages);

module.exports = router;
