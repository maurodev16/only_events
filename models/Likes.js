const mongoose = require('mongoose');
const User = require("./User");
const Post = require("./Post");

const likeSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
