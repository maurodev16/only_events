import { Router } from 'express';
import Follower from '../models/Followers.js';
import Establishment from '../models/Establishment/Establishment.js';
import User from '../models/User.js';
import checkToken from '../middleware/checkToken.js';

const router = Router();

// Rota para dar like e dislike em um post
router.post("/:establishmentId/:userId", checkToken, async (req, res) => {
    try {
        const establishmentId = req.params.establishmentId;
        const userId = req.params.userId;

        // Verifica se o Establishment existe
        const establishment = await Establishment.findById(establishmentId);
        if (!establishment) {
            return res.status(404).json({ success: false, message: "Establishment not found" });
        }
        // Verifica se o User existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Verifica se o usuário já deu Followers neste Establishment
        const existingFollower = await Follower.findOne({ establishment: establishmentId, user: userId });

        if (existingFollower) {
            // Remove o Followers do schema Like
            await Follower.findByIdAndDelete(existingFollower._id);

            // Atualiza o array de Follower e o contador no Post correspondente
            establishment.followers.pull(existingFollower._id);
            establishment.followersCount--;
            await establishment.save();

            return res.status(200).json({
                following: false,
                message: `You stopped following ${establishment.establishmentName}`,
                userId: userId,
            });
        } else {
            // Adiciona um novo follower
            const newFollower = new Follower({ user: userId, establishment: establishmentId });
            await newFollower.save();
            // Atualiza o array de Follower e o contador no Post correspondente
            establishment.followers.push(newFollower._id);
            establishment.followersCount++;
            await establishment.save();

            return res.status(200).json({
                following: true,
                message: `Now you're following ${establishment.establishmentName}`,
                userId: userId,
            });
        }
    } catch (error) {
        console.error("Error performing Follow/Unfollowed action:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing the request",
        });
    }
});


// Rota para obter os estabelecimentos seguidos por um usuário
router.get("/:userId/followed-establishments", checkToken, async (req, res) => {
    try {
        const userId = req.params.userId;

        // Verifique se o User existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Encontre os registros de seguidores para o usuário
        const followers = await Follower.find({ user: userId });

        // Extraia os IDs dos estabelecimentos seguidos
        const followedEstablishmentIds = followers.map(follower => follower.establishment);

        // Encontre os estabelecimentos correspondentes aos IDs
        const followedEstablishments = await Establishment.find({ _id: { $in: followedEstablishmentIds } });

        return res.status(200).json({
            success: true,
            followedEstablishments: followedEstablishments,
        });
    } catch (error) {
        console.error("Error fetching followed establishments:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing the request",
        });
    }
});

// Exporte o router


export default router;
