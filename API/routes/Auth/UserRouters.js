import dotenv from "dotenv";
import { Router } from "express";
import User from "../../models/UserModel/User.js";
import bcrypt from "bcrypt";
import checkToken from "../../middleware/checkToken.js";
import checkRequiredFields from "../../middleware/checkRequiredFields.js";
import mongoose from "mongoose";
import signInFromJwt from "../../controllers/AuthController.js";
dotenv.config();
const router = Router();

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
// Expressão regular melhorada para validação de e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Função de validação de e-mail
const validateEmail = (email) => {
  return emailRegex.test(email);
};

/// Signup
router.post(
  "/signup",
  checkRequiredFields(["nickname", "email", "password"]),
  async (req, res) => {
    const { nickname, email, password, phone, role, companyInfo } = req.body;

    try {
      await handleSession(async (session) => {
        // Verifica se o email do User já está em uso
        const emailExists = await User.findOne({ email: email });
        if (emailExists) {
          return res.status(422).json({ error: "EmailAlreadyExistsException" });
        }

        const newUser = new User({
          nickname,
          email,
          password,
          phone,
          role,
          companyInfo,
        });

        const newCreatedUser = await newUser.save({ session });

        if (!newCreatedUser) {
          throw new Error("ErroSignupOnDatabaseException");
        }

        // Converte para objeto e remove o campo password
        const userObject = newCreatedUser.toObject();
        delete userObject.password;

        return res.status(201).json({ newUser: userObject });
      });
    } catch (error) {
      console.error(`Erro ao registrar: ${error}`);
      return res
        .status(500)
        .json({ error: error.message || "Error registering user" });
    }
  }
);

  /// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate User data
  if (!email) {
    return res.status(401).json({ error: "Please provide a valid email!" });
  }

  // Verifica se o e-mail é válido
  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format!" });
  }
  try {
    // Encontra o usuário pelo e-mail
    const user = await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });

    if (!user) {
      return res.status(404).json({ error: "No user found with this email!" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(422).json({ error: "Incorrect password" });
    }

    // Generate token
    const token = signInFromJwt(user._id);

    // Create response object without password
    const userResponse = {
      _id: user._id,
      nickname: user.nickname,
      email: user.email,
      isCompany: user.isCompany, // Inclui o status de empresa na resposta
      token: token,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Return the authentication token, ID, and email
    return res.status(200).json({ login: userResponse });
  } catch (error) {
    console.error(`Erro no login: ${error}`);
    res.status(500).json({ error: "Erro no login" });
  }
});

/// Upgrade to Company route
router.put("/upgrade-to-company", checkToken, async (req, res) => {
  const { companyName, companyType, cityName, postalCode, streetName, number } =
    req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "UserNotFoundException" });
    }

    // Update user to company
    user.isCompany = true;
    user.companyName = companyName;
    user.companyType = companyType;
    user.cityName = cityName;
    user.postalCode = postalCode;
    user.streetName = streetName;
    user.number = number;

    // Save changes
    const updatedUser = await user.save();

    return res.status(200).json({ updatedUser });
  } catch (error) {
    console.error(`Erro ao promover usuário para empresa: ${error}`);
    return res
      .status(500)
      .json({ error: "Erro ao promover usuário para empresa" });
  }
});

router.get("/fetch", checkToken, async (req, res) => {
  try {
    const users = await User.find().select("-password");

    if (!users) {
      return res.status(404).send("UserNotFoundException");
    }

    const userdata = users.map((user) => {
      return {
        id: user._id,
        logoUrl: user.logoUrl,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        companyType: user.companyType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });
    res.status(200).send(userdata);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/fetchById/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id, "-password");
    if (!user) {
      return res.status(404).send("UserNotFoundException");
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.put("/editUser/:id", checkToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = req.body;
    // Verificar se o user existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("UserNotFoundException");
    }

    // Atualizar os dados do user
    user.nickname = userData.nickname;
    user.password = userData.password;
    user.gender = userData.gender;
    user.interest = userData.interest;
    user.streetName = userData.streetName;
    user.hauseNumber = userData.hauseNumber;
    user.phone = userData.phone;
    user.logoUrl = userData.logoUrl;
    user.updatedAt = Date.now();

    // Salvar as alterações no banco de dados
    const updateduser = await user.save();

    res.status(200).json({ updateduser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/edituser/:id", checkToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = req.body;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!userData) {
      return res.status(404).send("UserNotFoundException");
    }

    // Check if the logged-in user has permission to edit the user
    if (user._id.toString() !== req.user._id) {
      return res.status(403).send("UnauthorizedAccessException");
    }

    // Update the user data
    // Atualizar os dados do user
    user.nickname = userData.nickname;
    user.password = userData.password;
    user.dateOfBirth = userData.dateOfBirth;
    user.gender = userData.gender;
    user.interest = userData.interest;
    user.hauseNumber = userData.hauseNumber;
    user.streetName = userData.streetName;
    user.phone = userData.phone;
    user.logoUrl = userData.logoUrl;
    user.updatedAt = Date.now();

    // Save the updated user data to the database
    const updatedUser = await user.save();

    res.status(200).json({ updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
