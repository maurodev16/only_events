const router = require('express').Router();
const Establishment = require('../models/Establishment');
const CityAndCountry = require('../models/CityAndCountry');

// Rota para filtrar os establishments por cidade
router.get('/filter-by-city/:city_name', async (req, res) => {
  try {
    const cityName = req.params.city_name;

    // Consulte seu banco de dados para buscar os establishments que correspondem à cidade selecionada
    // Substitua esta linha pela sua própria lógica de consulta ao banco de dados
    const city = await CityAndCountry.findOne({ cityName });

    if (!city) {
      return res.status(404).json({ message: 'Cidade não encontrada.' });
    }

    const filteredEstablishments = await Establishment.find({ cityName });

    res.status(200).json(filteredEstablishments);
  } catch (error) {
    console.error('Erro ao filtrar os Establishments por cidade:', error);
    res.status(500).json({ message: 'Erro ao filtrar os Establishments por cidade.' });
  }
});

module.exports = router;
