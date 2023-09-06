const User = require("../models/Auth");
const router = require('express').Router();
const checkToken = require('../middleware/checkToken');
const Token = require('../models/Token')



router.post("/:userId/:token", async (req, res) => {
    const { userId, password } = req.body;

    try {
        const passwordExist = User.findOne({ password });
        if (!passwordExist) return res.status(400).send("No user found with this email");

        const user = await User.findById(req.params.userId);
        if (!user) return res.status(400).send("invalid link or expired");

        const token = await Token.findOne({
            userId: userId._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send("Invalid link or expired");

        user.password = req.body.password;
        await user.save();
        await token.delete();

        res.send("password reset sucessfully.");
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
});

module.exports = router;