const express = require('express');
const {
  getOverview,
  getTour,
  getLogin,
  getAccount,
  // updateUser,
  getMyBookings,
  getMyReviews,
  getSignup,
} = require('../controllers/viewController');
const { isLoggedIn, protect } = require('../controllers/authController');

const router = express.Router();

router.get('/my-reviews', protect, getMyReviews);
router.get('/my-bookings', protect, getMyBookings);
router.get('/me', protect, getAccount);
router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLogin);
router.get('/sign-up', isLoggedIn, getSignup);
// router.post('/submit-user-data', protect, updateUser);

module.exports = router;
