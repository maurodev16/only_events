const mongoose = require("mongoose");
const Promoter = require("./Promoter");
const City = require('./City');
const accounting = require('accounting');
const Artist = require('./Artist');
const countriesList = require('countries-list');
const Like = require('./Likes');
require('dotenv').config();


IMAGE_AVATAR_DEFAULT_TOKEN = process.env.IMAGE_AVATAR_DEFAULT_TOKEN;
IMAGE_BANNER_DEFAULT_TOKEN = process.env.IMAGE_BANNER_DEFAULT_TOKEN;

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    bannerUrl: { type: String, default: `https://firebasestorage.googleapis.com/v0/b/evento-app-5a449.appspot.com/o/Blue%20Pink%20Gradient%20Fashion%20Banner.png?alt=media&token=${IMAGE_BANNER_DEFAULT_TOKEN}`},
    photoGallery: [{ type: String }],
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
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
    cityName: { type: String, required: true },
    street: { type: String, required: true },
    number: { type: String, required: true },
    place_name: { type: String, required: true },
    description: { type: String, required: true },
    entrance_price: {
        type: Number, required: true, default: 0,
        get: (value) => accounting.formatMoney(value / 100, "€", 2),
        set: (value) => accounting.unformat(value) * 100
    },
    organized_by: { type: String, required: true },
    for_adults_only: { type: Boolean, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String },
    paymentInfo: { type: String },
    socialMedia: {
        facebook: { type: String },
        instagram: { type: String },
        twitter: { type: String }
    },
    created: { type: Date, required: true, default: Date.now },
    updated: { type: Date, required: true, default: Date.now },
    promoter: { type: mongoose.Schema.Types.ObjectId, ref: 'Promoter', required: true },
    artists:{
    name: { type: String },
    genre: { type: String },
    avatarUrl: { type: String, default: `https://firebasestorage.googleapis.com/v0/b/evento-app-5a449.appspot.com/o/default-avatar.png?alt=media&token=${IMAGE_AVATAR_DEFAULT_TOKEN}` },
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
    likesCount: { type: Number, default: 0 },
    isFeatured:{ type: Boolean, default: false}
});

// Atualiza o valor de likesCount sempre que um like for adicionado ou removido
eventSchema.post('save', async function (doc) {
    const likesCount = await Like.countDocuments({ event: doc._id });
    doc.likesCount = likesCount;
    await doc.save();
});
// Pré-salvar o documento para adicionar as informações do país
eventSchema.pre('save', function(next) {
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
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
