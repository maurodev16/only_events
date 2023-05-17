const router = require('express').Router()
const Participant = require('../models/Participant');
const bcrypt = require('bcrypt');
const checkParticipantToken = require('../middleware/checkParticipantToken');


router.post('/register', async (req, res) => {
    //body
    const { fullname, nickname, email, password, phone, country, age, avatarUrl, musicPreferences } = req.body;
    try {

        //Valida os daos do Participant 
        if (!fullname) {
            res.status(422).json({ msg: "Nome completo obrigatorio!" });
            return;
        }

        if (!nickname) {
            res.status(422).json({ msg: "Nickname obrigatorio!" });
            return;
        }
        if (!email) {
            res.status(422).json({ msg: "Email obrigatorio!" });
            return;
        }
        if (!password) {
            res.status(422).json({ msg: "Password obrigatorio!" });
            return;
        }
        if (!age) {
            res.status(422).json({ msg: "Age obrigatorio!" });
            return;
        }

        //check if Participant email exists
        const emailExists = await Participant.findOne({ email: email });
        if (emailExists) {
            res.status(422).json({ msg: "ja existe um participant com este email!" });
            return;
        }

        //check if user nickname exists
        const nicknameExists = await Participant.findOne({ nickname: nickname });
        if (nicknameExists) {
            res.status(422).json({ msg: "ja existe um Participant com este nickname!" });
            return;
        }

        // Create password
        const salt = await bcrypt.genSalt(12);
        const passwordhash = await bcrypt.hash(password, salt);

        //Create Participant
        const participant = new Participant({
            fullname,
            avatarUrl,
            nickname,
            email,
            password: passwordhash,
            phone,
            age,
            country,
            musicPreferences
        });
        const createdParticipant = await participant.save();
        if (createdParticipant) {
            res.status(200).json({ msg: `Bem vindo(a) ${createdParticipant.fullname}!` });
        }

    } catch (error) {
        console.log(`Erro ao cadastar participant: ${error}`)
        res.status(500).json({ msg: "Erro ao cadastrar Participant, tente novamente mais tarde!" })
    }

});

router.get('/fetch', checkParticipantToken, async (req, res) => {
    try {
        const participant = await Participant.find();
        if (!participant) {
            return res.status(404).json({ msg: "Participants nao encontrados" });

        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: error })
    }
});

router.get('/:id', checkParticipantToken, async (req, res) => {
    const id = req.params.id;

    try {
        const participant = await Participant.findById(id, '-password');
        if (!participant) {
            return res.status(404).json({ msg: "Participant nao encontrado" });

        }
        res.status(200).json(participant)
    } catch (error) {
        res.status(500).json({ error: error })
    }
});


router.put('/editParticipant/:participantId', checkParticipantToken, async (req, res) => {
    try {
        const participantId = req.params.participantId;
        const participantData = req.body;

        // Check if the Participant exists
        const participant = await Participant.findById(participantId);
        if (!participantData) {
            return res.status(404).json({ msg: "Participant not found" });
        }

        // Check if the logged-in Participant has permission to edit the user
        if (participant._id.toString() !== req.participant._id) {
            return res.status(403).json({ msg: "Unauthorized access" });
        }

        // Update the Participant data
        // Atualizar os dados do Participant
        participant.fullname = participantData.fullname;
        participant.nickname = participantData.nickname;
        participant.password = participantData.password;
        participant.dateOfBirth = participantData.dateOfBirth;
        participant.gender = participantData.gender;
        participant.phone = participantData.phone;
        participant.photo = participantData.photo;
        participant.description = participantData.description;
        participant.updated = Date.now();

        // Save the updated Participant data to the database
        const updatedParticipant = await participant.save();

        res.status(200).json(updatedParticipant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
