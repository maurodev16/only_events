require("dotenv").config();
const router = require("express").Router();
const User = require("../models/Auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const checkToken = require("../middleware/checkToken");
const mongoose = require("mongoose");
const sendEmail = require("../services/Emails/sendEmail");
const Token = require("../models/Token");
const BCRYPT_SALT = process.env.BCRYPT_SALT;
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;

/// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password, role, company_type, logo_url } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction(); // Iniciar transação

    // // Verifica se a cidade já existe no banco de dados
    // let cityName = await City.findOne({ cityName });

    // Verifica se o nome do User já está em uso
    const nameExists = await User.findOne({ name: name });
    if (nameExists) {
      return res.status(422).send("NameAlreadyExistsException");
    }

    // Verifica se o email do User já está em uso
    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      return res.status(422).send("EmailAlreadyExistsException");
    }

    const user = new User({
      name: name,
      email: email,
      password: password,
      role: company_type ? "company" : "private",
      company_type: company_type,
      logo_url: logo_url,
    });

    const newCreatedUser = await user.save({ session });
    console.log(newCreatedUser);

    if (!newCreatedUser) {
      return Error("ErroSignupOnDatabaseException");
    }

    await session.commitTransaction(); // Confirm Transaction
    session.endSession(); // End seccion

    return res.status(201).json({ newCreatedUser });
  } catch (error) {
    await session.abortTransaction(); // Rollback da Transaction
    session.endSession(); // End Section
    console.log(`Erro to Sign-up: ${error}`);
    return res.status(500).send("ErroSignupException");
  }
});

/// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate User data
    if (!email) {
      console.log(email);

      return res.status(422).send("Please provide a valid email!");
    }

    let user;

    // Check if Email is an email using regular expression
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (isEmail) {
      user = await User.findOne({ email: email });
      console.log(email);
    } else {
      // Find user using email
      user = await User.findOne({
        email: { $regex: `^${email}`, $options: "i" },
      });
      console.log(user);
    }

    if (!user) {
      return res.status(404).send("No User found with this email!");
    }

    if (!password) {
      return res.status(422).json("Password is required!");
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(422).json("Incorrect password");
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, company_type: user.company_type, role: user.role },
      AUTH_SECRET_KEY
    );

    // Return the authentication token, ID, and email
    return res
      .status(200)
      .json({
        name: user.name,
        userId: user._id,
        email: user.email,
        company_type: user.company_type,
        role: user.role,
        token,
        logo_url: user.logo_url,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).send("An error occurred during login.");
  }
});

router.post("/requestPasswordReset", async (req, res) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Email does not exist");

    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();

    let resetToken = crypto.randomBytes(32).toString("hex");
    const hashToken = await bcrypt.hash(resetToken, Number(BCRYPT_SALT));

    await new Token({
      userId: user,
      token: hashToken,
      createdAt: Date.now(),
    }).save();

    const link = `${CLIENT_URL}/passwordReset?token=${resetToken}&email=${email}`;

    sendEmail(
      user.email,
      "Password Reset Request",
      {
        name: user.name,
        link: link,
      },
      "./template/requestResetPassword.handlebars"
    );
    return { link };
  }
});

// router.post('/resetPassword', async (req, res) => {
//   const {userId, token, newPassword } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ msg: "Usuário não encontrado" });
//     }

//     const savedToken = await Token.findOne({ userId: user._id });

//     if (!savedToken) {
//       return res.status(401).json({ msg: "Token inválido ou expirado" });
//     }

//     const isTokenValid = await bcrypt.compare(token, savedToken.token);

//     if (!isTokenValid) {
//       return res.status(401).json({ msg: "Token inválido" });
//     }

//     // Hash da nova senha antes de salvar
//     const hashedNewPassword = await bcrypt.hash(newPassword, Number(BCRYPT_SALT));

//     // Atualizar a senha e remover o token
//  await User.updateOne(
//   {_id: user._id},
//   {$set: { password: hashedNewPassword }},
//   { new: true },
//    );

//    const user = await User.findById({ _id: userId})

//    sendEmail
//     await user.save();
//     await savedToken.delete();

//     res.status(200).json({ msg: "Senha redefinida com sucesso" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Erro ao redefinir a senha" });
//   }
// });

module.exports = router;
