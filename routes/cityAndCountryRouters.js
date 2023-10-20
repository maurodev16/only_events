const mongoose = require("mongoose");
const router = require("express").Router();
const { getAllCountries } = require('country-state-city').Country;
const {getAllCities} = require('country-state-city').City;

// Rota para obter a lista de cidades com países
router.get('/fetch-city-countries', (req, res) => {
   // Obtém a lista de todos os países e cria um mapa de países com seus códigos
   const countries = getAllCountries();
   const countryMap = new Map(countries.map(country => [country.isoCode, country.name]));
 
   // Obtém a lista de todas as cidades
   const allCities = getAllCities();
 
   // Mapeia cada cidade com o nome do país, estado e bandeira
   const citiesWithCountries = allCities.map(city => {
     const countryName = countryMap.get(city.countryCode);
 
     return {
       city_name: city.name,
       country_name: countryName || 'Unknown',
     };
   });
 
   res.json(citiesWithCountries);
 });


module.exports = router;