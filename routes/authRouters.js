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
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'All fields are mandatory.' });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction(); // Iniciar transação

    // Verifica se o email do User já está em uso
    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      return res.status(422).json({ error: 'EmailAlreadyExistsException' });
    }

    const user = new User({
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: password,
    });

    const newCreatedUser = await user.save({ session });
    console.log(newCreatedUser);

    if (!newCreatedUser) {
      return res.status(500).json({ error: 'ErroSignupOnDatabaseException' });
    }

    await session.commitTransaction(); // Confirm Transaction
    session.endSession(); // End seccion

    return res.status(201).json({ newCreatedUser });
  } catch (error) {
    await session.abortTransaction(); // Rollback da Transaction
    session.endSession(); // End Section
    console.error(`Erro ao registrar: ${error}`);
    return res.status(500).json({ error: 'Error registering user.' });
  }
});

/// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate User data
    if (!email) {
      console.log(email);

      return res.status(401).json({ error: "Please provide a valid email!" });
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
      return res.status(404).json({ error: "No User found with this email!" });
    }

    if (!password) {
      return res.status(422).json({ error: "Password is required!" });
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(422).json({ error: "Incorrect password" });
    }

    // Generate token
    const token = jwt.sign({ _id: user._id, }, AUTH_SECRET_KEY, { expiresIn: "1h", });

    // Return the authentication token, ID, and email
    return res
      .status(200).json({ token });
  } catch (error) {
    console.error(`Erro no login: ${error}`);
    res.status(500).json({ error: 'Erro no login' });
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
