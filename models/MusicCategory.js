const mongoose = require('mongoose');

const musicCategorySchema = new mongoose.Schema({
  music_category_name: { type: String },

});

const MusicCategory = mongoose.model('MusicCategory', musicCategorySchema);

module.exports = MusicCategory;
