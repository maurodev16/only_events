const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
require('dotenv').config();
const bcryptSalt = process.env.BCRYPT_SALT;


const authSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['private', 'company'], required: true },
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