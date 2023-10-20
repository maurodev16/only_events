const mongoose = require('mongoose');

const cityAndCountrySchema = new mongoose.Schema({
  country_name: { type: String },
  city_name: { type: String },


});

const CityAndCountry = mongoose.model('CityAndCountry', cityAndCountrySchema);

module.exports = CityAndCountry;
