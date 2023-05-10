require('dotenv').config();
const router = require('express').Router()
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const checkToken = require('../middleware/tokenVerify');

//gera um token de authenticacao
const SECRET_KEY = process.env.SECRET_KEY;
const EXPIRES_IN = process.env.EXPIRES_IN;

router.post('/register', async (req, res) => {
    //body
    const { fullname, nickname, email, password } = req.body;
    try {

        //Valida os daos do usuario 
        if (!fullname) {
            res.status(422).json({ msg: "name obrigatorio!" });
            return;
        }

        if (!nickname) {
            res.status(422).json({ msg: "Nickname obrigatorio!" });
            return;
        }

        //check if user email exists
        const emailExists = await User.findOne({ email: email });
        if (emailExists) {
            res.status(422).json({ msg: "ja existe um usuario com este email!" });
            return;
        }


        //check if user nickname exists
        const nicknameExists = await User.findOne({ nickname: nickname });
        if (nicknameExists) {
            res.status(422).json({ msg: "ja existe um usuario com este nickname!" });
            return;
        }

        // Create password
        const salt = await bcrypt.genSalt(12);
        const passwordhash = await bcrypt.hash(password, salt);

        //Create user
        const user = new User({
            fullname,
            nickname,
            email,
            password: passwordhash,
        });
        const createdUser = await user.save();
        if (createdUser) {
            res.status(200).json({ msg: `Bem vindo(a) ${createdUser.fullname}!` });
        }

    } catch (error) {
        console.log(`Erro ao cadastar usuario: ${error}`)
        res.status(500).json({ msg: "Erro ao cadastrar usuario, tente novamente mais tarde!" })
    }

});

// Rota de login
router.post('/login', async (req, res) => {
    const { nickname, email, password } = req.body;


    //Valida os daos do usuario 
    if (!nickname && !email) {
        res.status(422).json({ msg: "Utilize um Email ou Nickname valido!" });
        return;
    }


    if (!password) {
        res.status(422).json({ msg: "password obrigatorio!" });
        return;
    }

    //check if user email exists
    const user = await User.findOne({ email: email });
    if (!user) {
        res.status(404).json({ msg: "Nao existe nenhum usuario com este Email!" });
        return;
    }

    //check if user nickname exists
    const nicknameExists = await User.findOne({ nickname: nickname });
    if (!nicknameExists) {
        res.status(404).json({ msg: "Nao existe nenhum usuario com este Nickname!" });
        return;
    }

    // Verifica se as senhas correspondem
    const isPasswordvalid = await bcrypt.compare(password, user.password);
    if (!isPasswordvalid) {
        res.status(422).json({ msg: 'senha incorreta' });
        return;
    }


    const token = jwt.sign({ userId: user._id }, SECRET_KEY);
    // Retorna o token de autenticação
    res.status(200).json({ msg: "Atenticacao feita com sucesso! ", token });
})


router.get('/fetch', checkToken, async (req, res) => {
    try {
        const user = await User.find();
        if (!user) {
            res.status(404).json({ msg: "Usuarios nao encontrados" });
            return []
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: error })
    }
});

router.get('/:id', checkToken, async (req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findById(id, '-password');
        if (!user) {
            res.status(404).json({ msg: "Usuario nao encontrado" });
            return []
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: error })
    }
});


module.exports = router
