const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
/**
 * 中间件
 */
const { authorizeMiddleware } = require('./middleware/auto');

const loginRouter = require('./routes/login');
const bookRouter = require('./routes/book');
const orderRouter = require('./routes/order');
const commentRouter = require('./routes/comment');
const userRouter  = require('./routes/user');

const app = express();

// view engine setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/login', authorizeMiddleware, loginRouter);
app.use('/api/book', bookRouter);
app.use('/api/order', orderRouter);
app.use('/api/comment', commentRouter);
app.use('/api/user', userRouter);

// catch 404 and forward to error handler

app.use(function (req, res, next) {
  next(createError(404));
});

module.exports = app;
