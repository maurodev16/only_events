const mongoose = require("mongoose");
const Participant = require('./Participant');
const Event = require('./Event');
const City = require('./City');


const promoterSchema = new mongoose.Schema({
  full_name: { type: String, required: true }, 
  company: { type: String,required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  logo_url: { type: String },
  phone:{type: String},
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, // Referência para o modelo City
  street_name: { type: String },
  street_number: { type: String },
  post_code: { type: String },
});

const Promoter = mongoose.model('Promoter', promoterSchema);

module.exports = Promoter;