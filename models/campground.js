const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
    url:String,
    filename:String
});

ImageSchema.set('toObject', { virtuals: true });
ImageSchema.set('toJSON', { virtuals: true });

ImageSchema.virtual('thumbnail').get(function () {
    if (this.url.includes('/upload')) {
        // Cloudinary image
        return this.url.replace('/upload', '/upload/c_scale,w_200');
    }
    // Fallback for non-Cloudinary images (e.g., Picsum)
    // Use the Picsum API to request a 100px wide image
    if (this.url.includes('picsum.photos')) {
        // Replace width in the URL with 100
        return this.url.replace(/\/\d+(\?random=.*)?$/, '/200$1');
    }
    // Default to original URL
    return this.url;
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type:[Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async (doc) => {
    if (doc) {
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        });
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);