require('dotenv').config();
const router = require('express').Router()
const Promoter = require('../models/Promoter');
const City = require('../models/City');
const bcrypt = require('bcrypt');
const checkPromoterToken = require('../middleware/checkPromoterToken');


router.post('/register', async (req, res) => {
  const { full_name, email, password, company, age, cityName, post_code, street_name, number, contact, phone, avatar_url } = req.body;

  //try {
    // Valida os dados do Promoter
    if (!full_name) {
      res.status(422).json({ msg: "Nome completo obrigatório!" });
      return;
    }

    if (!company) {
      res.status(422).json({ msg: "Nome da empresa obrigatório!" });
      return;
    }

    if (!cityName) {
      res.status(422).json({ msg: "Nome da cidade obrigatório!" });
      return;
    }

    // Verifica se a cidade já existe no banco de dados
    let city = await City.findOne({ cityName });
    if (!city) {
      res.status(422).json({ msg: "Cidade não encontrada!" });
      return;
    }

    // Verifica se o email do Promoter já está em uso
    const emailExists = await Promoter.findOne({ email: email });
    if (emailExists) {
      res.status(422).json({ msg: "Já existe um usuário com este email!" });
      return;
    }

    // Cria o hash da senha
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Cria o Promoter
    const promoter = new Promoter({ 
      full_name, 
      email, 
      password: passwordHash,
      company, 
      age,
      city: city._id, 
      post_code, 
      street_name, 
      number,
      contact, 
      phone, 
      avatar_url,
    });

    const createdPromoter = await promoter.save();
    if (createdPromoter) {
      res.status(200).json({ msg: `Bem-vindo(a) ${createdPromoter.full_name}!` });
    }
  // } catch (error) {
  //   console.log(`Erro ao cadastrar Promoter: ${error}`);
  //   res.status(500).json({ msg: "Erro ao cadastrar Promoter, tente novamente mais tarde!" });
  // }
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
      promoter.full_name = promoterData.full_name;
      promoter.password = promoterData.password;
      promoter.dateOfBirth = promoterData.dateOfBirth;
      promoter.gender = promoterData.gender;
      promoter.interest = promoterData.interest;
      promoter.number = promoterData.number;
      promoter.street_name = promoterData.street_name;
      promoter.phone = promoterData.phone;
      promoter.avatar_url = promoterData.avatar_url;
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
         promoter.full_name = promoterData.full_name;
         promoter.password = promoterData.password;
         promoter.dateOfBirth = promoterData.dateOfBirth;
         promoter.gender = promoterData.gender;
         promoter.interest = promoterData.interest;
         promoter.number = promoterData.number;
         promoter.street_name = promoterData.street_name;
         promoter.phone = promoterData.phone;
         promoter.avatar_url = promoterData.avatar_url;
         promoter.updated = Date.now();
  
      // Save the updated promoter data to the database
      const updatedPromoter = await promoter.save();
  
      res.status(200).json(updatedPromoter);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
module.exports = router
