const mongoose = require('mongoose');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
  .then(() => {
    console.log("MongoDB connection open ✅");
  })
  .catch(err => {
    console.error("MongoDB connection error ❌:", err);
  });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
      const random1000 = Math.floor(Math.random() * 1000);
      const price = Math.floor(Math.random() * 20) + 10;
      // Generate 1-4 images per campground
      const numImages = Math.floor(Math.random() * 4) + 1;
      const images = [];
      for (let j = 1; j <= numImages; j++) {
        images.push({
          url: `https://picsum.photos/400?random=${Math.random()}`,
          filename: `Pic ${j}`
        });
      }
      const camp = new Campground ({
        author: '6865547b1fad3cfa78b5d3f5',
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        images, // <-- now an array of images
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eros ipsum, volutpat eu mattis a, ullamcorper sit amet sem. Integer malesuada feugiat ipsum, eu fermentum quam varius eu. Etiam arcu justo, rhoncus id elementum eu, euismod eget velit. Donec nec ultricies lectus. Etiam facilisis porta dui, nec sollicitudin tellus molestie at. Duis vitae vehicula dolor. Fusce erat augue, tristique eu ligula id, pretium gravida elit. Pellentesque vehicula ante a turpis venenatis mattis. Nulla placerat quis sapien vel cursus. Donec consequat venenatis odio sed accumsan. Nam consectetur laoreet sem vitae sagittis. Integer nec hendrerit neque. Sed eget nulla condimentum, posuere ipsum ullamcorper, facilisis magna.',
        price,
        geometry: {
          type: "Point",
          coordinates: [cities[random1000].longitude, cities[random1000].latitude]
        }
      })
      await camp.save();
    }
}

seedDB().then(() => {
  mongoose.connection.close();
});