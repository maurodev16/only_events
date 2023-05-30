const mongoose = require('mongoose');
const Artist = require('./Artist');
const Event = require('./Event');
require('dotenv').config();

IMAGE_AVATAR_DEFAULT_TOKEN = process.env.IMAGE_AVATAR_DEFAULT_TOKEN;
const participantSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    nickname: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    avatarUrl: { type: String, default: `https://firebasestorage.googleapis.com/v0/b/evento-app-5a449.appspot.com/o/default-avatar.png?alt=media&token=${IMAGE_AVATAR_DEFAULT_TOKEN}` },
    age: { type: Number, required: true },
    musicPreferences: [{ type: String }],
    eventHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    favorites: {
        events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
        artists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
    },
    notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
    },
});

// Pré-salvar o documento para adicionar o "@" antes do nickname
participantSchema.pre('save', function (next) {
    this.nickname = '@' + this.nickname;
    next();
});

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
