//inital cnfig
import dotenv from 'dotenv';

import express, { urlencoded, json } from "express";
import { connect } from "mongoose";
import jwt from "jsonwebtoken";
import admin from 'firebase-admin';
import { v2 as claudinary } from "cloudinary";
// To extract data from incoming request
import bodyParser from 'body-parser';
import { serve, setup } from "swagger-ui-express";
dotenv.config();
// To get file paths, remove files
import fs from 'fs';
const app = express();
const PORT = process.env.PORT || 3000;

//read json
app.use(urlencoded({ extended: true }));
app.use(json());

// Import routers
import logoRoutes from './API/routes/logoRouter.js';
import establishmentRoutes from './API/routes/Auth/AuthEstablishmentRoutes.js';
import establishmentFiltersRoutes from './API/routes/EstablishmentFiltersRoutes.js';
import musicCategoryRouters from './API/routes/musicCategoryRouters.js';
import likeRoutes from './API/routes/likeRoutes.js';
import userRoutes from './API/routes/UserRouter.js';
import artistRoutes from './API/routes/artistRoutes.js';
import authUserRoutes from './API/routes/Auth/AuthUserRouters.js';
import authAnonimousRoutes from './API/routes/Auth/AuthAnonymousRouters.js';
import countriesRoutes from './API/routes/cityAndCountryRouters.js';
import swaggerSpec from "./API/services/Swagger/swagger.js";
import passwordReset from "./API/routes/Auth/PasswordResetRouters.js";

/// Register routers
app.use('/api/v1/logo', logoRoutes);
app.use('/api/v1/auth', authUserRoutes);
app.use('/api/v1/anonimous', authAnonimousRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/music-category', musicCategoryRouters);
app.use('/api/v1/establishment', establishmentRoutes);
app.use('/api/v1/establishment/filter', establishmentFiltersRoutes);
app.use('/api/v1/like', likeRoutes);
app.use('/api/v1/artist', artistRoutes);
app.use('/api/v1/city-and-country', countriesRoutes);
app.use("/api/v1/password-reset", passwordReset);


// Configuração do Swagger
app.use('/api/v1/docs', serve, setup(swaggerSpec));

//initial endpoint
app.get('/', (_req, _res) => {
    //show req
    _res.send('Welcome!');
});


// Connect to MongoDB
const DB_USER = process.env.DB_USER
const DB_PASWORD = process.env.DB_PASWORD
const DB_NAME = process.env.DB_NAME
const CLUSTER = process.env.CLUSTER

connect(`mongodb+srv://${DB_USER}:${DB_PASWORD}${CLUSTER}/${DB_NAME}?retryWrites=true&w=majority`)
    .then(() => {
       
        app.listen(PORT, ()=>{
            console.log(`Server is running on port ${PORT}`);
            console.log('Connected to MongoDB');
        });
    })
    .catch((err) =>{
        console.error('Failed to connect to MongoDB', err);
});





