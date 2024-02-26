import mongoose from "mongoose";

import Post from "../models/Posts.js";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
const router = express.Router();
import User from '../models/User.js';
import Establishment from "../models/Establishment/Establishment.js";
import singleBannerPostMiddleware from "../middleware/multiImagesMiddleware.js"
import checkToken from '../middleware/checkToken.js';
import configureCloudinary from "../services/Cloudinary/cloudinary_config.js";
configureCloudinary();
import { v2 as cloudinary } from "cloudinary";

// Rota para criar uma nova postagem
router.post("/create-post", singleBannerPostMiddleware.single('banner'), async (req, res) => {
  try {
    const file = req.file; // Imagem enviada na solicitação
    const { establishmentObjId, content, eventType, products, tags, location, expirationDate, eventStartTime, eventEndTime, isRecurring } = await req.body; // Dados da postagem enviados no corpo da solicitação

    // Verificar se o estabelecimento existe
    const establishment = await Establishment.findById(establishmentObjId);
    if (!establishment) {
      return res.status(404).json({ error: "Estabelecimento não encontrado." });
    }

    // Check if photos for the gallery have been sent
    // Verificar se foram enviadas imagens
    if (!file || file.length === 0) {
      return res.status(400).send("Nenhuma imagem fornecida");
    }

    // Criar uma nova instância do modelo de postagem
    const newPost = new Post({
      establishmentObjId: establishmentObjId,
      content,
      eventType,
      products,
      tags,
      location,
      expirationDate,
      eventStartTime,
      eventEndTime,
      isRecurring,
    });

    // Salvar a nova postagem no banco de dados
    const createdPost = await newPost.save();

    // Fazer upload das imagens para o Cloudinary e obter os URLs seguros

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
      allowed_formats: ["jpg", "jpeg", "png"],
      folder: `wasGehtAb-folder/allEstablishments/${establishmentObjId}/${establishment.establishmentName}/posts/${newPost._id}/${newPost.createdAt}`,
      overwrite: false,
      upload_preset: "wasGehtAb_preset",
      transformation: [{ width: 500, height: 500, crop: "limit" }],
      unique_filename: true,
    });

    if (!result.secure_url) {
      return res.status(500).send("Erro ao fazer upload das imagens para o Cloudinary");
    }
    var bannerUrl = result.secure_url;

    newPost.mediaUrl = bannerUrl;
    await newPost.save();

    res.status(201).json({ post: createdPost });

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


