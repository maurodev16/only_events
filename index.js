//inital cnfig
require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const app = express()


//read json
app.use(
    express.urlencoded({
        extended: true,
    }),
);

app.use(express.json());

//ROUTERS

const userRoutes = require('./routes/userRoutes')

app.use('/auth', userRoutes)


//initial endpoint
app.get('/', (_req, _res) => {
    //show req
    _res.json({ mg: 'Bem vindo!' })

})

// port
const DB_USER = process.env.DB_USER
const DB_PASWORD = process.env.DB_PASWORD
const DB_NAME = process.env.DB_NAME
const CLUSTER = process.env.CLUSTER


mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASWORD}${CLUSTER}/${DB_NAME}?retryWrites=true&w=majority`)
    .then(() => {
        console.log("Parabens!!!! You are connected")
        app.listen(3000);
    })
    .catch((err) => console.log(err))





