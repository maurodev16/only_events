const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  country_name: { type: String },
  state_name: { type: String },
  city_name: { type: String },
  postal_code: { type: String },
  street_name: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
