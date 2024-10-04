import dotenv from "dotenv";
import { Router } from "express";
import User from "../../models/UserModel/User.js";
import Bar from "../../models/BarModel/BarModel.js";
import Club from "../../models/ClubModel/ClubModel.js";
import Promoter from "../../models/PromoterModel/PromoterModel.js";
import bcrypt from "bcrypt";
import checkToken from "../../middleware/checkToken.js";
import checkRequiredFields from "../../middleware/checkRequiredFields.js";
import mongoose from "mongoose";
import signInFromJwt from "../../middleware/generateToken.js";
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

        // Adicionar '@' ao nickname se não estiver presente
        let formattedNickname = nickname;
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

        // Criação de um novo usuário
        const newUser = new User({
          nickname: formattedNickname,
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


// Rota de Login
router.post("/login", async (req, res) => {
  const { emailORnickname, password } = req.body;

  if (!emailORnickname || !password) {
    return res.status(401).json({
      error: "Please provide a valid email or nickname and password!",
    });
  }

  const inputType = validateEmailOrNickname(emailORnickname);
  if (!inputType) {
    return res.status(400).json({ error: "Invalid email or nickname format!" });
  }

  try {
    let user;
    if (inputType === "email") {
      user = await User.findOne({
        email: { $regex: `^${emailORnickname}$`, $options: "i" },
      });
    } else if (inputType === "nickname") {
      let formattedNickname = emailORnickname.startsWith("@")
        ? emailORnickname.substring(1)
        : emailORnickname;

      user = await User.findOne({
        nickname: { $regex: `^@?${formattedNickname}$`, $options: "i" },
      });
    }

    if (!user) {
      return res.status(404).json({ error: `No user found!` });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password!" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ error: "Email not verified!" });
    }

    const token = signInFromJwt(user._id);

    // Retorne apenas o token, sem os dados do usuário
    return res.status(200).json({ token });
  } catch (error) {
    console.error(`Erro no login: ${error}`);
    res.status(500).json({ error: "Login Error" });
  }
});

// Rota para buscar dados do usuário logado com base no token JWT
router.get("/me", checkToken, async (req, res) => {
  try {
    // O middleware checkToken adiciona o ID do usuário no req.user
    const userId = req.auth._id; // O ID do usuário obtido a partir do token

    // Busca o usuário pelo ID no banco de dados, sem retornar o campo de senha
    const user = await User.findById(userId, "-password");

    if (!user) {
      return res.status(404).send("UserNotFoundException");
    }

    // Retorna os dados do usuário
    res.status(200).json({ user });
  } catch (error) {
    // Caso ocorra algum erro no servidor
    res.status(500).json({ error: error.message });
  }
});

router.patch("/upgrade-to-company", checkToken, async (req, res) => {
  try {
    const userId = req.auth._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === "company") {
      return res.status(400).json({ error: "User is already a company" });
    }

    const {
      companyName,
      postalCode,
      streetName,
      number,
      cityName,
      companyType,
    } = req.body;

    // Verificar se companyType é válido antes de continuar
    const validCompanyTypes = ["promoter", "club", "bar"];
    if (!validCompanyTypes.includes(companyType)) {
      return res.status(400).json({ error: "Invalid company type" });
    }

    // Verificar se já existe uma empresa com o mesmo endereço
    const existingCompany = await User.findOne({
      role: "company",
      "companyInfo.postalCode": postalCode,
      "companyInfo.streetName": streetName,
      "companyInfo.number": number,
      "companyInfo.cityName": cityName,
    });

    if (existingCompany) {
      return res.status(400).json({
        error: "A company with the exact same address already exists",
      });
    }

    // Construir o endereço completo concatenando os campos de endereço
    const fullAddress = `${streetName}, ${number}, ${cityName} - ${postalCode}`;

    // Atualizar o perfil para 'company'
    user.role = "company";
    user.companyInfo = {
      logoUrl:
        "https://res.cloudinary.com/dhkyslgft/image/upload/v1704488249/logo_no_avaliable_fehssq.png",
      companyName: companyName || "",
      address: fullAddress, // Endereço completo concatenado
      postalCode: postalCode || "",
      streetName: streetName || "",
      number: number || "",
      cityName: cityName || "",
      companyType: companyType, // companyType agora não é vazio
    };

    // Salvar as alterações no banco de dados
    await user.save();

    // Determinar qual modelo usar com base no tipo de empresa
    let specificModel;

    if (companyType === "promoter") {
      specificModel = Promoter;
    } else if (companyType === "club") {
      specificModel = Club;
    } else if (companyType === "bar") {
      specificModel = Bar;
    }

    // Criar ou atualizar o documento específico para o tipo de empresa
    const specificCompany = await specificModel.findOneAndUpdate(
      { userId: user._id },
      {
        ...req.body, // Dados específicos do tipo de empresa vindos do corpo da requisição
        userId: user._id, // Associe o documento da empresa ao usuário
      },
      { upsert: true, new: true, strict: true }
    );

    return res.status(200).json({
      message: "User upgraded to company successfully",
      user,
      updatedToCompany: specificCompany,
    });
  } catch (error) {
    console.error(`Error upgrading user to company: ${error}`);
    return res.status(500).json({ error: "Error upgrading user to company" });
  }
});

router.get("/fetch", checkToken, async (req, res) => {
  try {
    const users = await User.find().select("-password");

    if (!users) {
      return res.status(404).json({ error: "UserNotFoundException" });
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

router.get("/fetch-by-Id/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id, "-password");
    if (!user) {
      return res.status(404).json({ error: "UserNotFoundException" });
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
      return res.status(404).json({ error: "UserNotFoundException" });
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
      return res.status(404).json({ error: "UserNotFoundException" });
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
