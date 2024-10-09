import dotenv from "dotenv";
import User from "../models/UserModel/User.js";
import Bar from "../models/BarModel/BarModel.js";
import Club from "../models/ClubModel/ClubModel.js";
import Promoter from "../models/PromoterModel/PromoterModel.js";
dotenv.config();


// Rota para buscar dados do usuário logado com base no token JWT
export const currentUserRouter= async (req, res) => {
  try {
    // O middleware checkAccessToken adiciona o ID do usuário no req.user
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
};

export const upgradeToCompanyRouter= async (req, res) => {
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
};

export const getAllUserRouter = async (req, res) => {
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
};

export const getUserByIdRouter= async (req, res) => {
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
};


export const editUserByIdRouter=async (req, res) => {
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
};

