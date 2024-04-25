import mongoose from "mongoose";
import { Router } from "express";
import Establishment from "../../models/Establishment/Establishment.js";
import bcrypt from "bcrypt";
import Details from "../../models/Establishment/Details/Details.js";
import BarDetails from "../../models/Establishment/Details/BarDetail.js"
import ClubDetails from "../../models/Establishment/Details/ClubDetail.js"
import KioskDetails from "../../models/Establishment/Details/KioskDetail.js"
import PromoterDetails from "../../models/Establishment/Details/PromoterDetail.js"
import checkToken from "../../middleware/checkToken.js";
import checkRequiredFields from "../../middleware/checkRequiredFields.js"
import CityAndCountry from "../../models/CityAndCountry.js";
import logoMiddleware from "../../middleware/logoMiddleware.js";
import configureCloudinary from "../../services/Cloudinary/cloudinary_config.js";
import { validationResult } from 'express-validator';
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import signInFromJwt from "../../controllers/AuthController.js";
dotenv.config();
configureCloudinary();
const router = Router();

router.post("/signup-establishment", checkRequiredFields(['establishmentName', 'email', 'password', 'phone', 'companyType']), async (req, res) => {
  try {
    const estabBodyData = await req.body;

    // Check if the email of the Establishment is already in use
    const emailExists = await Establishment.findOne({ email: estabBodyData.email });
    if (emailExists) {
      return res.status(422).json({ error: 'Email already in use.' });
    }

    // Check if the phone of the Establishment is already in use
    const phoneExists = await Establishment.findOne({ phone: estabBodyData.phone });
    if (phoneExists) {
      return res.status(422).json({ error: 'Phone already in use.' });
    }

    // Create an instance of Establishment with the provided data
    const establishment = new Establishment({
      establishmentName: estabBodyData.establishmentName,
      email: estabBodyData.email,
      password: estabBodyData.password,
      phone: estabBodyData.phone,
      companyType: estabBodyData.companyType,
    });

    // Save the establishment to the database
    const newEstablishment = await establishment.save();

    // Create the corresponding details automatically
    let details;
    switch (newEstablishment.companyType) {
      case 'promoter':
        details = await PromoterDetails.create({ establishment: newEstablishment._id });
        break;
      case 'bar':
        details = await BarDetails.create({ establishment: newEstablishment._id });
        break;
      case 'club':
        details = await ClubDetails.create({ establishment: newEstablishment._id });
        break;
      case 'kiosk':
        details = await KioskDetails.create({ establishment: newEstablishment._id });
        break;
      default:
        // If the establishment type is invalid
        return res.status(400).json({ error: "Invalid establishment type." });
    }

    // Associate the created details with the establishment
    newEstablishment.details = details._id;
    await newEstablishment.save();
    const createdEstablishment = await Establishment.findById(newEstablishment._id)
      .select("-password")
      .select('-__v')
      .populate('details');
    // Respond with the created establishment
    console.log("Establishment created successfully:", createdEstablishment); // Add this log
    // Generate token to login the user
    const token = signInFromJwt(newEstablishment._id)
    return res.status(201).json({ establishment: createdEstablishment, token });
  } catch (error) {
    // If an error occurs during the process
    console.error("Error creating Establishment: ", error);
    return res.status(500).json({ error: 'Error creating establishment, please try again later!' });
  }
});

// Login route
router.post("/login-establishment", async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if the email is provided
    if (!email) {
      return res.status(401).json({ error: "Please provide a valid email!" });
    }

    // Check if password is provided
    if (!password) {
      return res.status(422).json({ error: "Password is required!" });
    }

    // Find establishment by email and exclude password field
    const establishment = await Establishment.findOne({ email })


    if (!establishment) {
      return res.status(404).json({ error: "No establishment found with this email!" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, establishment.password);

    if (!isPasswordValid) {
      return res.status(422).json({ error: "Incorrect password" });
    }

    // Generate token to login the user
    const token = signInFromJwt(establishment._id)
    // Return establishment details along with token
    return res.status(200).json({ id: establishment._id, token: token });
  } catch (error) {
    console.error(`Error logging in: ${error}`);
    res.status(500).json({ error: 'Error logging in' });
  }
});


/// -- Router fetch-establishment-type where u can filter from Comapany type and get pagination
router.get("/fetch-establishment-type", async (req, res) => {
  try {
    const { cityName, companyType, page = 1, limit = 10 } = req.query;
    let query = {}; // Start the query as empty query

    // Se o parâmetro companyType estiver presente na solicitação, adicione-o à consulta
    if (companyType) {
      query.companyType = companyType;
    }
    // Se o parâmetro companyType estiver presente na solicitação, adicione-o à consulta
    if (cityName) {
      query.cityName = cityName;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    // Execute a consulta
    const establishments = await Establishment.paginate(query, options, {
      sort: { createdAt: 1 }
    });

    if (establishments.docs.length === 0) {
      return res.status(404).send("Establishments not found for the specified company type");
    }

    // Mapeie os estabelecimentos para remover o campo 'password'
    const sanitizedEstablishments = establishments.docs.map(establishment => {
      const { password, ...rest } = establishment.toObject();
      return rest;
    });

    return res.status(200).json({
      establishments: sanitizedEstablishments,
      total: establishments.totalDocs,
      totalPages: establishments.totalPages,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rota para buscar um estabelecimento específico e popular os detalhes
router.get('/get-establishment-by-user-id/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar o estabelecimento pelo ID e popular os detalhes
    const establishment = await Establishment.findById(id).populate('details').select('-password');

    if (!establishment) {
      return res.status(404).json({ error: "Estabelecimento não encontrado." });
    }

    res.status(200).json({ establishment });
  } catch (error) {
    console.error("Erro ao buscar estabelecimento:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});


//fetch-all-establishment
router.get("/fetch-all-establishment", async (req, res) => {
  try {
    const establishments = await Establishment.find({})
      .sort({ createdAt: 1 })


    if (establishments.length === 0) {
      return res.status(404).json({ error: "Establishment not found" });
    }

    return res.status(200).json(establishments);
  } catch (error) {
    res.status(500).json(error.message);
  }
});


// Exemplo de endpoint GET
router.get("/get-details/:establishmentsId", async (req, res) => {
  try {
    const establishmentsId = req.params.establishmentsId;

    // Encontrar o tipo de estabelecimento
    const establishment = await Establishment.findById(establishmentsId);
    if (!establishment) {
      return res.status(404).json({ error: "Establishment not found." });
    }

    const typeEstablishment = establishment.companyType;

    // Recuperar dados com base no tipo de estabelecimento
    let establishmentDetails;
    switch (typeEstablishment) {
      case 'promoter':
        establishmentDetails = await PromoterDetails.findOne({ establishmentId: establishmentsId });
      case 'bar':
        establishmentDetails = await BarDetails.findOne({ establishmentId: establishmentsId });
        break;
      case 'club':
        establishmentDetails = await ClubDetails.findOne({ establishmentId: establishmentsId });
        break;
      case 'kiosk':
        establishmentDetails = await KioskDetails.findOne({ establishmentId: establishmentsId });
        break;
      default:
        return res.status(400).json({ message: "Invalid establishment type." });
    }

    // Retorna os dados combinados
    const combinedData = {
      _id: establishment._id,
      establishmentName: establishment.establishmentName,
      email: establishment.email,
      phone: establishment.phone,
      companyType: establishment.companyType,
      ///
      establishmentDetails,
    };

    // Retorna os dados combinados
    return res.status(200).json({ combinedData });
  } catch (error) {
    console.error("Error when fetching establishment data:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});





router.get("/fetchEstablishmentByCity/:cityName", async (req, res) => {
  try {
    const cityName = req.params.cityName;

    const establishments = await Establishment.find({ cityName: cityName }).select(
      "-isFeatured"
    );

    if (establishments.length === 0) {
      return res
        .status(404)
        .json({ msg: "No establishments found for this city" });
    }

    res.status(200).json(establishments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/fetchEventIsFeatured/:isFeatured", async (req, res) => {
  try {
    const isFeatured = req.params.isFeatured;

    const establishments = await Establishment.find({ isFeatured: isFeatured })
      .select("-isFeatured")
      .populate("cityId");
    console.log(establishments);

    if (events.length === 0) {
      return res.status(404).json({ error: `No Featured establishments so far` });
    }

    res.status(200).json(establishments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/fetchEstablishmentByOrganizedBy/:organizedBy",
  async (req, res) => {
    try {
      const organizedBy = req.params.organizedBy;

      const establishments = await Establishment.find({
        organizedBy: organizedBy,
      })
        .select("-isFeatured")
        .populate("cityId");

      if (establishments.length === 0) {
        return res.status(404).json({
          error: `${organizedBy} has not organized any establishments so far`,
        });
      }

      res.status(200).json(establishments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  "/fetchEstablishmentsByDateRange/:startDate/:endDate",
  async (req, res) => {
    try {
      const startDate = req.params.startDate;
      const endDate = req.params.endDate;

      const establishments = await Establishment.find({
        start_date: { $gte: startDate },
        end_date: { $lte: endDate },
      }).select("-isFeatured");

      if (establishments.length === 0) {
        return res
          .status(404)
          .json({ msg: "No establishments found within the date range" })
          .populate("cityId");
      }

      res.status(200).json(establishments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
// PATCH route to update establishment details
router.put('/update/:establishmentId/details', async (req, res) => {
  try {
    const establishmentId = req.params.establishmentId;

    // Find the Establishment document by ID
    const establishment = await Establishment.findById(establishmentId);
    if (!establishment) {
      return res.status(404).json({ error: 'Establishment not found' });
    }

    // Get the ID of the establishment details
    const establishmentDetailsId = establishment.details;

    // Find the Details document by ID
    const details = await Details.findById(establishmentDetailsId);

    if (!details) {
      return res.status(404).json({ error: 'Details not found' });
    }

    if (establishmentDetailsId.toString() !== details._id.toString() ) {
      return res.status(404).json({ error: 'Details IDs do not match' });
    }

    // Update establishment details data based on request data
    for (const field in req.body) {
      if (details[field] !== undefined) {
        details[field] = req.body[field];
      }
    }

    // Save the changes
    await details.save();

    res.status(200).json({ details, status: 'success' });
  } catch (error) {
    console.error('Error updating establishment details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch("/edit/:establishmentId", async (req, res) => {
  try {
    const establishmentData = await req.body;
    const establishmentId = req.params.establishmentId;
    // Verificar se o evento existe
    const establishment = await Establishment.findById(establishmentId)
      .select("-isFeatured")
      .populate("cityId");
    if (!establishment) {
      return res.status(404).json({ error: "Establishment not found" });
    }

    // Verificar se o Promoter tem permissão para editar o evento
    if (establishment.promoter.toString() !== req.promoter._id) {
      console.log(establishment.promoter.toString());
      return res.status(403).json({ msg: "Unauthorized access" });
    }
    // Atualizar os dados do evento
    establishment.establishmentName = establishmentData.establishmentName,
      establishment.email = establishmentData.email,
      establishment.password = establishmentData.password,
      establishment.stateName = establishmentData.stateName,
      establishment.cityName = establishmentData.cityName,
      establishment.postalCode = establishmentData.postalCode,
      establishment.streetName = establishmentData.streetName,
      establishment.number = establishmentData.number,
      establishment.phone = establishmentData.phone,
      establishment.companyType = establishmentData.companyType,
      establishment.updatedAt = Date.now();

    // Salvar as alterações no banco de dados
    const updatedEstablishment = await establishmentData.save();

    res.status(200).json(updatedEstablishment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
);

router.delete(
  "/delete/:establishmentId",
  checkToken,
  async (req, res) => {
    try {
      const establishmentId = req.params.establishmentId;

      // Check if the establishment exists
      const establishment = await Event.findById(establishmentId).select(
        "-isFeatured"
      );
      if (!establishment) {
        return res.status(404).json({ error: "Establishment not found" });
      }

      // Verificar se o User tem permissão para editar o establishment
      if (establishment.user.toString() !== req.user._id) {
        console.log(establishment.user.toString());
        return res.status(403).json({ error: "Unauthorized access" });
      }
      // Delete the establishment
      await Establishment.deleteOne({ _id: establishmentId });

      res.status(200).json({ error: "Establishment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
