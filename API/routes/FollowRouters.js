import mongoose from "mongoose";
import { Router } from "express";
import Follower from "../models/Followers.js";
import Establishment from "../models/Establishment/Establishment.js";
import User from "../models/User.js";
import checkToken from "../middleware/checkToken.js";

const router = Router();
// Configure o servidor Socket.IO

// Rota para seguir ou parar de seguir um estabelecimento
router.post("/:establishmentId/:userId", async (req, res) => {
  try {
    const { establishmentId, userId } = req.params;

    // Verifica se os IDs são válidos
    if (
      !mongoose.Types.ObjectId.isValid(establishmentId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid user or establishment ID" });
    }

    // Verifica se o estabelecimento existe e popula o campo details
    const establishment = await Establishment.findById(
      establishmentId
    ).populate("details");
    if (!establishment) {
      return res
        .status(404)
        .json({ success: false, message: "Establishment not found" });
    }

    // Verifica se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Verifica se o usuário já segue o estabelecimento
    const existingFollower = await Follower.findOne({
      establishment: establishmentId,
      user: userId,
    });

    if (existingFollower) {
      // Se o usuário já segue o estabelecimento, pare de seguir
      await Follower.findByIdAndDelete(existingFollower._id);
      establishment.details.followers.pull(existingFollower._id);
      establishment.details.followersCount--;
      await establishment.details.save();

      return res.status(200).json({
        isFollowed: false,
        message: `You stopped following ${establishment.establishmentName}`,
      });
    } else {
      // Se o usuário não segue o estabelecimento, comece a seguir
      const newFollower = new Follower({
        user: userId,
        establishment: establishmentId,
        isFollowed: true,
      });
      await newFollower.save();
      establishment.details.followers.push(newFollower._id);
      establishment.details.followersCount++;
      await establishment.details.save();

      return res.status(200).json({ Followed: newFollower });
    }
  } catch (error) {
    console.error("Error performing follow/unfollow action:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the request",
    });
  }
});

// Rota para obter os estabelecimentos seguidos por um usuário
router.get("/:userId/followed-establishments", async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Verifica se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
  
      // Encontra os registros de seguidores do usuário e popula o campo 'establishment'
      const followed = await Follower.find({
        user: userId,
        isFollowed: true,
      }).populate({
        path: "establishment",
        select: "establishmentName companyType cityName postalCode streetName number",
        populate: {
          path: "details", // Popula o campo 'details' do estabelecimento
          select: "logoUrl followersCount", // Adicione os campos de 'details' que deseja selecionar
        },
      }).populate({
        path: 'user', 
        select: 'nickname email'
      });
  
      // Se não houver seguidores, retornar uma lista vazia
      if (followed.length === 0) {
        return res.status(200).json({ followed: [] });
      }
  

  
      return res.status(200).json({ followed });
    } catch (error) {
      console.error("Error fetching followed establishments:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while processing the request",
      });
    }
  });
  

export default router;
