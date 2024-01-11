import mongoose from "mongoose";

const musicCategorySchema = new mongoose.Schema({
  music_category_name: { type: String, required: true },
});

const MusicCategory = mongoose.model('MusicCategory', musicCategorySchema);

export default MusicCategory;

