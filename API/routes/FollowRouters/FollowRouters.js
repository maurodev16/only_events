import mongoose from "mongoose";
import { Router } from "express";
import Follower from "../../models/FollowModel/Followers.js";
import User from "../../models/UserModel/User.js";
import checkToken from "../../middleware/checkToken.js";

const router = Router();
// Configure o servidor Socket.IO

// Rota para seguir ou parar de seguir um companyelecimento
router.post("/:companyId/:userId", async (req, res) => {
  try {
    const { companyId, userId } = req.params;

    // Verifica se os IDs são válidos
    if (
      !mongoose.Types.ObjectId.isValid(companyId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid user or company ID" });
    }

    // Verifica se o companyelecimento existe e popula o campo details
    const company = await Company.findById(
      companyId
    ).populate("details");
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    // Verifica se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Verifica se o usuário já segue o companyelecimento
    const existingFollower = await Follower.findOne({
      company: companyId,
      user: userId,
    });

    if (existingFollower) {
      // Se o usuário já segue o companyelecimento, pare de seguir
      await Follower.findByIdAndDelete(existingFollower._id);
      company.details.followers.pull(existingFollower._id);
      company.details.followersCount--;
      await company.details.save();

      return res.status(200).json({
        isFollowed: false,
        message: `You stopped following ${company.companyName}`,
      });
    } else {
      // Se o usuário não segue o companyelecimento, comece a seguir
      const newFollower = new Follower({
        user: userId,
        company: companyId,
        isFollowed: true,
      });
      await newFollower.save();
      company.details.followers.push(newFollower._id);
      company.details.followersCount++;
      await company.details.save();

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

// Rota para obter os companyelecimentos seguidos por um usuário
router.get("/:userId/followed-companys", async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Verifica se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
  
      // Encontra os registros de seguidores do usuário e popula o campo 'company'
      const followed = await Follower.find({
        user: userId,
        isFollowed: true,
      }).populate({
        path: "company",
        select: "companyName companyType cityName postalCode streetName number",
        populate: {
          path: "details", // Popula o campo 'details' do companyelecimento
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
      console.error("Error fetching followed companys:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while processing the request",
      });
    }
  });
  

export default router;
