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
/////
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
        return res.status(404).send('No establishment found for the specified company type');
      }
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: 1 }
    };

    // Execute a consulta
    const posts = await Post.paginate(query, options);

    if (posts.docs.length === 0) {
      return res.status(404).send('Posts not found');
    }

    return res.status(200).json({
      posts: posts.docs,
      total: posts.totalDocs,
      totalPages: posts.totalPages,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


router.post("/create-post/:establishmentObjId", singleBannerPostMiddleware.single("file",{name:"file"}),  async  function (req, res, next) {
  try {
    const file = req.file; // Imagem enviada na solicitação
    const establishmentObjId = req.params.establishmentObjId;
    const { content, eventType, products, tags, location, expirationDate, eventStartTime, eventEndTime, isRecurring } = await req.body; // Dados da postagem enviados no corpo da solicitação
    console.log("1::: establishment ID", establishmentObjId)
    console.log("IMAGE:::", file)

    // Verificar se o estabelecimento existe
    const establishment = await Establishment.findById(establishmentObjId);
    if (!establishment) {
      console.log("2::: establishment", establishment)
      console.log("3::: establishmentObjId", establishmentObjId)

      return res.status(404).json({ error: "Establishment not found." });
    }

    // Check if photos for the gallery have been sent
    // Verificar se foram enviadas imagens
    if (!file) {
      return res.status(400).json({error:"No images provided."});
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
    });

    if (!result.secure_url) {
      console.log("5::: result", result)
      return res.status(500).json({error:"Error uploading image"});
    }
    var bannerUrl = result.secure_url;

    newPost.mediaUrl = bannerUrl;
    await newPost.save();

    res.status(201).json({ post: createdPost });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating post." });
  }
});



// Rota para buscar todos os posts
router.get("/get-posts", async (req, res) => {
  try {

    const posts = await Post.find()
      // .populate('likeObjIds', 'user')
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


