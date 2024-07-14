import mongoose from "mongoose";
import { Router } from "express";
import CityAndCountry from "../models/CityAndCountry.js";
import checkToken from "../middleware/checkToken.js";
import NodeCache from "node-cache";
const router = Router();
const cityCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour


// Middleware para verificar o cache
const checkCache = (req, res, next) => {
  const cachedCities = cityCache.get("germanyCities");
  if (cachedCities) {
    return res.status(200).json({ cities: cachedCities });
  }
  next();
};

router.get("/fetch-all-cities-from-germany", checkCache, async (req, res) => {
  try {
    const cities = await CityAndCountry.find({ country_name: "Germany" })
      .sort({ city_name: 1 })
      .select("-__v");
      
    if (!cities || cities.length === 0) {
      return res.status(404).json({ msg: "Cities not found" });
    }

    // Cache the result in NodeCache for future requests
    cityCache.set("germanyCities", cities); // Cache for 1 hour by default

    return res.status(200).json({ cities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.post("/register", checkToken, async (req, res) => {
  const { cityName, countryName } = req.body;
  try {
    //Valid City
    if (!cityName) {
      res.status(422).json({ msg: "City name obrigatorio!" });
      return;
    }

    //check if City with Country exists
    const cityAndCountyExists = await CityAndCountry.findOne({
      cityName: cityName,
      countryName: countryName,
    });
    if (cityAndCountyExists) {
      res.status(422).json({ msg: "ja existe uma cidade com este nome!" });
      return;
    }

    //Create City and Country
    const cityCountry = new CityAndCountry({
      cityName,
      countryName,
    });
    const createdCityCountry = await cityCountry.save();
    if (createdCityCountry) {
      res.status(200).json({
        msg: `${createdCityCountry.city_name} and ${createdCityCountry.country_name} Created!`,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Erro ao cadastrar Cidade, tente novamente mais tarde!" });
  }
});


router.get("/fetch-city-by-cityname/:cityName", async (req, res) => {
  try {
    const cityName = req.params.cityName;
    const city = await CityAndCountry.find({cityName: cityName }).select("-__v");

    if (city) {
      return res.status(201).json(city);
    } else {
      return res.status(404).json({ message: "City not found." });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
