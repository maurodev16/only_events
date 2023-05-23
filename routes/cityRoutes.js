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
        const city = await City.find();
        if (!city) {
           return res.status(404).json({ msg: "cities not Found" });
           
        }
        res.status(200).json(city)
    } catch (error) {
        res.status(500).json({ error: error })
    }
});

module.exports = router;