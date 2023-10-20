const router = require('express').Router();

const CityAndCountry = require('../models/CityAndCountry');



router.get('/fetch', async (req, res) => {
    try {
        const cities = await City.find().sort({ cityName: 1 }).select('-__v');
        if (!cities || cities.length === 0) {
            return res.status(404).json({ msg: "Cities not found" });
        }
       return res.status(201).json(cities);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});


module.exports = router;