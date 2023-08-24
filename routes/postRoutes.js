const router = require('express').Router();
const Event = require('../models/Post');
const cloudinary = require('../services/cloudinaryConfig');
const City = require('../models/City');
const User = require('../models/User');
const checkToken = require('../middleware/checkToken');
const uploadArray = require('../middleware/multerArrayMiddleware');

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { populate } = require('../models/Artist');


router.post('/create', uploadArray.array('post_images_urls', 6), checkToken, async (req, res) => {
  try {
    const {
      title,
      placeName,
      streetName,
      number,
      phone,
      postCode,
      startDate,
      endDate,
      startTime,
      endTime,
      entrancePrice,
      cityName,
      weekDays,
      isAgeVerified,
      selectedAge,
      isFreeEntry,
      canPayWithCardEntry,
      canPayWithCardConsumption,
      isFixedDate,
      extraInfo,
      selectedWeekDays,
      likes,
      likesCount,
      isFeatured,
      created,
      updated,

    } = req.body;

    const userId = req.user._id;
    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({ error: "user not found" });
    }
    // Verifica se a cidade já existe no banco de dados
    let city = await City.findOne({ cityName });


    const event = new Event({
      title: title,
      place_name: placeName,
      street_name: streetName,
      number: number,
      phone: phone,
      post_code: postCode,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      entrance_price: entrancePrice,
      cityName: city,
      week_days: weekDays,
      is_age_verified: isAgeVerified,
      selected_age: selectedAge,
      is_free_entry: isFreeEntry,
      can_pay_with_card_entry: canPayWithCardEntry,
      can_pay_with_card_consumption: canPayWithCardConsumption,
      is_fixed_date: isFixedDate,
      extra_info: extraInfo,
      selected_week_days: selectedWeekDays,
      user: userData._id,
      likes: likes,
      likes_count: likesCount,
      created: created,
      updated: updated,
      isFeatured: isFeatured,
    });
    // Verificar se foram enviadas fotos para a galeria
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    // Fazer o upload das fotos da galeria para o Firebase Storage
   const postImages = [];
    for (const file of req.files) {
      const public_id = `${promoterId}-${file.originalname.split('.')[0]}`;
      const folderPath = `promoters/posts/${promoterId}-${uuidv4()}`;

      const result = await cloudinary.uploader.upload(file.path, {
        public_id: public_id,
        overwrite: false,
        folder: folderPath,
        transformation: [
          { height: 500, width: 500, crop: 'fit' }
      ],
      });
      postImages.push(result.secure_url);
      console.log("PUSH::::::", postImages)
    }

    // Atualizar as URLs da galeria com os caminhos no Firebase Storage
    event.post_images_urls = postImages;
    savedEvent=  await event.save();
    res.status(200).json({ msg: `Post Created Successfully!` });
  

  } catch (error) {
    console.log(`Error creating Event: ${error}`);
    res.status(500).json({ msg: "Error creating post, please try again later!" });
  }
});


///
router.get('/fetch', async (req, res) => {
  try {
    const events = await Event.find({})
      .select('-isFeatured')
      .populate({
        path: 'cityId',
        populate: {
          path: 'promoterId',
          select: 'company logo_url', // Seleciona os campos desejados do promotor
        },
      })
      .populate('promoter', 'full_name company logo_url'); // Popula os dados do promotor

    if (events.length === 0) {
      return res.status(404).json({ msg: "Post not found" });
    }else{
      return res.status(200).json(events);
    }
   
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.get('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const event = await Event.findById(id, '-isFeatured').populate('city', 'cityName');
    if (!event) {
      res.status(404).json({ msg: `Event not found for id ${id}` });
      return [];
    }
    res.status(200).json(event)
  } catch (error) {
    res.status(500).json({ error: error })
  }
});


router.get('/fetchEventByPromoter/:promoterId', async (req, res) => {
  try {
    const promoterId = req.params.promoterId;
    const events = await Event.find({ promoter: promoterId }).select('-isFeatured');
    
    if (events.length === 0) {
      return res.status(200).send([]); // Retorna um array vazio como resposta
    }
    
    return res.status(200).json(events); // Retorna os eventos encontrados
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});



router.get('/fetchEventByCity/:city', async (req, res) => {
  try {
    const city = req.params.city;

    const events = await Event.find({ city: city }).select('-isFeatured');;

    if (events.length === 0) {
      return res.status(404).json({ msg: "No events found for this city" });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/fetchEventsForAdults/:for_adults_only?', async (req, res) => {
  try {
    const forAdultsOnly = req.params.for_adults_only || true;

    const events = await Event.find({ for_adults_only: forAdultsOnly }).select('-isFeatured').populate('cityId');

    if (events.length === 0) {
      return res.status(404).json({ msg: "Nenhum evento para adultos encontrado" });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/fetchEventIsFeatured/:isFeatured', async (req, res) => {
  try {
    const isFeatured = req.params.isFeatured;

    const events = await Event.find({ isFeatured: isFeatured }).select('-isFeatured').populate('cityId');
    console.log(events)

    if (events.length === 0) {
      return res.status(404).json({ msg: `No Featured events so far` });

    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/fetchEventByOrganizedBy/:organized_by', async (req, res) => {
  try {
    const organized_by = req.params.organized_by;

    const events = await Event.find({ organized_by: organized_by }).select('-isFeatured').populate('cityId');

    if (events.length === 0) {
      return res.status(404).json({ msg: `${organized_by} has not organized any events so far` });

    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/fetchEventByDateRange/:startDate/:endDate', async (req, res) => {
  try {
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;

    const events = await Event.find({
      start_date: { $gte: startDate },
      end_date: { $lte: endDate }
    }).select('-isFeatured');

    if (events.length === 0) {
      return res.status(404).json({ msg: "No events found within the date range" }).populate('cityId');
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/editEvent/:eventId', checkToken, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const eventData = req.body;

    // Verificar se o evento existe
    const event = await Event.findById(eventId).select('-isFeatured').populate('cityId');
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Verificar se o Promoter tem permissão para editar o evento
    if (event.promoter.toString() !== req.promoter._id) {
      console.log(event.promoter.toString())
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

router.delete('/deleteEvent/:eventId', checkToken, async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Check if the event exists
    const event = await Event.findById(eventId).select('-isFeatured');
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Verificar se o Promoter tem permissão para editar o evento
    if (event.promoter.toString() !== req.promoter._id) {
      console.log(event.promoter.toString())
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
