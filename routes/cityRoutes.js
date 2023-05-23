const router = require('express').Router();
const checkPromoterToken = require('../middleware/checkPromoterToken');
const City = require('../models/City');

router.post('/register',checkPromoterToken, async (req, res) => {
    //body
    const { cityName, capital } = req.body;
    try {

        //Valid City 
        if (!cityName) {
            res.status(422).json({ msg: "City name obrigatorio!" });
            return;
        }

        //check if City with Captal exists
        const cityExists = await City.findOne({ cityName: cityName, capital: capital });
        if (cityExists) {
            res.status(422).json({ msg: "ja existe uma cidade com este nome!" });
            return;
        }

        //Create City
        const city = new City({ 
            cityName, 
            capital,
        });
        const createdCity = await city.save();
        if (createdCity) {
            res.status(200).json({ msg: `${createdCity.cityName}and ${createdCity.capital} Created!` });
        }

    } catch (error) {
        console.log(`Erro ao criar cidade: ${error}`)
        res.status(500).json({ msg: "Erro ao cadastrar Cidade, tente novamente mais tarde!" })
    }

});

router.get('/fetch', async (req, res) => {
    try {
        const cities = await City.find().sort({ cityName: 1 }).select('-__v');
        if (!cities || cities.length === 0) {
            return res.status(404).json({ msg: "Cities not found" });
        }
        res.status(200).json(cities);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});


module.exports = router;