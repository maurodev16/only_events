const mongoose = require("mongoose");
const router = require("express").Router();
const Country = require("country-state-city").Country;
const State = require("country-state-city").State;
const City = require("country-state-city").City;

router.get("/fetch-countries", async (req, res)=>{
    
    try {
        const data =  City.getCitiesOfState("SP")
        
    
        if (data.length === 0) {
          return res.status(404).send("data not found");
        }
    
        return res.status(201).json(data);
      } catch (error) {
        res.status(500).send(error.message);
      }
   
});
module.exports = router;