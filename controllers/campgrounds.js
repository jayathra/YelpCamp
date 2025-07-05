const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    // Convert to GeoJSON FeatureCollection
    const geojson = {
        type: "FeatureCollection",
        features: campgrounds.map(cg => ({
            type: "Feature",
            geometry: cg.geometry,
            properties: {
                id: cg._id,
                title: cg.title,
                location: cg.location,
                popUpMarkup: `<a href="/campgrounds/${cg._id}">${cg.title}</a><br>${cg.location}`
            }
        }))
    };
    res.render('campgrounds/index', { campgrounds, maptilerKey: process.env.MAPTILER_API_KEY, geojson });
};

module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new')
};

module.exports.createCampground = async (req, res) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, {limit: 1});
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
      path: 'reviews',
      populate: {
        path: 'author'
      }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, {limit: 1});
    campground.geometry = geoData.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        // Only delete from cloudinary if the filename looks like a cloudinary file (not a picsum url)
        for (let filename of req.body.deleteImages) {
            // Cloudinary images typically have a filename like 'YelpCamp/abc123.jpg'
            if (!filename.startsWith('Pic ')) {
                // Attempt to delete from cloudinary
                try {
                    await cloudinary.uploader.destroy(filename);
                } catch (err) {
                    console.error(`Failed to delete ${filename} from Cloudinary:`, err);
                }
            }
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    console.log(campground);
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds')
}

