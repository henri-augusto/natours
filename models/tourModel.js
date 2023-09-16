const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: 40,
      minlength: 10,
      // validate: validator.isAlpha
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5;0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price {VALUE} should be below de regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // FAZ COM QUE ESSE CAMPO NÃO RETORNE NA CONSULTA 'GET'
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      // MongoDB inverte as coordenadas. O que seria latitude e longitude, é ao contrário nesse Schema
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        // MongoDB inverte as coordenadas. O que seria latitude e longitude, é ao contrário nesse Schema
        coordinates: [Number],
        description: String,
        day: Number,
      },
    ],
    // Feito dessa forma para o embedding
    // guides: Array
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes para consultas com mais performance
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// PROPRIEDADE VIRTUAL
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// POPULAR DE FORMA VIRTUAL
tourSchema.virtual('reviews', {
  ref: 'Review',
  // Como conectar dois schemas na propriedade virtual? selecionando o
  // o nome do campos que contem o ID no schema de um e do outro também
  foreignField: 'tour',
  localField: '_id',
});

// MIDDLEWARE DO MONGOOSE 'PRE' para executar funções antes de executar o metodo Save
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embedding modeling feito na mão
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// REGULAR EXPRESSION para executar esse middleware para todos os metodos que começam com a palavra Find
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChandedAt',
  });
  next();
});

tourSchema.pre('aggregation', function (next) {
  // .unshift para adcionar elementos no início de um array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
