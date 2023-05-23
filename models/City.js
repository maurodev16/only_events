const mongoose = require("mongoose");

const citySchema = mongoose.Schema({
    cityName: { type: String, required: true },
    capital: { type: String }
});

const City = mongoose.model('City', citySchema);

module.exports = City;