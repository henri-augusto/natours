const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user! '],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).populate({
    path: 'tour',
    select: 'name imageCover',
  });

  next();
});

reviewSchema.statics.calcRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findOneAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findOneAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// Chamando o metodo de calculo quando salvar um novo review
reviewSchema.post('save', function () {
  this.constructor.calcRatings(this.tour);
});

// Chamando o metodo de calculo quando atualizar um review
reviewSchema.post('findOneAndUpdate', async function () {
  const rev = await this.model.findOne(this.getQuery());
  await rev.constructor.calcRatings(rev.tour);
});

// Chamando o metodo de calculo quando deletar um review
reviewSchema.pre('findOneAndDelete', async function (next) {
  this.rev = await this.model.findOne(this.getQuery());
  next();
});

// Chamando o metodo post para o delete e atualizar o ratings do tour
reviewSchema.post('findOneAndDelete', async function () {
  await this.rev.constructor.calcRatings(this.rev.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
