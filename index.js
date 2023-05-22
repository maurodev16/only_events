//inital cnfig
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;

//read json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import routers
const promoterRoutes = require('./routes/promoterRoutes');
const participantRoutes= require('./routes/participantRoutes');
const eventRoutes= require('./routes/eventRoutes');
const artistRoutes= require('./routes/artistRoutes');
const authParticipantRoutes = require('./routes/authParticipantRoutes');
const authPromoter = require('./routes/authPromoterRoutes');
const admin = require('firebase-admin');

admin.initializeApp({
    credential:admin.credential.cert({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    projectId:process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n")
    : undefined,
    clientEmail:process.env.FIREBASE_CLIENT_EMAIL,
}),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,


});

// Register routers
app.use('/api/v1/promoter', promoterRoutes);
app.use('/api/v1/participant', participantRoutes);
app.use('/api/v1/event', eventRoutes);
app.use('/api/v1/artist', artistRoutes);
app.use('/api/v1/auth', authParticipantRoutes);
app.use('/api/v1/auth', authPromoter);

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

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASWORD}${CLUSTER}/${DB_NAME}?retryWrites=true&w=majority`)
    .then(() => {
       
        app.listen(PORT, ()=>{
            console.log(`Server is running on port ${PORT}`);
            console.log('Connected to MongoDB');
        });
    })
    .catch((err) =>{
        console.error('Failed to connect to MongoDB', err);
});





