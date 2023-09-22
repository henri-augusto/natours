const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getBookings = factory.getAll(Booking);
exports.getBookingById = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Retornar o tour atual
  const tour = await Tour.findById(req.params.tourID);

  // Criar um sessão de checkout
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`,
            ],
          },
          currency: 'usd',
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    customer_email: req.user.email,
    client_reference_id: tour.id,
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
  });

  // Levar a sessão ao response
  res.status(200).json({
    status: 'success',
    session: session.url,
  });
});

const checkoutSessionCompleted = async (session) => {
  try {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.amount_total / 100;
    await Booking.create({ tour, user, price });
  } catch (error) {
    return console.log(error);
  }
};

exports.webhookCheckout = (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_SECRET_WEBHOOK,
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  // Handle the event
  if (event.type === 'checkout.session.completed') {
    checkoutSessionCompleted(event.data.object);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};
