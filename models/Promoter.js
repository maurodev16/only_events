const mongoose = require("mongoose");
const Participant = require('./Participant');
const Event = require('./Event');
const City = require('./City');
require('dotenv').config();
IMAGE_AVATAR_DEFAULT_TOKEN = process.env.IMAGE_AVATAR_DEFAULT_TOKEN;

const promoterSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String,required: true},
  avatarUrl: { type: String, default: `https://firebasestorage.googleapis.com/v0/b/evento-app-5a449.appspot.com/o/default-avatar.png?alt=media&token=${IMAGE_AVATAR_DEFAULT_TOKEN}` },
  age: { type: Number},
  phone:{type: String},
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, // Referência para o modelo City
  street: { type: String },
  adrress_number: { type: String },
  post_code: { type: String },
  contact: { type: String },
});

const Promoter = mongoose.model('Promoter', promoterSchema);

module.exports = Promoter;