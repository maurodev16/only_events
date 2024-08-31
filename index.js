import { connect } from "mongoose";
import dotenv from 'dotenv';
import express, { urlencoded, json } from "express";
import { serve, setup } from "swagger-ui-express";
import http from 'http';
import exphbs from 'express-handlebars';
import session from 'express-session';
import path from 'path';
import configureSocketServer from "./API/services/socketServer.js";

// Import routers
import musicCategoryRouters from './API/routes/MusicCategoryRouters/MusicCategoryRouters.js';
import highLightRouters from './API/routes/HighlightRouters/HighLightRouter.js';
import likeRoutes from './API/routes/LikeRouters/LikeRoutes.js';
import favoriteRouters from './API/routes/FavoriteRouters/FavoriteRouters.js'; // Importar a função de ordem superior
import followRouters from "./API/routes/FollowRouters/FollowRouters.js";
import userRoutes from './API/routes/Auth/UserRouters.js';
import authUserRoutes from './API/routes/Auth/UserRouters.js';
import countriesRoutes from './API/routes/CityAndCountryRouters/CityAndCountryRouters.js';
import swaggerSpec from "./API/services/Swagger/swagger.js";
import ResetPasswordEstabRouters from "./API/routes/Auth/ResetPasswordEstabRouters.js";
import ResetPasswordUserRouters from "./API/routes/Auth/ResetPasswordUserRouters.js";
import EmailVerificationRouters from "./API/routes/Auth/EmailVerificationRouters.js";
import barDetailRoutes from "./API/routes/CompanyRouter/BarRouters.js";
import clubDetailRoutes from "./API/routes/CompanyRouter/ClubRouters.js";
import postRoutes from "./API/routes/PostRouters/PostRoutes.js";

dotenv.config();
const app = express();
app.set('view engine', 'ejs');
const httpServer = http.createServer(app);
const io = configureSocketServer(httpServer); // Configura o servidor Socket.IO

app.use(session({
    secret: 'seuSegredoAqui',
    resave: false,
    saveUninitialized: false
}));

const hbs = exphbs.create();

const PORT = process.env.PORT || 3000;
const uri = process.env.MONGO_CONNECTION_STRING;
const uri_local = process.env.MONGO_LOCAL_STRING_CONN;
const client = connect(uri);
app.use(urlencoded({ extended: true }));
app.use(json());

io.on('connection', (socket) => {
    console.log('Client ' + socket.id + ' connected');

    socket.on('message', (message) => {
        console.log('Received:', message);
        socket.emit('message', 'Hello from server');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


// Register other routers
app.use('/api/v1/favorite', favoriteRouters(io)); // Passando io para favoriteRouters
app.use('/api/v1/auth', authUserRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/music-category', musicCategoryRouters);
app.use('/api/v1/highLight', highLightRouters);
app.use('/api/v1/like', likeRoutes);
app.use('/api/v1/follow', followRouters);
app.use('/api/v1/city-and-country', countriesRoutes);
app.use("/api/v1/company-request", ResetPasswordEstabRouters);
app.use("/api/v1/user-request", ResetPasswordUserRouters);
app.use("/api/v1/email-verification", EmailVerificationRouters);
app.use("/api/v1/bar", barDetailRoutes);
app.use("/api/v1/club", clubDetailRoutes);
app.use("/api/v1/post", postRoutes);
app.use('/api/v1/docs', serve, setup(swaggerSpec));

app.get('/api/v1/', (req, res) => {
    res.render('home/index');
});

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
