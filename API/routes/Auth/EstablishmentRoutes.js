import mongoose from "mongoose";
import { Router } from "express";
import Establishment from "../../models/Establishment.js";
import cloudinary from "../../services/Cloudinary/cloudinary_config.js";
import User from "../../models/User.js";
import BarDetails from "../../models/BarDetail.js"
import ClubDetails from "../../models/ClubDetail.js"
import KioskDetails from "../../models/KioskDetail.js"
import MusicCategory from "../../models/MusicCategory.js";
import checkToken from "../../middleware/checkToken.js";
import uploadSingleBanner from "../../middleware/multerSingleBannerMiddleware.js";
import checkRequiredFields from "../../middleware/errorHandler.js"
import CityAndCountry from "../../models/CityAndCountry.js";
const router = Router();


router.post("/signup-establishment", checkRequiredFields(
  [
    'establishment_name',
    'email',
    'password',
    'state_name',
    'city_name',
    'postal_code',
    'street_name',
    'number',
    'phone',
    'company_type',
  ]
), uploadSingleBanner.single("file"), async (req, res) => {
  try {
    const establishmentData = await req.body;

    const session = await mongoose.startSession();

    session.startTransaction(); // Iniciar transação

    // Verifica se o email do Establishment já está em uso
    const emailExists = await Establishment.findOne({ email: establishmentData.email });
    if (emailExists) {
      return res.status(422).json({ error: 'EmailAlreadyExistsException' });
    }

    const establishment = new Establishment({
      establishment_name: establishmentData.establishment_name,
      email: establishmentData.email,
      password: establishmentData.password,
      state_name: establishmentData.state_name,
      city_name: establishmentData.city_name,
      postal_code: establishmentData.postal_code,
      street_name: establishmentData.street_name,
      number: establishmentData.number,
      phone: establishmentData.phone,
      company_type: establishmentData.company_type,
    });

    // Salvar o estabelecimento no banco de dados
    const createdEstablishment = await establishment.save();
    console.log(createdEstablishment);

    if (!createdEstablishment) {
      return res.status(500).json({ error: 'ErroSignupOnDatabaseException' });
    }

    await session.commitTransaction(); // Confirm Transaction
    session.endSession(); // End Session
    return res.status(201).json({ establishment: createdEstablishment });
  } catch (error) {
    console.log(`Error creating Establishment: ${error}`);
    await session.abortTransaction(); // Rollback da Transaction
    session.endSession(); // End Session
    console.error(`Erro ao registrar: ${error}`);
    return res.status(500).json({ error: 'Error creating establishment, please try again later!' });
  }
}
);

// Exemplo de endpoint GET
router.get("/get-details/:establishmentsId", async (req, res) => {
  try {
    const establishmentsId = req.params.establishmentsId;

    // Encontrar o tipo de estabelecimento
    const establishment = await Establishment.findById(establishmentsId);
    if (!establishment) {
      return res.status(404).json({ message: "Establishment not found." });
    }

    const typeEstablishment = establishment.company_type;

    // Recuperar dados com base no tipo de estabelecimento
    let establishmentDetails;
    switch (typeEstablishment) {
      case 'bar':
        establishmentDetails = await BarDetails.findOne({ establishment_id: establishmentsId });
        break;
      case 'club':
        establishmentDetails = await ClubDetails.findOne({ establishment_id: establishmentsId });
        break;
      case 'kiosk':
        establishmentDetails = await KioskDetails.findOne({ establishment_id: establishmentsId });
        break;
      default:
        return res.status(400).json({ message: "Invalid establishment type." });
    }

    // Retorna os dados combinados
    const combinedData = {
      _id: establishment._id,
      establishment_name: establishment.establishment_name,
      logo_url: establishment.logo_url,
      email: establishment.email,
      state_name: establishment.state_name,
      city_name: establishment.city_name,
      postal_code: establishment.postal_code,
      street_name: establishment.street_name,
      number: establishment.number,
      phone: establishment.phone,
      company_type: establishment.company_type,
      followers: establishment.followers,
      followers_count: establishment.followers_count,
      ///
      establishmentDetails,
    };

    // Retorna os dados combinados
    return res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error when fetching establishment data:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});
router.get("/get-all-establishments-wiht-details", async (req, res) => {
  try {
    // Encontrar todos os estabelecimentos
    const allEstablishments = await Establishment.find();

    // Array para armazenar os dados combinados de todos os estabelecimentos
    const combinedDataArray = [];

    // Iterar sobre cada estabelecimento
    for (const establishment of allEstablishments) {
      const establishmentsId = establishment._id;
      const typeEstablishment = establishment.company_type;

      // Recuperar dados com base no tipo de estabelecimento
      let establishmentDetails;
      switch (typeEstablishment) {
        case 'bar':
          establishmentDetails = await BarDetails.findOne({ establishment_id: establishmentsId });
          break;
        case 'club':
          establishmentDetails = await ClubDetails.findOne({ establishment_id: establishmentsId });
          break;
        case 'kiosk':
          establishmentDetails = await KioskDetails.findOne({ establishment_id: establishmentsId });
          break;
        default:
          return res.status(400).json({ message: "Invalid establishment type." });
      }

      // Verificar se os detalhes do estabelecimento estão preenchidos
      if (establishmentDetails && Object.keys(establishmentDetails).length > 0) {
        // Dados combinados para o estabelecimento atual
        const combinedData = {
          _id: establishment._id,
          establishment_name: establishment.establishment_name,
          logo_url: establishment.logo_url,
          email: establishment.email,
          state_name: establishment.state_name,
          city_name: establishment.city_name,
          postal_code: establishment.postal_code,
          street_name: establishment.street_name,
          number: establishment.number,
          phone: establishment.phone,
          company_type: establishment.company_type,
          followers: establishment.followers,
          followers_count: establishment.followers_count,
          ///
          establishmentDetails,
        };
        // Adicionar os dados combinados ao array
        combinedDataArray.push(combinedData);
      }
    }

    // Retorna o array com os dados combinados de todos os estabelecimentos
    return res.status(200).json(combinedDataArray);
  } catch (error) {
    console.error("Error when fetching establishments data:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});


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


router.get("/fetch-establishment-type", async (req, res) => {
  try {
    const { company_type, page = 1, limit = 10 } = req.query;

    if (!company_type) {
      return res.status(400).json({ error: "Company type parameter is missing" });
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const query = { company_type };

    const establishments = await Establishment.paginate(query, options, {
      sort: { createdAt: 1 }

    });

    if (establishments.docs.length === 0) {
      return res.status(404).send("Establishments not found for the specified company type");
    }

    return res.status(200).json({
      establishments: establishments.docs,
      total: establishments.totalDocs,
      totalPages: establishments.totalPages,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});




router.get("/fetchEstablishmentByUser/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const establishments = await Establishment.find({ user: userId })
      .select("-isFeatured")
      .populate({
        path: "city_and_country_obj",
        populate: {
          path: "userId",
          select: "first_name last_name logo_url", // Seleciona os campos desejados do User
        },
      })
      .populate("user", "first_name last_name email logo_url")
      .populate({
        select: "music_category_name", // Ajuste para a propriedade correta da categoria de música
      });

    if (establishments.length === 0) {
      return res.status(404).json({ msg: "Establishment not found" });
    }

    return res.status(201).json(establishments); // Retorna os establishments encontrados
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/fetchEstablishmentByEstablishmentId/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const establishment = await Establishment.findById(
      id,
      "-isFeatured"
    ).populate("city", "city_name");
    if (!establishment) {
      res.status(404).json({ msg: `Establishment not found for id ${id}` });
      return [];
    }
    res.status(200).json(establishment);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.get("/fetchEstablishmentByCity/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const establishments = await Establishment.find({ city: city }).select(
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

router.get(
  "/fetchEstablishmentsForAdults/:for_adults_only?",
  async (req, res) => {
    try {
      const forAdultsOnly = req.params.for_adults_only || true;

      const establishments = await Establishment.find({
        for_adults_only: forAdultsOnly,
      })
        .select("-isFeatured")
        .populate("cityId");

      if (establishments.length === 0) {
        return res
          .status(404)
          .json({ msg: "Nenhum establishment para adultos encontrado" });
      }

      res.status(200).json(establishments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/fetchEventIsFeatured/:isFeatured", async (req, res) => {
  try {
    const isFeatured = req.params.isFeatured;

    const establishments = await Establishment.find({ isFeatured: isFeatured })
      .select("-isFeatured")
      .populate("cityId");
    console.log(establishments);

    if (events.length === 0) {
      return res.status(404).json({ msg: `No Featured establishments so far` });
    }

    res.status(200).json(establishments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/fetchEstablishmentByOrganizedBy/:organized_by",
  async (req, res) => {
    try {
      const organized_by = req.params.organized_by;

      const establishments = await Establishment.find({
        organized_by: organized_by,
      })
        .select("-isFeatured")
        .populate("cityId");

      if (establishments.length === 0) {
        return res.status(404).json({
          msg: `${organized_by} has not organized any establishments so far`,
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

router.put(
  "/editEstablishment/:establishmentId",
  checkToken,
  async (req, res) => {
    try {
      const establishmentData = await req.body;
      const establishmentId = req.params.establishmentId;
      // Verificar se o evento existe
      const establishment = await Establishment.findById(establishmentId)
        .select("-isFeatured")
        .populate("cityId");
      if (!establishment) {
        return res.status(404).json({ msg: "Establishment not found" });
      }

      // Verificar se o Promoter tem permissão para editar o evento
      if (establishment.promoter.toString() !== req.promoter._id) {
        console.log(establishment.promoter.toString());
        return res.status(403).json({ msg: "Unauthorized access" });
      }
      // Atualizar os dados do evento
      establishment.establishment_name = establishmentData.establishment_name,
        establishment.email = establishmentData.email,
        establishment.password = establishmentData.password,
        establishment.state_name = establishmentData.state_name,
        establishment.city_name = establishmentData.city_name,
        establishment.postal_code = establishmentData.postal_code,
        establishment.street_name = establishmentData.street_name,
        establishment.number = establishmentData.number,
        establishment.phone = establishmentData.phone,
        establishment.company_type = establishmentData.company_type,
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
  "/deleteEstablishment/:establishmentId",
  checkToken,
  async (req, res) => {
    try {
      const establishmentId = req.params.establishmentId;

      // Check if the establishment exists
      const establishment = await Event.findById(establishmentId).select(
        "-isFeatured"
      );
      if (!establishment) {
        return res.status(404).json({ msg: "Establishment not found" });
      }

      // Verificar se o User tem permissão para editar o establishment
      if (establishment.user.toString() !== req.user._id) {
        console.log(establishment.user.toString());
        return res.status(403).json({ msg: "Unauthorized access" });
      }
      // Delete the establishment
      await Establishment.deleteOne({ _id: establishmentId });

      res.status(200).json({ msg: "Establishment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
