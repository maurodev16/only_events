const mongoose = require('mongoose');
const User = require("./Auth");
const Establishment = require("./Establishment");

const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  establishment: { type: mongoose.Schema.Types.ObjectId, ref: 'Establishment', required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
},
);

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
