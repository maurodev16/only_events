const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
require('dotenv').config();
const bcryptSalt = process.env.BCRYPT_SALT;

const authSchema = new mongoose.Schema({
  logo_url: { type: String, default: `https://res.cloudinary.com/dhkyslgft/image/upload/v1696606612/assets/splash_logo_farhpc.png` },
  first_name: { type: String, required: true, },
  last_name: { type: String, required: true, },
  company_name: { type: String, default:"",},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['visitor', 'normal', 'company'], default: 'visitor' },
  company_type: { type: String, enum: ['unknown', 'promoter', 'bar', 'club'], default: 'unknown' },
},
  {
    timestamps: true,
  },
);

/// PRE SAVE
authSchema.pre("save", function (next) {
  try {
    if (this.isModified("password")) {
      const hash = bcrypt.hashSync(this.password, Number(bcryptSalt));
      this.password = hash;
    }

    next();
  } catch (error) {
    next(error);
  }
});


const User = mongoose.model('User', authSchema);

module.exports = User;