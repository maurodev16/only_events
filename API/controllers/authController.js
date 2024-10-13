import User from "../models/UserModel/User.js";
import dotenv from "dotenv";
import crypto from "crypto"; // Importe o módulo 'crypto' para usar a função de hash
import generateResetToken from "../services/generateResetPasswordToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailerConfig from "../services/Emails/nodemailerConfig.js";
import generateToken from "../middleware/generateToken.js";
import { sendLinkResetPasswordTemplate } from "../../views/resetPasswordTemplates/sendLinkResetPasswordTemplate.js";
import { resetPasswordFormTemplate } from "../../views/resetPasswordTemplates/resetPasswordFormTemplate.js";
import mongoose from "mongoose";
import { emailVerifySuccess } from "../../views/emailVerificationTemplates/email_verification_success.js";
import { emailVerificationError } from "../../views/emailVerificationTemplates/email_verification_error.js";
import { sendEmailVerificationLink } from "../../views/emailVerificationTemplates/send_email_verification_link.js";
dotenv.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const bcryptSalt = process.env.BCRYPT_SALT;

///- Router to send reset link to user email
export const sendResetLinkRouter = async (req, res) => {
  const { email } = req.body;

  try {
    // Verifica se o e-mail é válido
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmail) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address!" });
    }

    // Encontra o usuário pelo e-mail
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No user found with this email!" });
    }

    // Gera e salva um token de redefinição de senha
    const resetToken = generateResetToken(user);
    if (!resetToken) {
      return res
        .status(500)
        .json({ error: "Failed to generate password reset token." });
    }

    // Constrói o link de redefinição
    const resetLink = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/reset-password-form/${resetToken}`;
    console.log("Reset Link:", resetLink);

    // Utiliza o template de e-mail
    const htmlContent = sendLinkResetPasswordTemplate(resetLink);
    await nodemailerConfig(
      email,
      "Solicitação de Redefinição de Senha",
      htmlContent
    );

    // Retorna mensagem de sucesso
    return res.status(200).json({
      msg: "Password reset link has been successfully sent to your email",
    });
  } catch (error) {
    console.error(`Error sending reset link: ${error}`);
    res.status(500).json({
      error:
        "There was an error sending the password reset email. Please try again later.",
    });
  }
};

// Função para renderizar o formulário de redefinição de senha
export const resetPasswordFormRouter = (req, res) => {
  const token = req.params.token; // Acessa o token corretamente
  const formHtml = resetPasswordFormTemplate(token); // Gera o HTML do formulário com o token
  res.send(formHtml); // Envia o HTML como resposta
};

// Rota para redefinir a senha
export const resetPasswordRouter = async (req, res) => {
  try {
    // Verifica se o token é válido e não expirou
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: "Token is invalid or has expired!" });
    }

    // Redefine a senha do usuário
    user.password = req.body.newPassword; // Altere isso para usar newPassword
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();
    console.log(user.password);
    await user.save();

    // Retorna resposta de sucesso
    return res
      .status(200)
      .json({ message: "Password has been reset successfully!" });
  } catch (error) {
    console.error(`Error resetting password: ${error}`);
    return res.status(500).json({
      error:
        "There was an error resetting your password. Please try again later.",
    });
  }
};

const handleSession = async (callback) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await callback(session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const refreshTokenRouter = async (req, res) => {
  try {
    // O refresh token já foi verificado no middleware `checkRefreshToken`
    const refreshToken = req.headers["authorization"].split(" ")[1]; // Obtém o refresh token do cabeçalho

    // Decodifica o refresh token para obter o ID do usuário
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(403).json({
            error: "Invalid or Expired Refresh Token. Please log in again.",
          });
        }

        // Procura o usuário no banco de dados
        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(404).json({ error: "User not found!" });
        }

        // Gera um novo access token
        const accessToken = jwt.sign(
          { id: user._id },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
          }
        );

        // Retorna o novo access token para o frontend
        return res.status(200).json({
          accessToken,
        });
      }
    );
  } catch (error) {
    console.error(`Error on refreshing token: ${error}`);
    return res
      .status(500)
      .json({ error: "An error occurred while refreshing the token." });
  }
};

export const signupRouter = async (req, res) => {
  const { nickname, email, password, phone, role, companyInfo } = req.body;

  try {
    await handleSession(async (session) => {
      // Verifica se o email do User já está em uso
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(422).json({ error: "EmailAlreadyExistsException" });
      }

      // Adicionar '@' ao nickname se não estiver presente
      let formattedNickname = nickname;

      // Substitui espaços por underline e converte para minúsculas
      formattedNickname = formattedNickname.replace(/\s+/g, "_").toLowerCase();

      // Verifica se começa com "@" e, se não começar, adiciona "@"
      if (!formattedNickname.startsWith("@")) {
        formattedNickname = `@${formattedNickname}`;
      }

      // Verifica se o nickname já está em uso
      const nicknameExists = await User.findOne({
        nickname: formattedNickname,
      });
      if (nicknameExists) {
        return res
          .status(422)
          .json({ error: "NicknameAlreadyExistsException" });
      }
      // Geração do token de verificação de e-mail
      const verificationEmailToken = crypto.randomBytes(32).toString("hex");
      const verificationEmailTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // Expira em 24 horas

      // Criação de um novo usuário
      const newUser = new User({
        nickname: formattedNickname,
        email,
        password,
        phone,
        role,
        companyInfo,
        verificationEmailToken,
        verificationEmailTokenExpires,
      });

      const newCreatedUser = await newUser.save({ session });

      if (!newCreatedUser) {
        throw new Error("ErroSignupOnDatabaseException");
      }

      // Converte para objeto e remove o campo password
      const userObject = newCreatedUser.toObject();
      delete userObject.password;

      // Cria o link de verificação (você pode ajustar a URL)
      const verificationLink = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/verify-email/${verificationEmailToken}`;
      // Conteúdo do e-mail

    // Gerar o conteúdo do e-mail usando o template
    const emailContent = sendEmailVerificationLink(nickname, verificationLink);
      // Envia o e-mail de verificação
      const emailResponse = await nodemailerConfig(
        email,
        "Email Verification",
        emailContent
      );

      if (!emailResponse.success) {
        return res.status(500).json({ error: "FailedToSendVerificationEmail" });
      }
      return res.status(201).json({
        message: "User created successfully. Please verify your email.",
        newUser: userObject,
      });
    });
  } catch (error) {
    console.error(`Error registering: ${error}`);
    return res
      .status(500)
      .json({ error: error.message || "Error registering user" });
  }
};

// Expressão regular para validação de e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Função para verificar se é um e-mail ou nickname
const validateEmailOrNickname = (input) => {
  if (emailRegex.test(input)) {
    return "email";
  } else if (input.trim().length > 0) {
    return "nickname";
  } else {
    return null; // Se não for nem um e-mail válido nem um nickname válido
  }
};

export const verifyEmailRouter = async (req, res, next) => {
  try {
    // Extrair o token da URL
    const token = req.params.token;

    // Encontrar o User com base no token de verificação fornecido
    const user = await User.findOne({
      verificationEmailToken: token,
      verificationEmailTokenExpires: { $gt: Date.now() },
    });
    const erroHtml = emailVerificationError();
    // Verificar se o user foi encontrado
    if (!user) {
      // Se o user não for encontrado ou o token expirar, enviar erro 401
      return res.status(401).send(erroHtml);
    }

    // Marcar o e-mail como verificado e limpar o token de verificação
    user.isEmailVerified = true;
    user.verificationEmailToken = undefined;
    user.verificationEmailTokenExpires = undefined;
    await user.save();
    // Gera o HTML da página de confirmação
    const successHtml = emailVerifySuccess();

    // Retornar sucesso e o novo token
    return res.status(200).send(successHtml); // Envia o HTML como resposta
  } catch (error) {
    // Se ocorrer algum erro durante o processo, retorne um erro 500
    console.error(`Error verifying email: ${error}`);
    res
      .status(500)
      .json({ error: "Error verifying email. Please try again later." });
  }
};

// Rota de Login
export const loginRouter = async (req, res) => {
  const { emailORnickname, password } = req.body;

  // Verifica se ambos os campos foram fornecidos
  if (!emailORnickname || !password) {
    return res.status(401).json({
      error: "Please provide a valid email or nickname and password!",
    });
  }

  // Verifica se o input é um email ou nickname
  const inputType = validateEmailOrNickname(emailORnickname);
  if (!inputType) {
    return res.status(400).json({ error: "Invalid email or nickname format!" });
  }

  try {
    let user;

    // Se for email, pesquisa pelo campo de email
    if (inputType === "email") {
      user = await User.findOne({
        email: { $regex: `^${emailORnickname}$`, $options: "i" },
      });
    }
    // Se for nickname, pesquisa pelo campo de nickname
    else if (inputType === "nickname") {
      let formattedNickname = emailORnickname.startsWith("@")
        ? emailORnickname.substring(1)
        : emailORnickname;

      user = await User.findOne({
        nickname: { $regex: `^@?${formattedNickname}$`, $options: "i" },
      });
    }

    // Se o usuário não for encontrado, retorna um erro
    if (!user) {
      return res.status(404).json({ error: `No user found!` });
    }

    // Verifica se a senha fornecida é válida
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password!" });
    }

    // Verifica se o e-mail foi verificado
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: "Email not verified!" });
    }

    // Gere o access token e o refresh token usando a função importada
    const { accessToken, refreshToken } = await generateToken(user._id);

    // Retorne ambos os tokens ao cliente
    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error(`Erro no login: ${error}`);
    res.status(500).json({ error: "Login Error" });
  }
};
