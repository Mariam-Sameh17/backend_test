const express = require('express');
const authController = require('../controllers/authControllers');
const userController = require('../controllers/userControllers');

const router = express.Router();

router.post(
  '/customerSignup',
  authController.uploadPhoto,
  authController.Photo,
  authController.customerSignup
);

router.post(
  '/managerSignup',
  authController.uploadOwner,
  authController.ownerPhotos,
  authController.managerSignup
);

router.post(
  '/deliverySignup',
  authController.uploadPhoto,
  authController.Photo,
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

router.get(
  '/getMessages/:orderId',
  authController.protect,
  userController.getMessages
);

router.get('/profile', authController.protect, userController.profile);

router.patch(
  '/editProfile',
  authController.protect,
  userController.updateProfile
);

module.exports = router;
