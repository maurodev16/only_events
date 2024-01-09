import dotenv from "dotenv";
dotenv.config();
import express from "express";
const router = express.Router();

import AnonymousUser from "../../models/Anonymous.js";
import jwt from "jsonwebtoken";

router.post('/login-anonymous', async (req, res) => {
    try {

        const uid = Math.random().toString(36).substring(2, 15);
        const existingUser = await AnonymousUser.findOne({ uid });

        if (existingUser) {
            return res.status(422).json({ error: 'anonymousUserAlreadyExist' });
        } 
        const newUser = new AnonymousUser({ uid });
        const anonimous_name = `${newUser.name}_${newUser.uid}`;
        newUser.name = anonimous_name;
        await newUser.save();

        // Crie um token aleatório para o usuário anônimo
        const token = jwt.sign({ uid }, process.env.AUTH_SECRET_KEY);

        res.status(200).json({ token });
    } catch (error) {
        console.error('Erro no login anônimo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default router;

