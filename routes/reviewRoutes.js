const express = require('express');
const {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  getReview,
  setTourUserIds,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .post(restrictTo('user'), setTourUserIds, createReview)
  .get(getAllReviews);

router
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('admin', 'user'), deleteReview)
  .patch(restrictTo('admin', 'user'), updateReview);

module.exports = router;
