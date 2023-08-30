const mongoose = require("mongoose");
const User = require("./Auth");
const City = require('./City');
const accounting = require('accounting');
const Artist = require('./Artist');
const Like = require('./Likes');
require('dotenv').config();

IMAGE_AVATAR_DEFAULT_TOKEN = process.env.IMAGE_AVATAR_DEFAULT_TOKEN;
IMAGE_BANNER_DEFAULT_TOKEN = process.env.IMAGE_BANNER_DEFAULT_TOKEN;

const postSchema = new mongoose.Schema({
    post_images_urls: [{ type: String }],
    title: { type: String, default: "" },
    street_name: { type: String, default: "" },
    place_name: { type: String, default: ""  },
    number: { type: String, default: "" },
    phone: { type: String, default: "" },
    post_code: { type: String, default: "" },
    start_date: { type: Date },
    end_date: { type: Date },
    start_time: { type: String, default: "" },
    end_time: { type: String, default: "" },
    cityId:{type: String},
    cityName: { type: String, default: "" },
    week_days: [{ type: String, default: "" }],
    is_age_verified: { type: Boolean },
    selected_age: { type: String },
    is_free_entry: { type: Boolean },
    can_pay_with_card_entry: { type: Boolean },
    can_pay_with_card_consumption: { type: Boolean },
    is_fixed_date: { type: Boolean },
    extra_info: { type: String, default: "" },
    selected_week_days: [{ type: String }],
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, 
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 

    entrance_price: {
      type: Number, default: 0,
      get: (value) => accounting.formatMoney(value / 100, "€", 2),
      set: (value) => accounting.unformat(value) * 100
    },
  
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
    likes_count: { type: Number, default: 0 },
    is_featured: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  },);
  
  // Atualiza o valor de likes_count sempre que um like for adicionado ou removido
  postSchema.post('save', async function (doc) {
    const likes_count = await Like.countDocuments({ post: doc._id });
    doc.likes_count = likes_count;
    await doc.save();
  });
  
  const Post = mongoose.model('Post', postSchema);
  
  module.exports = Post;
  
