const mongoose = require("mongoose");
const Participant = require('./Participant');
const Event = require('./Event');
const City = require('./City');


const promoterSchema = new mongoose.Schema({
  logo_url: { type: String, default: `https://firebasestorage.googleapis.com/v0/b/evento-app-5a449.appspot.com/o/default-avatar.png?alt=media&token=${IMAGE_AVATAR_DEFAULT_TOKEN}` },
  full_name: { type: String, required: true }, 
  company: { type: String,required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone:{type: String},
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, // Referência para o modelo City
  street_name: { type: String },
  hause_number: { type: String },
  post_code: { type: String },
  is_company:{type: Boolean, default: true}, 
});

const Promoter = mongoose.model('Promoter', promoterSchema);

module.exports = Promoter;