const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
require('dotenv').config();
const bcryptSalt = process.env.BCRYPT_SALT;
IMAGE_AVATAR_DEFAULT_TOKEN = process.env.IMAGE_AVATAR_DEFAULT_TOKEN;

const authSchema = new mongoose.Schema({
  id: { type:String },
  logo_url:{ type:String, default: `https://firebasestorage.googleapis.com/v0/b/evento-app-5a449.appspot.com/o/default-avatar.png?alt=media&token=${IMAGE_AVATAR_DEFAULT_TOKEN}` },
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['private', 'company'], required: true},
  is_company: { type: Boolean },
},
  {
    timestamps: true,
  },
);

/// PRE SAVE
authSchema.pre("save", async function (next) {

  if (this.isModified("password")) {
    const hash = await bcrypt.hash(this.password, Number(bcryptSalt));
    this.password = hash;
  }

  next();
});

const Auth = mongoose.model('Auth', authSchema);

module.exports = Auth;