const mongoose = require("mongoose");
const Post = require('./Post');
const City = require('./City');


const userSchema = new mongoose.Schema({
  logo_url: { type: String, default: `https://firebasestorage.googleapis.com/v0/b/evento-app-5a449.appspot.com/o/default-avatar.png?alt=media&token=${IMAGE_AVATAR_DEFAULT_TOKEN}` },
  full_name: { type: String, }, 
  company: { type: String,},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['private', 'company'], required: true },
  is_company:{type: Boolean},
  phone:{type: String}, 
  street_name: { type: String },
  hause_number: { type: String },
  post_code: { type: String },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, // Referência para o modelo City
  post_history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  music_preferences: [{ type: String }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;