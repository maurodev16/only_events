// postRoutes.js
import Post from "../models/Posts.js";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
const router = express.Router();
import User from '../models/User.js';
import Establishment from "../models/Establishment/Establishment.js";
import muiltiImagesMiddleware from "../middleware/multiImagesMiddleware.js"
import checkToken from '../middleware/checkToken.js';
import configureCloudinary from "../services/Cloudinary/cloudinary_config.js";
configureCloudinary();
import { v2 as cloudinary } from "cloudinary";

// Rota para criar uma nova postagem
router.post("/create-post/:establishmentObjId", muiltiImagesMiddleware.array('images'), async (req, res) => {
  try {
    const establishmentObjId = req.params.establishmentObjId;
    const files =  req.files; // Imagens enviadas na solicitação
     console.log(req.files)
    const { content, eventType, products, tags, location, expirationDate, eventStartTime, eventEndTime, isRecurring } = await req.body; // Dados da postagem enviados no corpo da solicitação

    // Verifique se o estabelecimento existe
    const establishmentExists = await Establishment.findById(establishmentObjId);
    if (!establishmentExists) {
      return res.status(404).json({ error: "Establishment not Found." });
    }
    // Verifique se o tipo de evento é válido (opcional)
    const validEventTypes = ["Concert", "Party", "Promotion", "Other"];
    if (eventType && !validEventTypes.includes(eventType)) {
      return res.status(400).json({ error: "Tipo de evento inválido." });
    }

    // Check if photos for the gallery have been sent
    // Verifique se foram enviadas imagens
    if (!files || files.length === 0) {
      return res.status(400).send("Nenhuma imagem fornecida");
    }

    // Crie uma nova instância de Post com os dados fornecidos
    const post = new Post({
      content: content,
    });
   
    // Salve a nova postagem no banco de dados
    const newPost = await post.save();
    // Faça upload das imagens para o Cloudinary e obtenha os URLs seguros
    const uploadedImageUrls = [];
    for (const file of files) {

      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
        allowed_formats: ["jpg", "jpeg", "png"],
        folder: `wasGehtAb-folder/allEstablishments/${establishmentObjId}/${establishmentExists.establishmentName}/posts/${newPost._id}/${newPost.createdAt}`,
        overwrite: false,
        upload_preset: "wasGehtAb_preset",
        transformation: [{ width: 500, height: 500, crop: "limit" }],
        unique_filename: true,
      }
      );

      if (!result.secure_url) {
        return res.status(500).send("Erro ao fazer upload das imagens para o Cloudinary");
      }
      uploadedImageUrls.push(result.secure_url);

    }
    newPost.mediaUrls = uploadedImageUrls;
   await newPost.save()

   console.log(newPost)
    res.status(201).json({ post: newPost });

  } catch (error) {
console.log(error)
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


