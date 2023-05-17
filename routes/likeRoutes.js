const router = require('express').Router();
const Like = require('../models/Likes');
const Event = require('../models/Event');
const Participant = require('../models/Participant');
const checkParticipantToken = require('../middleware/checkParticipantToken');


// Rota para criar um novo like
router.post('/likes',checkParticipantToken, async (req, res) => {
  try {
    const { participantId, eventId } = req.body;

    // Verificar se o participante e o evento existem
    const participant = await Participant.findById(participantId);
    const event = await Event.findById(eventId);

    if (!participant || !event) {
      res.status(404).json({ msg: 'Participant or event not found' });
      return;
    }

    // Criar o novo like
    const like = new Like({
      participant: participantId,
      event: eventId
    });

    // Salvar o like
    await like.save();

    res.status(201).json({ msg: 'Like created successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Error creating like' });
  }
});

// Rota para obter todos os likes de um participante
router.get('/participants/:participantId/likes', checkParticipantToken, async (req, res) => {
  try {
    const participantId = req.params.participantId;

    // Verificar se o participante existe
    const participant = await Participant.findById(participantId);

    if (!participant) {
      res.status(404).json({ msg: 'Participant not found' });
      return;
    }

    // Obter os likes do participante
    const likes = await Like.find({ participant: participantId }).populate('event');

    res.json(likes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Error retrieving likes' });
  }
});

// Rota para excluir um like
router.delete('/likes/:likeId', checkParticipantToken, async (req, res) => {
  try {
    const likeId = req.params.likeId;

    // Verificar se o like existe
    const like = await Like.findById(likeId);

    if (!like) {
      res.status(404).json({ msg: 'Like not found' });
      return;
    }

    // Excluir o like
    await like.remove();

    res.json({ msg: 'Like deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Error deleting like' });
  }
});

module.exports = router;
