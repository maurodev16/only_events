import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoosePaginate from "mongoose-paginate-v2";
import followers from "../FollowModel/Followers.js";
import dotenv from "dotenv";

dotenv.config();
const bcryptSalt = Number(process.env.BCRYPT_SALT);

const userSchema = new mongoose.Schema(
  {
    nickname: {
      type: String,
      required: [true, "Nickname is required"],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, "Email is required"],
      unique: true,
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, // Permite que o campo seja opcional
      match: [/^\+?[1-9]\d{1,14}$/, "Phone number is invalid"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationEmailToken: String,
    verificationEmailTokenExpires: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    role: {
      type: String,
      enum: ["user", "company", "admin"],
      default: "user",
    },
    companyInfo: {
      logoUrl: {
        type: String,
        default:
          "https://res.cloudinary.com/dhkyslgft/image/upload/v1704488249/logo_no_avaliable_fehssq.png",
      },
      companyName: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
        match: [/^\d{5}-\d{3}$/, "Postal code is invalid"],
      },
      streetName: {
        type: String,
        trim: true,
      },
      number: {
        type: String,
        trim: true,
      },
      cityName: {
        type: String,
        trim: true,
      },
      companyType: {
        type: String,
        enum: ["promoter", "bar", "club"],
        trim: true,
      },
      followers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "followers",
        },
      ],
      followersCount: {
        type: Number,
        default: 0,
      },
      isOnline: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Adicionar plugin de paginação ao esquema
userSchema.plugin(mongoosePaginate);

// Hash de senha antes de salvar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const hash = await bcrypt.hash(this.password, bcryptSalt);
    this.password = hash;
    this.passwordChangedAt = Date.now() - 1000; // Garanta que o token JWT será emitido após a mudança de senha
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senhas
userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;