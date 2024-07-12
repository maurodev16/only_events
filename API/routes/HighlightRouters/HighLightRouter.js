import mongoose from "mongoose";
import { Router } from "express";
import Establishment from "../../models/Establishment/Establishment.js";
import Post from "../../models/Posts.js";

const router = Router();

router.get("/fetch-highlight-posts", async (req, res) => {
  try {
    // Calcular a data de 24 horas atrás
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 3); // Ajuste para 24 horas atrás

    // Encontrar postagens feitas nas últimas 24 horas
    const recentPosts = await Post.find({
      createdAt: { $gte: yesterday },
    }).populate({
      path: "establishmentObjId",
      select: "establishmentName companyType details", // Selecionar apenas campos necessários
      populate: {
        path: "details",
        select: "logoUrl", // Selecionar apenas o campo "logoUrl"
        
      },
    });

    console.log(recentPosts);

    if (recentPosts.length === 0) {
      return res
        .status(404)
        .json({ error: "No posts found in the last 24 hours" });
    }

    // Agrupar postagens por estabelecimento
    const establishmentsWithRecentPosts = recentPosts.reduce((acc, post) => {
      const establishmentId = post.establishmentObjId._id;
      if (!acc[establishmentId]) {
        acc[establishmentId] = {
          establishment: {
            _id: post.establishmentObjId._id,
            establishmentName: post.establishmentObjId.establishmentName,
            companyType: post.establishmentObjId.companyType,
            details: post.establishmentObjId.details,
          },
          posts: [],
        };
      }
      acc[establishmentId].posts.push({
        _id: post._id,
        content: post.content,
        products: post.products,
        tags: post.tags,
        likes: post.likes,
        likesCount: post.likesCount,
        favorites: post.favorites,
        favoritesCount: post.favoritesCount,
        viewsCount: post.viewsCount,
        postStatus: post.postStatus,
        isRecurring: post.isRecurring,
        comments: post.comments,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        mediaUrl: post.mediaUrl,
      });
      return acc;
    }, {});

    // Converter o resultado em um array para facilitar o retorno
    const result = Object.values(establishmentsWithRecentPosts);

    // Retornar o resultado
    return res.status(200).json({ highlightPosts: result });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

export default router;
