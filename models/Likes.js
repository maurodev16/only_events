const mongoose = require('mongoose');
const User = require("./Auth");
const Post = require("./Post");

const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
},
);

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
