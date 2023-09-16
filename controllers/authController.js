const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendSignToken = (res, statusCode, user) => {
  // Enviando um id para criar um token
  const token = signToken(user._id);

  // Configurando um cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // Enviando um cookie com nome 'jwt' e um token
  res.cookie('jwt', token, cookieOptions);

  // Deletando o password da chamada de retorno, pois está voltando com password
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();

  sendSignToken(res, 201, newUser);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email our password', 401));
  }

  sendSignToken(res, 200, user);
});

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // Pago o token do header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Verifica se o token existe
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );
  }

  // Verifica se o token é válido
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Verifica se o usuário ainda existe
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user no long exist', 401));
  }

  // Verifica se o usuário mudou a senha depois do token for emitido
  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please Log In again', 401),
    );
  }

  // Garante acesso a rota protegida
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // Verifica se o token é válido
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // Verifica se o usuário ainda existe
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // Verifica se o usuário mudou a senha depois do token for emitido
      if (await currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // Garante acesso a rota protegida
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

// ... desestruturando o roles com ES6
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You not have permission to use this action', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There are no user with this email adress', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save();

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/app/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return next(new AppError(error, 500));
  }

  res.status(200).json({
    status: 'sucess',
    message: 'Token send to email!',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Pegar o token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // Se o token não expirou, e tem um usuario, autorizamo mudar a senha
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  // Update a chandedPasswordAt para o usuario

  // Log in and envia JWT

  sendSignToken(res, 200, user);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Trazer um usuário da coleção
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
    return next(new AppError('The old password is incorrect!', 400));
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  sendSignToken(res, 200, user);
});
