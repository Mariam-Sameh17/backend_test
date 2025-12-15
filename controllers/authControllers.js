const { promisify } = require('util');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });
const validations = require('../utilis/validations');
const multer = require('multer');
const sharp = require('sharp');

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'YumRush' },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

exports.Photo = async (req, res, next) => {
  if (!req.file) return next();

  const processedBuffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer();

  const result = await uploadFromBuffer(processedBuffer);

  req.body.photo = result.secure_url;
  next();
};

exports.ownerPhotos = async (req, res, next) => {
  if (!req.files) return next();

  if (req.files.photo) {
    const userBuffer = await sharp(req.files.photo[0].buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const userResult = await uploadFromBuffer(userBuffer);

    req.body.photo = userResult.secure_url;
  }

  if (req.files.restPhoto) {
    const restBuffer = await sharp(req.files.restPhoto[0].buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const restResult = await uploadFromBuffer(restBuffer);

    req.body.restPhoto = restResult.secure_url;
  }
  next();
};

const errorMessage = (err) => {
  if (err.code === 'P2002') {
    if (err.meta.target == 'dbo.Restaurant')
      return 'This restaurant name already exist';
    else if (err.meta.target == 'dbo.deliveryPerson')
      return 'This id belongs already to another user';
    else return 'This UserName already exist';
  }
  if (err.name === 'PrismaClientValidationError')
    return "Don't leave an empty field";
  return err.message;
};

const signToken = (userName, userType) => {
  return jwt.sign({ userName, userType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const finalResponse = (user, res, statusCode) => {
  const token = signToken(user.userName, user.type);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: 'none',
  };
  cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  user.passwordChangedAt = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Please upload only images'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.single('photo');
exports.uploadOwner = upload.fields([{ name: 'photo' }, { name: 'restPhoto' }]);

// const UserPhoto = async (req) => {
//   if (!req.file) return;
//   req.file.filename = `${req.body.userName}.jpeg`;

//   await sharp(req.file.buffer)
//     .resize(500, 500)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(`images/users/${req.file.filename}`);
// };

// const ownerPhotos = async (req) => {
//   if (!req.files) return;
//   if (req.files.photo) {
//     req.files.photo[0].filename = `${req.body.userName}.jpeg`;
//     await sharp(req.files.photo[0].buffer)
//       .resize(500, 500)
//       .toFormat('jpeg')
//       .jpeg({ quality: 90 })
//       .toFile(`images/users/${req.files.photo[0].filename}`);
//   }
//   if (req.files.restPhoto) {
//     req.files.restPhoto[0].filename = `${req.body.restaurantName}.jpeg`;
//     await sharp(req.files.restPhoto[0].buffer)
//       .resize(500, 500)
//       .toFormat('jpeg')
//       .jpeg({ quality: 90 })
//       .toFile(`images/restaurants/${req.files.restPhoto[0].filename}`);
//   }
// };

exports.customerSignup = async (req, res, next) => {
  try {
    if (!req.body.methodNumber)
      throw new Error('You should enter the number of the card or wallet');
    if (!req.body.methodType) throw new Error('You should select a type');
    const userData = await validations.validateUser(req);
    const newCustomer = await prisma.Users.create({
      data: {
        ...userData,
        type: 'c',
        photo: req.body.photo || null,
        Wallets_Cards: {
          create: {
            number: req.body.methodNumber,
            type: req.body.methodType,
          },
        },
      },
    });

    finalResponse(newCustomer, res, 201);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: errorMessage(err),
    });
  }
};

exports.deliverySignup = async (req, res, next) => {
  try {
    const userData = await validations.validateUser(req);
    const deliveryData = validations.validateDelivery(req);
    const newDelivery = await prisma.Users.create({
      data: {
        ...userData,
        photo: req.body.photo || null,
        type: 'd',
        deliveryPerson: {
          create: {
            ...deliveryData,
          },
        },
      },
      include: {
        deliveryPerson: true,
      },
    });

    finalResponse(newDelivery, res, 201);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: errorMessage(err),
    });
  }
};

exports.managerSignup = async (req, res, next) => {
  try {
    const userData = await validations.validateUser(req);
    const restaurantData = validations.validateRestaurant(req);
    const newManager = await prisma.Users.create({
      data: {
        ...userData,
        type: 'm',
        photo: req.body.photo || null,
        restaurantOwner: {
          create: {
            bankId: req.body.bankId ? req.body.bankId : null,
            Restaurant: {
              create: {
                ...restaurantData,
                photo: req.body.restPhoto || null,
              },
            },
          },
        },
      },
      include: {
        restaurantOwner: { include: { Restaurant: true } },
      },
    });

    finalResponse(newManager, res, 201);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: errorMessage(err),
    });
  }
};

exports.login = async (req, res, next) => {
  let { userName, password } = req.body;
  if (!userName || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Enter the userName and password',
    });
  }

  const user = await prisma.Users.findUnique({
    where: {
      userName,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      status: 'fail',
      message: 'Incorrect userName or Password',
    });
  }

  finalResponse(user, res, 200);
};

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return res.status(401).json({
      status: 'fail',
      message: 'Please Login first to access this page',
    });
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      message: err.message,
    });
  }

  const user = await prisma.Users.findUnique({
    where: { userName: decoded.userName },
  });

  if (!user) {
    return res.status(401).json({
      status: 'fail',
      message: 'The User no longer exist',
    });
  }

  if (user.passwordChangedAt) {
    if (parseInt(user.passwordChangedAt.getTime() / 1000, 10) > decoded.iat) {
      return res.status(401).json({
        status: 'fail',
        message: 'User changed the password recently please login again',
      });
    }
  }
  req.user = user;
  next();
};

exports.restrictToSupport = async (req, res, next) => {
  if (req.user.type !== 's') {
    return res.status(403).json({
      status: 'fail',
      message: 'This page is for Support Staff only',
    });
  }
  next();
};

exports.restrictToCustomer = async (req, res, next) => {
  if (req.user.type !== 'c') {
    return res.status(403).json({
      status: 'fail',
      message: 'This page is for Customers only',
    });
  }
  next();
};

exports.restrictToOwner = async (req, res, next) => {
  if (req.user.type !== 'm') {
    return res.status(403).json({
      status: 'fail',
      message: 'This page is for Restaurant Owners only',
    });
  }
  next();
};

exports.restrictToStaff = async (req, res, next) => {
  if (req.user.type !== 'k') {
    return res.status(403).json({
      status: 'fail',
      message: 'This page is for Kitchen Staff only',
    });
  }
  next();
};

exports.restrictToDelivery = async (req, res, next) => {
  if (req.user.type !== 'd') {
    return res.status(403).json({
      status: 'fail',
      message: 'This page is for Delivery only',
    });
  }
  next();
};

exports.changePassword = async (req, res, next) => {
  if (!req.body.currentPassword || !req.body.newPassword) {
    res.status(400).json({
      status: 'fail',
      message: 'Please enter your current and new password',
    });
  }

  if (!(await bcrypt.compare(req.body.currentPassword, req.user.password))) {
    res.status(401).json({
      status: 'fail',
      message: 'Wrong current password',
    });
  }

  const password = await bcrypt.hash(req.body.newPassword, 12);

  const user = await prisma.Users.update({
    where: {
      userName: req.user.userName,
    },
    data: {
      password,
      passwordChangedAt: new Date(Date.now() - 1000),
    },
  });

  finalResponse(user, res, 200);
};

exports.logout = async (req, res, next) => {
  res.cookie('jwt', 'logged out', {
    httpOnly: true,
    expiresIn: new Date(Date.now() + 10 * 1000),
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.profile = async (req, res) => {
  let user;
  if (req.user.type === 'c' || req.user.type === 's')
    user = await prisma.users.findFirst({
      where: {
        userName: req.user.userName,
      },
    });
  else if (req.user.type === 'm') {
    user = await prisma.users.findFirst({
      where: {
        userName: req.user.userName,
      },
      include: { restaurantOwner: { include: { Restaurant: true } } },
    });
  } else if (req.user.type === 'k') {
    user = await prisma.users.findFirst({
      where: {
        userName: req.user.userName,
      },
      include: { kitchenStaff: true },
    });
  } else if (req.user.type === 'd') {
    user = await prisma.users.findFirst({
      where: {
        userName: req.user.userName,
      },
      include: { deliveryPerson: true },
    });
  }
  user.password = undefined;
  user.passwordChangedAt = undefined;
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};
