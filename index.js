import { connect } from "mongoose";
import dotenv from 'dotenv';
import express, { urlencoded, json } from "express";
import { serve, setup } from "swagger-ui-express";
import http from 'http';
import exphbs from 'express-handlebars'; // Importe express-handlebars corretamente
import path from 'path';
// Configurar o diretório de visualizações

// Import routers
import establishmentRoutes from './API/routes/Auth/EstablishmentRoutes.js';
import musicCategoryRouters from './API/routes/MusicCategoryRouters.js';
import likeRoutes from './API/routes/LikeRoutes.js';
import favoriteRouters from './API/routes/FavoriteRouters.js';
import followRouters from "./API/routes/FollowRouters.js";
import userRoutes from './API/routes/UserRouter.js';
import authEstablRoutes from './API/routes/Auth/EstablishmentRoutes.js';
import authUserRoutes from './API/routes/Auth/UserRouters.js';
import authAnonimousRoutes from './API/routes/Auth/AnonymousRouters.js';
import countriesRoutes from './API/routes/CityAndCountryRouters.js';
import swaggerSpec from "./API/services/Swagger/swagger.js";
import ResetPasswordEstabRouters from "./API/routes/Auth/ResetPasswordEstabRouters.js";
import ResetPasswordUserRouters from "./API/routes/Auth/ResetPasswordUserRouters.js";
import barDetailRoutes from "./API/routes/Establishments/BarRouters.js";
import clubDetailRoutes from "./API/routes/Establishments/ClubRouters.js";
import kioskDetailRoutes from "./API/routes/Establishments/KioskRouters.js";
import postRoutes from "./API/routes/PostRoutes.js";
const app = express();

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Crie uma instância do express-handlebars
const hbs = exphbs.create();

// Configure o Handlebars como mecanismo de visualização
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


// Resto do código do seu aplicativo...
// Inicialização do servidor HTTP
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000;
const uri = process.env.MONGO_CONNECTION_STRING;
const client = connect(uri);
app.use(urlencoded({ extended: true }));
app.use(json());
// Adicione uma referência ao objeto io ao app para que possa ser usado em outras partes do aplicativo


/// Register routers
app.use('/api/v1/auth', authEstablRoutes);
app.use('/api/v1/auth', authUserRoutes);
app.use('/api/v1/anonimous', authAnonimousRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/music-category', musicCategoryRouters);
app.use('/api/v1/establishment', establishmentRoutes);
app.use('/api/v1/like', likeRoutes);
app.use('/api/v1/favorite', favoriteRouters);
app.use('/api/v1/follow', followRouters);
app.use('/api/v1/city-and-country', countriesRoutes);
app.use("/api/v1/estab-request", ResetPasswordEstabRouters);
app.use("/api/v1/user-request", ResetPasswordUserRouters);
app.use("/api/v1/bar", barDetailRoutes);
app.use("/api/v1/club", clubDetailRoutes);
app.use("/api/v1/kiosk", kioskDetailRoutes);
app.use("/api/v1/post", postRoutes);
app.use('/api/v1/docs', serve, setup(swaggerSpec));


// Connect to MongoDB


client.then(() => {
        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log('Connected to MongoDB');
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });





