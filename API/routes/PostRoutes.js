import mongoose from "mongoose";
import Post from "../models/Posts.js";
import User from '../models/User.js';
import Like from '../models/Likes.js';
import dotenv from "dotenv";
import express from "express";
import Establishment from "../models/Establishment/Establishment.js";
import logoMiddleware from "../middleware/logoMiddleware.js"
import checkToken from '../middleware/checkToken.js';
import uploadImageToCloudinary from "../services/Cloudinary/uploadImage_to_cloudinary.js";
import configureCloudinary from "../services/Cloudinary/cloudinary_config.js";
import { v2 as cloudinary } from "cloudinary";
configureCloudinary();
dotenv.config();
const router = express.Router();

/////

router.post("/create-post/:establishmentObjId", logoMiddleware.single("file"), async (req, res) => {
  const file = req.file; // Imagem enviada na solicitação
  const establishmentObjId = req.params.establishmentObjId;
  console.log("establishmentObjId", establishmentObjId)
  try {
    const postData = await req.body;

    console.log("content", postData.content)

    // Verificar se o estabelecimento existe
    const establishment = await Establishment.findById(establishmentObjId);
    console.log("establishment", establishment)

    if (!establishment) {
      console.log("2::: establishment", establishment)
      console.log("3::: establishmentObjId", establishmentObjId)
      return res.status(404).json({ error: "Establishment not found." });
    }
    console.log("file up", file)

    // Check if photos for the gallery have been sent
    if (!file || file.length === 0) {
      return res.status(400).json({ error: "No File provided." });
    }
    console.log("file down", file)

    const file_name = `${file.originalname.split(".")[0]}`;
 
    const post = new Post({
      establishmentObjId: establishmentObjId,
      content: postData.content,
      eventType: postData.eventType,
      products: postData.products,
      tags: postData.tags,
      likes:postData.likes,
      likesCount:postData.likesCount,
      likesCount: postData.likesCount,
      favorites:postData.favorites,
      favoritesCount: postData.favoritesCount,
      location: postData.location,
      postStatus: postData.postStatus,
      expirationDate: postData.expirationDate,
      eventStartTime: postData.eventStartTime,
      eventEndTime: postData.eventEndTime,
      isRecurring: postData.isRecurring,
      comments:postData.comments,
    });
    const newPost = await post.save();
    console.log("newPost", newPost)

    // // Envio do arquivo para o Cloudinary
    const result_mediaUrl = await uploadImageToCloudinary(file.path,establishmentObjId, "post", newPost._id)
    newPost.mediaUrl = result_mediaUrl;
    await newPost.save();
    res.status(201).json({ post: newPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating post." });
  }
});


///*
router.get('/get-posts-with-filters', async (req, res) => {
  try {
    const { cityName, companyType, page = 1, limit = 10 } = req.query;
    let query = {}; // Inicie a consulta como uma consulta vazia

    // Verifique se cityName e companyType estão presentes na solicitação
    if (cityName && companyType) {
      // Encontre o estabelecimento com base no nome da cidade e no tipo de empresa
      const establishment = await Establishment.findOne({ cityName, companyType });

      if (establishment) {
        // Se o estabelecimento for encontrado, filtre as postagens por esse estabelecimento
        query.establishmentObjId = establishment._id;
      } else {
        // Se não houver um estabelecimento correspondente, retorne 404
        return res.status(404).send('No establishment found for the specified city and company type');
      }
    } else if (cityName) {
      // Se apenas o cityName estiver presente, filtre as postagens pelo nome da cidade
      const establishment = await Establishment.findOne({ cityName });

      if (establishment) {
        query.establishmentObjId = establishment._id;
      } else {
        // Se não houver um estabelecimento com o nome da cidade fornecido, traga todas as postagens
        query = {};
      }
    } else if (companyType) {
      // Se apenas o companyType estiver presente, filtre as postagens pelo tipo de empresa
      const establishments = await Establishment.find({ companyType });

      if (establishments.length > 0) {
        // Se houver estabelecimentos correspondentes, pegue os IDs e filtre as postagens por esses IDs
        const establishmentIds = establishments.map(est => est._id);
        query.establishmentObjId = { $in: establishmentIds };
      } else {
        // Se não houver estabelecimentos correspondentes, retorne 404
        return res.status(404).json({ error: 'No establishment found for the specified company type' });
      }
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }// Ordena os posts por data de criação em ordem decrescente

    };

    // Execute a consulta, populando os dados do estabelecimento
    const posts = await Post.paginate(query, options);

    if (posts.docs.length === 0) {
      return res.status(404).send('Posts not found');
    }

    // Array para armazenar os posts populados com os dados do estabelecimento
    const populatedPosts = [];

    // Popula cada documento de post individualmente
    for (const post of posts.docs) {
      // Use o ID do estabelecimento de cada post para encontrar os dados do estabelecimento
      const establishment = await Establishment.findById(post.establishmentObjId).select('-password').select('-__v');
      if (establishment) {
        // Popula a contagem de likes
        const likesCount = await Like.countDocuments({ postObjId: post._id });
        //Crie um novo objeto post com o campo de estabelecimento populado e a contagem de likes
        const populatedPost = { ...post.toObject(), establishmentObjId: establishment, likesCount };
        // Adicione o post populado ao array de posts populados
        populatedPosts.push(populatedPost);
      }
    }

    // Retorna os posts populados
    return res.status(200).json({
      posts: populatedPosts,
      total: posts.totalDocs,
      totalPages: posts.totalPages,
    });

  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;


