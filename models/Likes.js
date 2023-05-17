const mongoose = require('mongoose');
const Promoter = require("./Promoter");
const Event = require("./Event");

const likeSchema = new mongoose.Schema({
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
