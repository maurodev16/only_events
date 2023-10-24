const mongoose = require("mongoose");
const User = require("./Auth");
const CityAndCountry = require('./CityAndCountry');
const accounting = require('accounting');
const MusicCategory = require('./MusicCategory');
const Like = require('./Likes');
require('dotenv').config();

const postSchema = new mongoose.Schema({
  post_image_url: { type: String},
  title: { type: String, default: "" },
  place_name: { type: String, default: "" },
  street_name: { type: String, default: "" },
  district:{type: String, default: ""},
  number: { type: String, default: "" },
  postal_code: { type: String, default: "" },
  phone: { type: String, default: "" },
  start_date: { type: Date },
  end_date: { type: Date },
  start_time: { type: String, default: "" },
  end_time: { type: String, default: "" },
  week_days: [{ type: String, default: []}],
  is_age_verified: { type: Boolean },
  selected_age: { type: String },
  is_free_entry: { type: Boolean },
  free_entry_till:{ type: String},
  can_pay_with_card_entry: { type: Boolean },
  can_pay_with_card_consumption: { type: Boolean },
  is_fixed_date: { type: Boolean },
  extra_info: { type: String, default: "" },
  city_name: { type: String, default: "" },
  music_category_id: [{type: mongoose.Schema.Types.ObjectId, ref: 'MusicCategory'}],
  music_category_name: [{type: String,  default: [] }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
  likes_count: { type: Number, default: 0 },
  is_featured: { type: Boolean, default: false }, 
  entrance_price: {type: String},
},
  {
    timestamps: true,
  },
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

