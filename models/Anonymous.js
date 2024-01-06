const mongoose = require('mongoose');

const anonymousUserSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String, default:"Anonymous"

    },
}, {
    timestamps: true,
});

anonymousUserSchema.pre('save', function (next) {
    if (!this.uid) {
        // Gere um UID se ainda não estiver definido
        this.uid = Math.random().toString(36).substring(2, 15);
    }

    next();
});


const AnonymousUser = mongoose.model('AnonymousUser', anonymousUserSchema);

module.exports = AnonymousUser;
