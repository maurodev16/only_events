const mongoose = require("mongoose");
const Participant = require('./Participant');
const Event = require('./Event');
const countriesList = require('countries-list');
require('dotenv').config();
IMAGE_AVATAR_DEFAULT_TOKEN = process.env.IMAGE_AVATAR_DEFAULT_TOKEN;

const promoterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nickname: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String },
  avatarUrl: { type: String, default: `https://firebasestorage.googleapis.com/v0/b/evento-app-5a449.appspot.com/o/default-avatar.png?alt=media&token=${IMAGE_AVATAR_DEFAULT_TOKEN}` },
  age: { type: Number, required: true},
  phone:{type: String},
  country: {
    code: { type: String, },
    name: { type: String, required: true},
    emoji: { type: String },
    emojiUnicode: { type: String },
    capital: { type: String },
    continent: { type: String },
    currency: { type: String },
    languages: [String]
  },
  city: { type: String },
  street: { type: String },
  post_code: { type: String },
  contact: { type: String },
});
// Pré-salvar o documento para adicionar as informações do país
promoterSchema.pre('save', function(next) {
  const countryData = countriesList.countries[this.country.code];
  if (countryData) {
    this.country.code = countryData.code;
    this.country.name = countryData.name;
    this.country.emoji = countryData.emoji;
    this.country.emojiUnicode = countryData.emojiU;
    this.country.capital = countryData.capital;
    this.country.continent = countryData.continent;
    this.country.currency = countryData.currency;
    this.country.languages = countryData.languages;
  }
  next();
});
// Pré-salvar o documento para adicionar o "@" antes do nickname
promoterSchema.pre('save', function(next) {
  this.nickname = '@' + this.nickname;
  next();
});

const Promoter = mongoose.model('Promoter', promoterSchema);

module.exports = Promoter;