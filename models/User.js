const { default: mongoose } = require("mongoose");

const User = mongoose.model('User', {
    fullname: String,
    nickname: String,
    email: String,
    password: String,
})

module.exports = User