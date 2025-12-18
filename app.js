const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const userRouter = require('./Routes/userRoutes');
const supportRouter = require('./Routes/supportRoutes');
const customerRouter = require('./Routes/customerRoutes');
const managerRouter = require('./Routes/managerRoutes');
const kitStaffRouter = require('./Routes/kitStaffRoutes');
const deliveryRouter = require('./Routes/deliveryRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json());

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
BigInt.prototype.toJSON = function () {
  return Number(this);
};

const corsOptions = {
  origin: ['http://localhost:5173', 'https://yumrush-m.netlify.app'],
  credentials: true,
};

// Apply it
app.use(cors(corsOptions));

app.use(express.static(`${__dirname}/images`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/users', userRouter);
app.use('/api/support', supportRouter);
app.use('/api/manager', managerRouter);
app.use('/api/customer', customerRouter);
app.use('/api/kitStaff', kitStaffRouter);
app.use('/api/delivery', deliveryRouter);

module.exports = app;
