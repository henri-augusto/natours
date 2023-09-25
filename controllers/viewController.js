const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'Todos os tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
  });

  if (!tour) next(new AppError('This page does not exist', 404));

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLogin = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login',
    status: 'success',
  });
};

exports.getSignup = (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Sign Up',
    status: 'success',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
    url: req.originalUrl,
  });
};

exports.getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const tourId = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourId } });

  res.status(200).render('account', {
    title: 'My bookings',
    url: req.originalUrl,
    tours,
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: { $in: req.user.id } });

  res.status(200).render('account', {
    title: 'My reviews',
    url: req.originalUrl,
    results: reviews.length,
    reviews,
  });
});
