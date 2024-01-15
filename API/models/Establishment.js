import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import mongoosePaginate from 'mongoose-paginate-v2';
import Followers from './Followers.js';
import dotenv from 'dotenv';
dotenv.config();
const bcryptSalt = process.env.BCRYPT_SALT;

const establishmentSchema = new mongoose.Schema(
  {
    // Dados iniciais obrigatorios para o primeiro registro
    logo_url: { type: String, default: "https://res.cloudinary.com/dhkyslgft/image/upload/v1704488249/logo_no_avaliable_fehssq.png" },
    establishment_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    state_name: { type: String, required: true },
    city_name: { type: String, required: true },
    postal_code: { type: String, required: true },
    street_name: { type: String, required: true },
    number: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    company_type: { type: String, enum: ['promoter', 'bar', 'club', 'kiosk'], required: true, },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Followers' }],
    followers_count: { type: Number, default: 0 },
    password_changed_at: { type: Date },
    password_reset_token: { type: String },
    password_reset_token_expires: { type: Date },
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