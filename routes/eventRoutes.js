const router = require('express').Router();
const Event = require('../models/Event');
const Promoter = require('../models/Promoter');
const checkPromoterToken = require('../middleware/checkPromoterToken');

router.post('/create', checkPromoterToken, async (req, res) => {
  try {
    const {
      title,
      bannerUrl,
      photoGalerie,
      country,
      city,
      street,
      number,
      place_name,
      description,
      entrance_price,
      organized_by,
      artists,
      for_adults_only,
      likesCount,
      start_date,
      end_date,
      start_time,
      end_time,
      paymentInfo,
      socialMedia,
      created,
      updated
    } = req.body;

    const promoterId = req.promoter._id; // Promoter ID obtained from the token

    const promoterData = await Promoter.findById(promoterId);
    if (!promoterData) {
      return res.status(404).json({ error: "Promoter not found" });
    }
  
    const event = new Event({
      title,
      country,
      city,
      bannerUrl,
      photoGalerie,
      street,
      number,
      place_name,
      description,
      entrance_price,
      organized_by,
      for_adults_only,
      likesCount, 
      artists,
      socialMedia,
      paymentInfo,
      start_date,
      end_date,
      start_time,
      end_time,
      created,
      updated,
      promoter: promoterData._id // Associate the event with the Promoter by setting the "Promoter" field to the Promoter's ID
    });

    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create the event" });
  }
});

router.get('/fetch', async (req, res) => {
    try {
        const events = await Event.find();
        if (events.length === 0) {
      return  res.status(404).json({ msg: "Events not found" });  
             
        }
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
        return [];
    }
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const event = await Event.findById(id);
        if (!event) {
            res.status(404).json({ msg:  `Event not found for id ${id}` });
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
        const events = await Event.find({ promoter: promoterId });
        if (events.length === 0) {
            return res.status(404).json({ msg: "No event found for this Promoter" });
        }
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/fetchEventByCountry/:country', async (req, res) => {
    try {
      const country = req.params.country;
  
      const events = await Event.find({ country: country });
  
      if (events.length === 0) {
        return res.status(404).json({ msg: "No events found for this country" });
      }
  
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.get('/fetchEventByCity/:city', async (req, res) => {
    try {
      const city = req.params.city;
  
      const events = await Event.find({ city: city });
  
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
  
      const events = await Event.find({ for_adults_only: forAdultsOnly });
  
      if (events.length === 0) {
        return res.status(404).json({ msg: "Nenhum evento para adultos encontrado" });
      }
  
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  
  router.get('/fetchEventByOrganizedBy/:organized_by', async (req, res) => {
    try {
      const organized_by = req.params.organized_by;
  
      const events = await Event.find({ organized_by: organized_by });
  
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
    });

    if (events.length === 0) {
      return res.status(404).json({ msg: "No events found within the date range" });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/editEvent/:eventId', checkPromoterToken, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const eventData = req.body;

    // Verificar se o evento existe
    const event = await Event.findById(eventId);
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
    event.country = eventData.country;
    event.city = eventData.city;
    event.street = eventData.street;
    event.number = eventData.number;
    event.place_name = eventData.place_name;
    event.description = eventData.description;
    event.entrance_price = eventData.entrance_price;
    event.organized_by = eventData.organized_by;
    event.for_adults_only = eventData.for_adults_only;
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

router.delete('/deleteEvent/:eventId', checkPromoterToken, async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Check if the event exists
    const event = await Event.findById(eventId);
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
