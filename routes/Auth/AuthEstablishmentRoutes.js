import mongoose from "mongoose";
import { Router } from "express";
import Establishment from "../../models/Establishment.js";
import cloudinary from "../../services/Cloudinary/cloudinary_config.js";
import User from "../../models/User.js";
import MusicCategory from "../../models/MusicCategory.js";
import checkToken from "../../middleware/checkToken.js";
import uploadSingleBanner from "../../middleware/multerSingleBannerMiddleware.js";
import CityAndCountry from "../../models/CityAndCountry.js";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import  Artist  from "../../models/Artist.js";

const router = Router();


router.post("/create", uploadSingleBanner.single("file"), async (req, res) => {
  //try {
  const establishmentData = await req.body;


  if (!establishmentData.establishment_name) {
    return res.status(400).json({ error: 'establishment_name fild are mandatory.' });
  } if (!establishmentData.email) {
    return res.status(400).json({ error: 'Last name field are mandatory.' });
  } if (!establishmentData.password) {
    return res.status(400).json({ error: 'Email field are mandatory.' });
  }
  if (!establishmentData.country_name) {
    return res.status(400).json({ error: 'country_name field are mandatory.' });
  } if (!establishmentData.state_name) {
    return res.status(400).json({ error: 'Password field are mandatory.' });
  } if (!establishmentData.city_name) {
    return res.status(400).json({ error: 'Password field are mandatory.' });
  } if (!establishmentData.postal_code) {
    return res.status(400).json({ error: 'Password field are mandatory.' });
  } if (!establishmentData.street_name) {
    return res.status(400).json({ error: 'Password field are mandatory.' });
  } if (!establishmentData.number) {
    return res.status(400).json({ error: 'Password field are mandatory.' });
  } if (!establishmentData.phone) {
    return res.status(400).json({ error: 'Password field are mandatory.' });
  } if (!establishmentData.company_type) {
    return res.status(400).json({ error: 'Password field are mandatory.' });
  }
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
    country_name: establishmentData.country_name,
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
  session.endSession(); // End seccion


  return res.status(201).json({ establishment: createdEstablishment });
  // } catch (error) {
  console.log(`Error creating Establishment: ${error}`);
  await session.abortTransaction(); // Rollback da Transaction
  session.endSession(); // End Section
  console.error(`Erro ao registrar: ${error}`);
  return res.status(500).json({ error: 'Error creating establishment, please try again later!' });
  // }
}
);
// Função para converter a string em objetos JSON
// function parseOpeningHours(openingHoursString) {
//   const trimmedString = openingHoursString.toString().slice(1, -1); // Remova os colchetes iniciais e finais

//   const parts = trimmedString.split("day: ");
//   const objects = [];

//   for (let i = 1; i < parts.length; i++) {
//     const part = parts[i];
//     const openCloseParts = part.split("open: ");
//     if (openCloseParts.length === 2) {
//       const day = openCloseParts[0].trim();
//       const openClose = openCloseParts[1].split("close: ");
//       const open = openClose[0].trim();
//       const close = openClose[1].trim();

//       // Crie um objeto JSON com os dados
//       const data = {
//         day,
//         open,
//         close,
//       };

//       // Adicione o objeto à matriz
//       objects.push(data);
//     }
//   }

//   if (objects.length === 0) {
//     return null; // Retorna null em caso de formato inválido
//   }

//   return objects; // Retorna os objetos JSON
// }

router.get("/fetch", async (req, res) => {
  try {
    const establishments = await Establishment.find({})
      .sort({ createdAt: 1 })
      .select("-isFeatured")
      .populate("user", "first_name last_name email logo_url role company_type")
      .populate({
        path: "music_category_id",
        select: "music_category_name",
      });

    if (establishments.length === 0) {
      return res.status(404).send("Establishment not found");
    }

    return res.status(200).json(establishments);
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
      const establishmentData = req.body;
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
      establishment.title = establishmentData.title;
      establishment.city = establishmentData.city;
      establishment.street = establishmentData.street;
      establishment.number = establishmentData.number;
      establishment.place_name = establishmentData.place_name;
      establishment.description = establishmentData.description;
      establishment.entrance_price = establishmentData.entrance_price;
      establishment.organized_by = establishmentData.organized_by;
      establishment.is_age_verified = establishmentData.is_age_verified;
      establishment.start_date = establishmentData.start_date;
      establishment.end_date = establishmentData.end_date;
      establishment.start_time = establishmentData.start_time;
      establishment.end_time = establishmentData.end_time;
      establishment.updated = Date.now();

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
