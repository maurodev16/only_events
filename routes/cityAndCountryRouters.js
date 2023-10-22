const mongoose = require("mongoose");
const router = require("express").Router();
const CityAndCountry = require("../models/CityAndCountry");
const checkToken = require("../middleware/checkToken");

router.post("/register", checkToken, async (req, res) => {
  const { city_name, country_name } = req.body;
  try {
    //Valid City
    if (!city_name) {
      res.status(422).json({ msg: "City name obrigatorio!" });
      return;
    }

    //check if City with Country exists
    const cityAndCountyExists = await CityAndCountry.findOne({
      city_name: city_name,
      country_name: country_name,
    });
    if (cityAndCountyExists) {
      res.status(422).json({ msg: "ja existe uma cidade com este nome!" });
      return;
    }

    //Create City and Country
    const city_country = new CityAndCountry({
      city_name,
      country_name,
    });
    const createdCityCountry = await city_country.save();
    if (createdCityCountry) {
      res.status(200).json({
        msg: `${createdCityCountry.city_name} and ${createdCityCountry.country_name} Created!`,
      });
    }
  } catch (error) {
    console.log(`Erro ao criar cidade: ${error}`);
    res
      .status(500)
      .json({ msg: "Erro ao cadastrar Cidade, tente novamente mais tarde!" });
  }
});

router.get("/fetch-city-countries", async (req, res) => {
  try {
    const cities = await CityAndCountry.find()
      .sort({ city_name: 1 })
      .select("-__v");
    if (!cities || cities.length === 0) {
      return res.status(404).json({ msg: "Cities not found" });
    }
    return res.status(201).json(cities);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.get("/fetch-city-countries/:city_name", async (req, res) => {
  try {
    const cityName = req.params.city_name;
    const city = await CityAndCountry.find({city_name: cityName }).select("-__v");

    if (city) {
      return res.status(201).json(city);
    } else {
      return res.status(404).json({ message: "City not found." });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

module.exports = router;
