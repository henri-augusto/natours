const express = require('express');
const {
  aliasTopTours,
  getAllTours,
  getMonthlyPlan,
  createTour,
  deleteTour,
  getTour,
  getTourStats,
  updateTour,
  uploadTourImages,
  resizeTourImages,
  getToursWithin,
  getDistances,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// Definindo o tour para a rota de reviews
router.use('/:tourId/reviews', reviewRouter);

// Params middleware
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

// Rotas específicas
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'laed-guide', 'guide'), getMonthlyPlan);

router
  .route('/')
  .get(protect, getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .delete(protect, restrictTo('admin', 'laed-guide'), deleteTour)
  .patch(
    protect,
    restrictTo('admin', 'laed-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour,
  );

router.route('/distances/:latlgn/unit').get(getDistances);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

module.exports = router;
