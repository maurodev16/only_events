import { Router } from 'express';
import Like from '../models/Likes.js';
import Establishment from '../models/Establishment.js';
import checkToken from '../middleware/checkToken.js';

const router = Router();


// Rota para dar um like e Dislike a um establishment
router.post("/:establishmentId", checkToken, async (req, res) => {
  try {
    const establishmentId = req.params.id;
    const userId = req.auth._id;

    // Verifica se o establishment existe
    const establishment = await Establishment.findById(establishmentId);
    if (!establishment) {
      return res.status(404).json({ success: false, message: "Establishment not found" });
    }

    // Verifica se o usuário deu like a este establishment
    const existingLike = await Like.findOne({ user: userId, establishment: establishmentId });

    if (existingLike) {
      // Remove o like do schema Like
      await Like.findByIdAndDelete(existingLike._id);

      // Atualiza o array de likes e o contador no establishment correspondente
      establishment.likes.pull(existingLike._id);
      establishment.likes_count--;

      await establishment.save();

      return res.status(200).json({
        is_success: true,
        message: "Disliked",
      });
    } else {
      // Adiciona um novo like
      const newLike = new Like({ user: userId, establishment: establishmentId });
      await newLike.save();

      // Atualiza o array de likes e o contador no establishment correspondente
      establishment.likes.push(newLike._id);
      establishment.likes_count++;

      await establishment.save();

      return res.status(200).json({
        is_success: true,
        message: "Liked",
      });
    }
  } catch (error) {
    console.error("Error performing like/dislike action:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the request",
    });
  }
});

export default router;
