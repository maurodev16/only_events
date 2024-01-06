const mongoose = require("mongoose");
const User = require('./User');
const IMAGE_AVATAR_DEFAULT_TOKEN = process.env.IMAGE_AVATAR_DEFAULT_TOKEN;
const logoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  logo_url: { type: String },

});

const Logo = mongoose.model('Logo', logoSchema);

module.exports = Logo;