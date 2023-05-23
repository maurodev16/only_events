require('dotenv').config();
const router = require('express').Router()
const Promoter = require('../models/Promoter');
const bcrypt = require('bcrypt');
const checkPromoterToken = require('../middleware/checkPromoterToken');


router.post('/register', async (req, res) => {
    //body
    const { name, email, password, company, age, country, city, post_code, street, contact, phone, avatarUrl } = req.body;
    try {

        //Valida os daos do Promoter 
        if (!name) {
            res.status(422).json({ msg: "Nome completo obrigatorio!" });
            return;
        }
     
      
        if (!company) {
            res.status(422).json({ msg: "company obrigatorio!" });
            return;
        }

        //check if Promoter email exists
        const emailExists = await Promoter.findOne({ email: email });
        if (emailExists) {
            res.status(422).json({ msg: "ja existe um usuario com este email!" });
            return;
        }

        // Create password
        const salt = await bcrypt.genSalt(12);
        const passwordhash = await bcrypt.hash(password, salt);

        //Create Promoter
        const promoter = new Promoter({ 
            name, 
            email, 
            password: passwordhash,
            company, 
            age,
            country,
            city, 
            post_code, 
            street, 
            contact, 
            phone, 
           avatarUrl,
        });
        const createdPromoter = await promoter.save();
        if (createdPromoter) {
            res.status(200).json({ msg: `Bem vindo(a) ${createdPromoter.name}!` });
        }

    } catch (error) {
        console.log(`Erro ao cadastar usuario: ${error}`)
        res.status(500).json({ msg: "Erro ao cadastrar Promoter, tente novamente mais tarde!" })
    }

});

router.get('/fetch', checkPromoterToken, async (req, res) => {
    try {
        const promoter = await Promoter.find().select('-password');
        if (!promoter) {
           return res.status(404).json({ msg: "Promoters nao encontrados" });
           
        }
        res.status(200).json(promoter)
    } catch (error) {
        res.status(500).json({ error: error })
    }
});

router.get('/:id', checkPromoterToken, async (req, res) => {
    const id = req.params.id;

    try {
        const promoter = await Promoter.findById(id, '-password');
        if (!promoter) {
         return     res.status(404).json({ msg: "Usuario nao encontrado" });
           
        }
        res.status(200).json(promoter)
    } catch (error) {
        res.status(500).json({ error: error })
    }
});

router.put('/editPromoter/:promoterId', checkPromoterToken, async (req, res) => {
    try {
      const promoterId = req.params.userId;
      const promoterData = req.body;
  
      // Verificar se o user existe
      const promoter = await Promoter.findById(promoterId);
      if (!promoter) {
        return res.status(404).json({ msg: "Promoter não encontrado" });
      }
  
      // Atualizar os dados do user
      promoter.fullname = promoterData.fullname;
      promoter.nickname = promoterData.nickname;
      promoter.password = promoterData.password;
      promoter.dateOfBirth = promoterData.dateOfBirth;
      promoter.gender = promoterData.gender;
      promoter.interest = promoterData.interest;
      promoter.phone = promoterData.phone;
      promoter.avatarUrl = promoterData.avatarUrl;
      promoter.updated = Date.now();
  
      // Salvar as alterações no banco de dados
      const updatedpromoter = await promoter.save();
  
      res.status(200).json(updatedpromoter);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/editPromoter/:promoterId', checkPromoterToken, async (req, res) => {
    try {
      const promoterId = req.params.promoterId;
      const promoterData = req.body;
  
      // Check if the promoter exists
      const promoter = await Promoter.findById(promoterId);
      if (!promoterData) {
        return res.status(404).json({ msg: "Promoter not found" });
      }
  
      // Check if the logged-in promoter has permission to edit the user
      if (promoter._id.toString() !== req.promoter._id) {
        return res.status(403).json({ msg: "Unauthorized access" });
      }
  
      // Update the promoter data
         // Atualizar os dados do promoter
         promoter.fullname = promoterData.fullname;
         promoter.nickname = promoterData.nickname;
         promoter.password = promoterData.password;
         promoter.dateOfBirth = promoterData.dateOfBirth;
         promoter.gender = promoterData.gender;
         promoter.interest = promoterData.interest;
         promoter.phone = promoterData.phone;
         promoter.avatarUrl = promoterData.avatarUrl;
         promoter.updated = Date.now();
  
      // Save the updated promoter data to the database
      const updatedPromoter = await promoter.save();
  
      res.status(200).json(updatedPromoter);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
module.exports = router
