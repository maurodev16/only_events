const mongoose = require("mongoose");
const countriesList = require('countries-list');

const artistSchema = new mongoose.Schema({
  artist_name: { type: String, required: true },
    genre: { type: String },
    biography: { type: String },
    country: {
      code: { type: String, required: true },
      name: { type: String},
      emoji: { type: String },
      emojiUnicode: { type: String },
      capital: { type: String },
      continent: { type: String },
      currency: { type: String },
      languages: [String]
    },
    banner: { type: String },
    photos: [{ type: String }],
    socialMedia: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      youtube: { type: String }
    },
    contact: {
      email: { type: String },
      phone: { type: String }
    },
    discography: [{
      title: { type: String },
      releaseDate: { type: Date }
    }],
    streamingLinks: [{ type: String }],
    awards: [{ type: String }]
  });
// Pré-salvar o documento para adicionar as informações do país
artistSchema.pre('save', function(next) {
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
  const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;