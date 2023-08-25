require('dotenv').config();
const router = require('express').Router();
const Auth = require('../models/Auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const checkToken = require('../middleware/checkToken');
const mongoose = require('mongoose');
const sendEmail = require('../services/Emails/sendEmail');
const Token = require('../models/Token');
const BCRYPT_SALT = process.env.BCRYPT_SALT;
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;


/// Signup
router.post('/signup', async (req, res) => {
  const { email, password, role, is_company } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction(); // Iniciar transação

    // // Verifica se a cidade já existe no banco de dados
    // let cityName = await City.findOne({ cityName });


    // Verifica se o email do User já está em uso
    const emailExists = await Auth.findOne({ email: email });
    if (emailExists) {
      return res.status(422).send("EmailAlreadyExistsException");
     
    }
    const newUser = new Auth({ email: email, password: password, role: is_company ? 'company' : 'private', is_company: is_company });

    const created = await newUser.save({ session });
    console.log(created);

    if (!created) {
     return  Error('ErroSignupOnDatabaseException');
    }

    await session.commitTransaction(); // Confirm Transaction
    session.endSession(); // End seccion

    return res.status(201).json({
      msg: 'Sign-Up successfully',
      user: {
        email: newUser.email,
        role: newUser.role,
        is_company: newUser.is_company,
      }
    });

  } catch (error) {
    await session.abortTransaction(); // Rollback da Transaction
    session.endSession(); // End Section
    console.log(`Erro to Sign-up: ${error}`);
   return res.status(500).send('ErroSignupException');
  }
});

/// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate User data
    if (!email) {
      console.log(email);

     return res.status(422).json({ msg: "Please provide a valid email!" });
     
    }

    let user;

    // Check if Email is an email using regular expression
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (isEmail) {
      user = await Auth.findOne({ email: email });
      console.log(email);

    } else {
      // Find user using email
      user = await Auth.findOne({ email: { $regex: `^${email}`, $options: 'i' } });
      console.log(user);
    }

    if (!user) {
        return res.status(404).json({ msg: "No User found with this email!" });
    }

    if (!password) {
   return  res.status(422).json({ msg: "Password is required!" });
      
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
     return  res.status(422).json({ msg: 'Incorrect password' });
    
    }

    // Generate token
    const token = jwt.sign({ userId: user._id, is_company: user.is_company, role: user.role, }, AUTH_SECRET_KEY);

    // Return the authentication token, ID, and email
  return  res.status(200).json({user: { token, userId: user._id, email: user.email, is_company: user.is_company, role: user.role } });
  } catch (error) {
    console.log(error);
   return res.status(500).json({ msg: "An error occurred during login.",error});
  }
});


router.post('/requestPasswordReset', async (req, res,) => {
  const user = await Auth.findOne({ email });
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
  };
});

// router.post('/resetPassword', async (req, res) => {
//   const {userId, token, newPassword } = req.body;

//   try {
//     const user = await Auth.findOne({ email });

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
//  await Auth.updateOne(
//   {_id: user._id},
//   {$set: { password: hashedNewPassword }},
//   { new: true },
//    );

//    const user = await Auth.findById({ _id: userId})

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
