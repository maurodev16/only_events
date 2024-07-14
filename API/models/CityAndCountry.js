import mongoose from "mongoose";

const cityAndCountrySchema = new mongoose.Schema({
  country_name: { type: String },
  city_name: { type: String },
});

const CityAndCountry = mongoose.model('CityAndCountry', cityAndCountrySchema);

export default CityAndCountry;
