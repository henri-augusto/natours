const express = require('express');
const {
  createBooking,
  getBookingById,
  getBookings,
  updateBooking,
  deleteBooking,
  getCheckoutSession,
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.get('/checkout-session/:tourID', protect, getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));

router.route('/').post(createBooking).get(getBookings);
router
  .route('/:id')
  .get(getBookingById)
  .patch(updateBooking)
  .delete(deleteBooking);

module.exports = router;
