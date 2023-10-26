const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
require('dotenv').config();
const bcryptSalt = process.env.BCRYPT_SALT;

const authSchema = new mongoose.Schema({
  logo_url:{ type:String, default: `https://res.cloudinary.com/dhkyslgft/image/upload/v1696606612/assets/splash_logo_farhpc.png` },
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

const User = mongoose.model('User', authSchema);

module.exports = User;