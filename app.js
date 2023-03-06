// ./app.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// Global middleware\

// set secutity http header
app.use(helmet());

// limit request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, Please try again in an hour',
});

app.use('/api', limiter);

// Body parser, reading data from body  into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data senitization against xss(cross site stripting attack)
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'difficulty',
      'price',
      'ratingQuantity',
      'ratingsAverage',
    ], // allow duplication
  })
);

// To expose public resources
app.use(express.static(`${__dirname}/public`));

// custom middleware
app.use((req, res, next) => {
  console.log('Hello from miiddleware 👋');
  next();
});

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `cant't find ${req.originalUrl} on this server`
  // })

  // const err = new Error(`cant't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404
  // next(err)

  next(new AppError(`cant't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
