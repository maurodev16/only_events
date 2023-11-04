const mongoose = require("mongoose");
const router = require("express").Router();
const Establishment = require("../models/Establishment");
const cloudinary = require("../services/cloudinaryConfig");
const User = require("../models/Auth");
const MusicCategory = require("../models/MusicCategory");
const checkToken = require("../middleware/checkToken");
const uploadSingleBanner = require("../middleware/multerSingleBannerMiddleware");
const CityAndCountry = require("../models/CityAndCountry");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { populate } = require("../models/Artist");


router.post("/create", uploadSingleBanner.single("file"),checkToken, async (req, res) => {
    try {
      const establishmentData = req.body;

      // Verificar se foram enviadas fotos para a galeria
      if (!req.file || req.file.length === 0) {
        return res.status(400).send("No images provided");
      }

      const userId = req.auth._id;
console.log(userId)

      const userObj = await User.findById(userId).select("-password");
console.log(userObj)
      if (!userObj) {
        return res.status(404).send("User not found");
      }

      const file = req.file;
      const public_id = `${userId}-${file.originalname.split(".")[0]}`;
      const result = await cloudinary.uploader.upload(file.path, {
        allowed_formats: ["png", "jpg", "gif", "jpeg"],
        public_id: public_id,
        overwrite: false,
        upload_preset: "wasGehtAb_preset",
      });

      if (!result.secure_url) {
        return res.status(500).send("Error uploading image to cloudinary");
      }
   // Converte a string de entrada em objetos JSON
   const openingHoursString = establishmentData.opening_hours;
   const openingHours = parseOpeningHours(openingHoursString);

   
   if (!openingHours) {
    return res.status(400).send("Invalid opening hours format");
}

      // Se a imagem foi enviada com sucesso, prosseguir com a criação do estabelecimento
      const establishment = new Establishment({
        opening_hours: openingHours,
        logo_url: result.secure_url,
        title: establishmentData.title,
        local_name: establishmentData.local_name,
        district: establishmentData.district,
        street_name: establishmentData.street_name,
        number: establishmentData.number,
        phone: establishmentData.phone,
        postal_code: establishmentData.postal_code,
        city_name: establishmentData.city_name,
        country_name: establishmentData.country_name,
        entrance_price: establishmentData.entrance_price,
        free_entry_till: establishmentData.free_entry_till,
        is_age_verified: establishmentData.is_age_verified,
        selected_age: establishmentData.selected_age,
        is_free_entry: establishmentData.is_free_entry,
        can_pay_with_card_entry: establishmentData.can_pay_with_card_entry,
        can_pay_with_card_consumption:
          establishmentData.can_pay_with_card_consumption,
        likes_count: establishmentData.likes_count,
        created: establishmentData.created,
        updated: establishmentData.updated,
        is_featured: establishmentData.is_featured,
        music_category_name: establishmentData.music_category_name,
        

        //Detail
        drinks: establishmentData.drinks,
        dance: establishmentData.dance,
        casual: establishmentData.casual,
        good_to_go_with_group: establishmentData.good_to_go_with_group,

        //Services options
        dine_In: establishmentData.dine_In,
        delivery: establishmentData.delivery,
        take_way: establishmentData.take_way,

        ///Acessibility
        accessible_parking: establishmentData.accessible_parking,
        step_free_entry: establishmentData.step_free_entry,
        accessible_restrooms: establishmentData.accessible_restrooms,
        elevator_or_ramps: establishmentData.elevator_or_ramps,
        wide_corridors: establishmentData.wide_corridors,
        braille_signage: establishmentData.braille_signage,
        mobility_assistance: establishmentData.mobility_assistance,
        service_dog_access: establishmentData.service_dog_access,
        audio_description_or_visual_guide:
          establishmentData.audio_description_or_visual_guide,
        accessible_communication: establishmentData.accessible_communication,

        ///Convenience
        convenience_parking: establishmentData.convenience_parking,
        wi_fi_access: establishmentData.wi_fi_access,
        outdoor_seating: establishmentData.outdoor_seating,
        indoor_seating: establishmentData.indoor_seating,
        takeout_or_to_go_orders: establishmentData.takeout_or_to_go_orders,
        delivery_service: establishmentData.delivery_service,
        reservation_service: establishmentData.reservation_service,
        drive_through: establishmentData.drive_through,
        online_ordering: establishmentData.online_ordering,
        atm_access: establishmentData.atm_access,

        ///Menu Options
        dining: establishmentData.dining,
        alcoholic_beverages: establishmentData.alcoholic_beverages,
        shisha: establishmentData.alcoholic_beverages,
        wine_selection: establishmentData.wine_selection,
        beer_selection: establishmentData.beer_selection,
        cocktails: establishmentData.cocktails,
        non_alcoholic_beverages: establishmentData.non_alcoholic_beverages,
        coffee_and_tea: establishmentData.coffee_and_tea,
        desserts: establishmentData.desserts,
        vegetarian: establishmentData.vegetarian,
        vegan_options: establishmentData.vegan_options,

        ///Atmosphere
        dance_floor: establishmentData.dance_floor,
        casual_setting: establishmentData.casual_setting,
        formal_setting: establishmentData.formal_setting,
        live_music: establishmentData.live_music,
        karaoke: establishmentData.karaoke,
        outdoor_seating_atmosphere:
          establishmentData.outdoor_seating_atmosphere,
        bar_area: establishmentData.bar_area,
        good_for_groups: establishmentData.good_for_groups,
        intimate_setting: establishmentData.intimate_setting,
        family_friendly: establishmentData.family_friendly,
        lounge_area: establishmentData.lounge_area,

        ///Public type
        good_for_groups_public: establishmentData.good_for_groups_public,
        family_friendly_public: establishmentData.family_friendly_public,
        kid_friendly: establishmentData.kid_friendly,
        adults_only: establishmentData.adults_only,
        solo_friendly: establishmentData.solo_friendly,
        pet_friendly: establishmentData.pet_friendly,
        lgbtq_plus_friendly: establishmentData.lgbtq_plus_friendly,
        accessible_to_all: establishmentData.accessible_to_all,
        couples_retreat: establishmentData.couples_retreat,
        student_friendly: establishmentData.student_friendly,

        ///Planning
        reservations_accepted: establishmentData.reservations_accepted,
        walk_ins_welcome: establishmentData.walk_ins_welcome,
        private_events: establishmentData.private_events,
        event_planning_services: establishmentData.event_planning_services,
        catering_services: establishmentData.catering_services,
        table_reservations: establishmentData.table_reservations,
        online_booking: establishmentData.online_booking,
        event_space_rental: establishmentData.event_space_rental,
        party_packages: establishmentData.party_packages,
        custom_event_packages: establishmentData.custom_event_packages,

        //Payment Options
        credit_cards_accepted: establishmentData.credit_cards_accepted,
        debit_cards_accepted: establishmentData.debit_cards_accepted,
        cash_only: establishmentData.cash_only,
        mobile_payments: establishmentData.mobile_payments,
        contactless_payments: establishmentData.contactless_payments,
        online_payments: establishmentData.online_payments,
        checks: establishmentData.checks,
        split_bills: establishmentData.split_bills,
        gift_cards: establishmentData.gift_cards,
        crypto_currency: establishmentData.crypto_currency,
        user: userObj,
      });

      // Salvar o estabelecimento no banco de dados
      const createdEstablishment = await establishment.save();

      return res.status(201).json({ establishment: createdEstablishment });
    } catch (error) {
      console.log(`Error creating Establishment: ${error}`);
//  '     return res
//         .status(500)
//         .send("Error creating establishment, please try again later!");'
    }
  }
);
// Função para converter a string em objetos JSON// Função para converter a string em objetos JSON
function parseOpeningHours(openingHoursString) {
  const trimmedString = openingHoursString.slice(1, -1); // Remova os colchetes iniciais e finais

  const parts = trimmedString.split("Day: ");
  const objects = [];

  for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const openCloseParts = part.split("Open: ");
      if (openCloseParts.length === 2) {
          const day = openCloseParts[0].trim();
          const openClose = openCloseParts[1].split("Close: ");
          const open = openClose[0].trim();
          const close = openClose[1].trim();

          // Crie um objeto JSON com os dados
          const data = {
              day,
              open,
              close,
          };

          // Adicione o objeto à matriz
          objects.push(data);
      }
  }

  if (objects.length === 0) {
      return null; // Retorna null em caso de formato inválido
  }

  return objects; // Retorna os objetos JSON
}

///
router.get("/fetch", async (req, res) => {
  try {
    const establishments = await Establishment.find({})
      .sort({ createdAt: 1 })
      .select("-isFeatured") // Removendo o campo "__v"
      .populate({
        path: "city_and_country_obj",
        select: "-__v",
        populate: {
          path: "country_name",
          select: "country_name",
        },
      })
      .populate("user", "name email logo_url role is_company")
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
          select: "name logo_url", // Seleciona os campos desejados do User
        },
      })
      .populate("user", "name email logo_url")
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

module.exports = router;
