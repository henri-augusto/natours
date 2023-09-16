const express = require('express');
const {
  getOverview,
  getTour,
  getLogin,
  getAccount,
  // updateUser,
  getMyTours,
  getSignup,
} = require('../controllers/viewController');
const { isLoggedIn, protect } = require('../controllers/authController');

const router = express.Router();

router.get('/my-tours', protect, getMyTours);
router.get('/me', protect, getAccount);
router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLogin);
router.get('/sign-up', isLoggedIn, getSignup);
// router.post('/submit-user-data', protect, updateUser);

module.exports = router;
