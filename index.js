import { connect } from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

import express, { urlencoded, json } from "express";
import { serve, setup } from "swagger-ui-express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(urlencoded({ extended: true }));
app.use(json());

// Import routers
import logoRoutes from './API/models/Logo.js';
import establishmentRoutes from './API/routes/Auth/EstablishmentRoutes.js';
import establishmentFiltersRoutes from './API/routes/EstablishmentFiltersRoutes.js';
import musicCategoryRouters from './API/routes/musicCategoryRouters.js';
import likeRoutes from './API/routes/LikeRoutes.js';
import followRouters from "./API/routes/FollowRouters.js";
import userRoutes from './API/routes/UserRouter.js';
import artistRoutes from './API/routes/artistRoutes.js';
import authUserRoutes from './API/routes/Auth/UserRouters.js';
import authAnonimousRoutes from './API/routes/Auth/AnonymousRouters.js';
import countriesRoutes from './API/routes/cityAndCountryRouters.js';
import swaggerSpec from "./API/services/Swagger/swagger.js";
import passwordReset from "./API/routes/Auth/PasswordResetRouters.js";
import barDetailRoutes from "./API/routes/Establishments/BarRouters.js";
import clubDetailRoutes from "./API/routes/Establishments/ClubRouters.js";
import kioskDetailRoutes from "./API/routes/Establishments/KioskRouters.js";
import postRoutes from "./API/routes/PostRoutes.js";

/// Register routers
app.use('/api/v1/logo', logoRoutes);
app.use('/api/v1/auth', authUserRoutes);
app.use('/api/v1/anonimous', authAnonimousRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/music-category', musicCategoryRouters);
app.use('/api/v1/establishment', establishmentRoutes);
app.use('/api/v1/establishment/filter', establishmentFiltersRoutes);
app.use('/api/v1/like', likeRoutes);
app.use('/api/v1/follow', followRouters);
app.use('/api/v1/artist', artistRoutes);
app.use('/api/v1/city-and-country', countriesRoutes);
app.use("/api/v1/password-reset", passwordReset);
app.use("/api/v1/bar", barDetailRoutes);
app.use("/api/v1/club", clubDetailRoutes);
app.use("/api/v1/kiosk", kioskDetailRoutes);
app.use("/api/v1/post", postRoutes);


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





