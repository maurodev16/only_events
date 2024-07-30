import mongoose from "mongoose";
import bcrypt from "bcrypt";
import mongoosePaginate from "mongoose-paginate-v2";
import Details from "./Details/Details.js";
import User from "../User.js";
import dotenv from "dotenv";
dotenv.config();
const bcryptSalt = process.env.BCRYPT_SALT;

const establishmentSchema = new mongoose.Schema(
  {
    // Dados iniciais obrigatorios para o primeiro registro
    establishmentName: { type: String, required: true },
    email: { type: String, lowercase: true, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    companyType: {
      type: String,
      enum: ["promoter", "bar", "club"],
      required: true,
    },
    cityName: { type: String },
    postalCode: { type: String },
    streetName: { type: String },
    number: { type: String },
    details: { type: mongoose.Schema.Types.ObjectId, ref: "Details" }, // Referência aos detalhes específicos
    ///

    isEmailVerified: { type: Boolean, default: false }, // Campo para rastrear se o e-mail foi verificado
    verificationEmailToken: { type: String },
    verificationEmailTokenExpires: { type: Date },

    ///
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetTokenExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Adicione o plugin de paginação ao seu esquema
establishmentSchema.plugin(mongoosePaginate);

/// PRE SAVE
establishmentSchema.pre("save", function (next) {
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

const Establishment = mongoose.model("Establishment", establishmentSchema);

export default Establishment;
