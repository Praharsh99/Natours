const mongoose = require('mongoose');
const Tour = require('./tourModel');
const User = require('./userModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      default: 1,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//Query Middleware
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// Here we used "statics" because it gives us the option of "this" keyword which points to the Model
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // Aggregate function should only be called on the Model, not on current document
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
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

// .post will not get the "next()" function
reviewSchema.post('save', function () {
  // here "this" is the newly created review(document)
  // this.constructor calls the model's(i.e., class) methods
  this.constructor.calcAverageRatings(this.tour);
});

// Query Middleware
reviewSchema.pre(/findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = new mongoose.model('Review', reviewSchema);

module.exports = Review;
