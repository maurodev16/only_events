const mongoose = require('mongoose');
const User = require("./Auth");
const Post = require("./Post");

const likeSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
