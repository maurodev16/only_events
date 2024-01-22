import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Followers from './Followers.js';
import dotenv from "dotenv";
dotenv.config();
const bcryptSalt = process.env.BCRYPT_SALT;

const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true, },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String },
  passwordChangedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetTokenExpires: { type: Date },
},
  {
    timestamps: true,
  },
);

/// PRE SAVE
userSchema.pre("save", function (next) {
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

const User = mongoose.model('User', userSchema);

export default User;