import mongoose from "mongoose";

const musicCategorySchema = new mongoose.Schema({
  musicCategoryName: { type: String, required: true },
});

const MusicCategory = mongoose.model('MusicCategory', musicCategorySchema);

export default MusicCategory;

