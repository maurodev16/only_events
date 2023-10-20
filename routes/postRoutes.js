const mongoose = require("mongoose");
const router = require("express").Router();
const Post = require("../models/Post");
const cloudinary = require("../services/cloudinaryConfig");
const User = require("../models/Auth");
const MusicCategory = require("../models/MusicCategory");
const checkToken = require("../middleware/checkToken");
const uploadSingleBanner = require("../middleware/multerSingleBannerMiddleware");
const CityAndCountry = require("../models/CityAndCountry");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { populate } = require("../models/Artist");

router.post(
  "/create",
  uploadSingleBanner.single("file"),
  checkToken,
  async (req, res) => {
    try {
      const postData = req.body;

      /// Finding user
      const userId = req.auth._id;
      const userObj = await User.findById(userId).select("-password");

      if (!userObj) {
        return res.status(404).send("User not found");
      }

      // Obter o nome do país associado à cidade no banco de dados
      const cityId = postData.city_and_country_obj; // Suponhamos que o _id da cidade seja armazenado em city_and_country
      const existingCityObj = await CityAndCountry.findById(cityId);
      if (!existingCityObj) {
        return res.status(404).send("City not found in the database");
      }

      //const countryName = existingCityObj.country_name;
      // const countryName = existingCity.country_name;

      // Verificar se foram enviadas fotos para a galeria
      if (!req.file || req.file.length === 0) {
        return res.status(400).send("No images provided");
      }

      const file = req.file;
      const public_id = `${userId}-${file.originalname.split(".")[0]}`;
      const result = await cloudinary.uploader.upload(file.path, {
        allowed_formats: ["png", "jpg", "gif", "jpeg"],
        public_id: public_id,
        overwrite: false,
        upload_preset: "wasGehtAb_preset",
      });

      if (result) {
        const post = new Post({
          post_image_url: result.secure_url,
          title: postData.title,
          place_name: postData.place_name,
          district: postData.district,
          street_name: postData.street_name,
          number: postData.number,
          phone: postData.phone,
          postal_code: postData.postal_code,
          city_and_country_obj: existingCityObj,
          start_date: postData.start_date,
          end_date: postData.end_date,
          start_time: postData.start_time,
          end_time: postData.end_time,
          entrance_price: postData.entrance_price,
          week_days: postData.week_days,
          is_age_verified: postData.is_age_verified,
          selected_age: postData.selected_age,
          is_free_entry: postData.is_free_entry,
          free_entry_till: postData.free_entry_till,
          can_pay_with_card_entry: postData.can_pay_with_card_entry,
          can_pay_with_card_consumption: postData.can_pay_with_card_consumption,
          is_fixed_date: postData.is_fixed_date,
          extra_info: postData.extra_info,
          selected_week_days: postData.selected_week_days,
          likes_count: postData.likes_count,
          created: postData.created,
          updated: postData.updated,
          is_featured: postData.is_featured,
          music_category_name: postData.music_category_name,
          user: userObj,
        });

        const createdPost = await post.save();

        return res.status(201).json({ post: createdPost });
      }
    } catch (error) {
      console.log(`Error creating Post: ${error}`);
      return res
        .status(500)
        .send("Error creating post, please try again later!");
    }
  }
);

///
router.get("/fetch", async (req, res) => {
  try {
    const posts = await Post.find({})
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

    if (posts.length === 0) {
      return res.status(404).send("Post not found");
    }

    return res.status(200).json(posts);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/fetchPostByUser/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ user: userId })
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

    if (posts.length === 0) {
      return res.status(404).json({ msg: "Post not found" });
    }

    return res.status(201).json(posts); // Retorna os posts encontrados
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/fetchPostByPostId/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const post = await Post.findById(id, "-isFeatured").populate(
      "city",
      "city_name"
    );
    if (!post) {
      res.status(404).json({ msg: `Post not found for id ${id}` });
      return [];
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.get("/fetchPostByCity/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const events = await Post.find({ city: city }).select("-isFeatured");

    if (events.length === 0) {
      return res.status(404).json({ msg: "No events found for this city" });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/fetchEventsForAdults/:for_adults_only?", async (req, res) => {
  try {
    const forAdultsOnly = req.params.for_adults_only || true;

    const events = await Post.find({ for_adults_only: forAdultsOnly })
      .select("-isFeatured")
      .populate("cityId");

    if (events.length === 0) {
      return res
        .status(404)
        .json({ msg: "Nenhum evento para adultos encontrado" });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/fetchEventIsFeatured/:isFeatured", async (req, res) => {
  try {
    const isFeatured = req.params.isFeatured;

    const events = await Post.find({ isFeatured: isFeatured })
      .select("-isFeatured")
      .populate("cityId");
    console.log(events);

    if (events.length === 0) {
      return res.status(404).json({ msg: `No Featured events so far` });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/fetchEventByOrganizedBy/:organized_by", async (req, res) => {
  try {
    const organized_by = req.params.organized_by;

    const events = await Post.find({ organized_by: organized_by })
      .select("-isFeatured")
      .populate("cityId");

    if (events.length === 0) {
      return res
        .status(404)
        .json({ msg: `${organized_by} has not organized any events so far` });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/fetchEventByDateRange/:startDate/:endDate", async (req, res) => {
  try {
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;

    const events = await Event.find({
      start_date: { $gte: startDate },
      end_date: { $lte: endDate },
    }).select("-isFeatured");

    if (events.length === 0) {
      return res
        .status(404)
        .json({ msg: "No events found within the date range" })
        .populate("cityId");
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/editEvent/:eventId", checkToken, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const eventData = req.body;

    // Verificar se o evento existe
    const event = await Post.findById(eventId)
      .select("-isFeatured")
      .populate("cityId");
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Verificar se o Promoter tem permissão para editar o evento
    if (event.promoter.toString() !== req.promoter._id) {
      console.log(event.promoter.toString());
      return res.status(403).json({ msg: "Unauthorized access" });
    }

    // Atualizar os dados do evento
    event.title = eventData.title;
    event.city = eventData.city;
    event.street = eventData.street;
    event.number = eventData.number;
    event.place_name = eventData.place_name;
    event.description = eventData.description;
    event.entrance_price = eventData.entrance_price;
    event.organized_by = eventData.organized_by;
    event.is_age_verified = eventData.is_age_verified;
    event.start_date = eventData.start_date;
    event.end_date = eventData.end_date;
    event.start_time = eventData.start_time;
    event.end_time = eventData.end_time;
    event.updated = Date.now();

    // Salvar as alterações no banco de dados
    const updatedEvent = await event.save();

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/deleteEvent/:eventId", checkToken, async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Check if the event exists
    const event = await Event.findById(eventId).select("-isFeatured");
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Verificar se o Promoter tem permissão para editar o evento
    if (event.promoter.toString() !== req.promoter._id) {
      console.log(event.promoter.toString());
      return res.status(403).json({ msg: "Unauthorized access" });
    }
    // Delete the event
    await Event.deleteOne({ _id: eventId });

    res.status(200).json({ msg: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
