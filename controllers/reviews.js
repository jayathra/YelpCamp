const Campground = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema } = require('../schemas.js'); // Joi schema
const ExpressError = require('../utils/ExpressError'); // your custom error class (optional)

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  if (review.rating === 0) {
    req.flash('error', 'The rating needs to be atleast 1 star.')
  } else {
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
  }
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId }});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`)
}