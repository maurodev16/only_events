// postRoutes.js
import Post from "../models/Posts.js";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
const router = express.Router();
import User from '../models/User.js';
import Establishment from "../models/Establishment.js";
import checkToken from '../middleware/checkToken.js';

// Rota para criar uma nova postagem
router.post("/create-post/:establishmentObjId", async (req, res) => {
  try {
    const establishmentObjId = req.params.establishmentObjId;
    const postData = req.body; // Dados da postagem enviados no corpo da solicitação

    // Verifique se o estabelecimento existe
    const establishmentExists = await Establishment.findById(establishmentObjId);
    if (!establishmentExists) {
      return res.status(404).json({ error: "Establishment not Found." });
    }

    // Verifique se o tipo de evento é válido (opcional)
    const validEventTypes = ["Concert", "Party", "Promotion", "Other"];
    if (postData.eventType && !validEventTypes.includes(postData.eventType)) {
      return res.status(400).json({ error: "Tipo de evento inválido." });
    }

    // Crie uma nova instância de Post com os dados fornecidos
    const newPost = new Post({ ...postData, establishmentObjId });

    // Salve a nova postagem no banco de dados
    const savedPost = await newPost.save();

    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar a postagem." });
  }
});

// Rota para buscar todos os posts
router.get("/get-posts", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('likeObjIds', 'user') 
      .populate({
        path: 'establishmentObjId',
        model: Establishment, 
        select: '-password',  
      });

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the request",
    });
  }
});

export default router;


