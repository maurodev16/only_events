import mongoose from "mongoose";

const cityAndCountrySchema = new mongoose.Schema({
  countryName: { type: String },
  cityName: { type: String },
});

const CityAndCountry = mongoose.model('CityAndCountry', cityAndCountrySchema);

export default CityAndCountry;
