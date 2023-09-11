const router = require('express').Router();
const Post = require('../models/Post');
const City = require('../models/City');

// Rota para filtrar os posts por cidade
router.get('/filter-by-city/:cityName', async (req, res) => {
  try {
    const cityName = req.params.cityName;

    // Consulte seu banco de dados para buscar os posts que correspondem à cidade selecionada
    // Substitua esta linha pela sua própria lógica de consulta ao banco de dados
    const city = await City.findOne({ cityName });

    if (!city) {
      return res.status(404).json({ message: 'Cidade não encontrada.' });
    }

    const filteredPosts = await Post.find({ cityName });

    res.status(200).json(filteredPosts);
  } catch (error) {
    console.error('Erro ao filtrar os posts por cidade:', error);
    res.status(500).json({ message: 'Erro ao filtrar os posts por cidade.' });
  }
});

module.exports = router;
