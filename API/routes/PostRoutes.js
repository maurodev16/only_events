import mongoose from "mongoose";
import Post from "../models/Posts.js";
import User from '../models/User.js';
import Like from '../models/Likes.js';
import dotenv from "dotenv";
import express from "express";
import Establishment from "../models/Establishment/Establishment.js";
import logoMiddleware from "../middleware/logoMiddleware.js"
import checkToken from '../middleware/checkToken.js';
import uploadPostImageToCloudinary from "../services/Cloudinary/uploadPostImageToCloudinary.js";
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
      likes: postData.likes,
      likesCount: postData.likesCount,
      likesCount: postData.likesCount,
      favorites: postData.favorites,
      favoritesCount: postData.favoritesCount,
      location: postData.location,
      postStatus: postData.postStatus,
      expirationDate: postData.expirationDate,
      eventData: postData.eventData,
      eventStartTime: postData.eventStartTime,
      eventEndTime: postData.eventEndTime,
      isRecurring: postData.isRecurring,
      comments: postData.comments,
    });
    const newPost = await post.save();
    console.log("newPost", newPost)

    // // Envio do arquivo para o Cloudinary
    const result_mediaUrl = await uploadPostImageToCloudinary(file.path, establishmentObjId, establishment.establishmentName, newPost._id)
    newPost.mediaUrl = result_mediaUrl;
    await newPost.save();
    res.status(201).json({ post: newPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating post." });
  }
});

router.get('/get-profile-posts/:establishmentObjId', async (req, res) => {
  try {
    const establishmentObjId = req.params.establishmentObjId;
    const { page = 1, limit = 10 } = req.query;

    console.log("establishmentObjId", establishmentObjId);

    // Verificar se o estabelecimento existe
    const establishment = await Establishment.findById(establishmentObjId);
    console.log("establishment", establishment);

    if (!establishment) {
      console.log("2::: establishment", establishment);
      console.log("3::: establishmentObjId", establishmentObjId);
      return res.status(404).json({ error: "Establishment not found." });
    }

    const query = { establishmentObjId }; // Filtra os posts pelo ID do estabelecimento

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 } // Ordena os posts por data de criação em ordem decrescente
    };

    // Execute the query to find posts by establishment ID
    const posts = await Post.paginate(query, options);

    if (posts.docs.length === 0) {
      return res.status(404).json({ error: 'Posts not found' });
    }

    // Return the populated posts
    return res.status(200).json({
      posts: posts.docs,
      total: posts.totalDocs,
      totalPages: posts.totalPages,
    });

  } catch (error) {
    res.status(500).send(error.message);
  }
});


///
router.put("/edit-post/:establishmentObjId/:postId", logoMiddleware.single("file"), async (req, res) => {
  const file = req.file; // Imagem enviada na solicitação
  const postId = req.params.postId;
  const establishmentObjId = req.params.establishmentObjId;


  try {
    const postData = req.body;

    // Verificar se o post existe
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // Verificar se o estabelecimento existe
    const establishment = await Establishment.findById(establishmentObjId);
    if (!establishment) {
      return res.status(404).json({ error: "Establishment not found." });
    }

    // Verificar se o usuário é o proprietário do post
    if (post.establishmentObjId.toString() !== establishment._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to edit this post." });
    }

    // Construir um objeto com os campos que serão atualizados
    const updateFields = {};
    let unauthorizedUpdate = false; // Flag para identificar campos não autorizados
    Object.keys(postData).forEach((key) => {
      if (key === "establishmentObjId" || key === "likes" || key === "likesCount" || key === "favorites" || key === "favoritesCount" || key === "viewsCount" || key === "comments") {
        unauthorizedUpdate = true; // Definir a flag como true
        return; // Sair do loop imediatamente
      }

      // Adicionar o campo ao objeto de atualização
      updateFields[key] = postData[key];
    });
    // Verificar se uma atualização não autorizada foi encontrada
    if (unauthorizedUpdate) {
      return res.status(403).json({ error: "Unauthorized to edit this post." });
    }
    // Verificar se uma nova imagem foi enviada e fazer upload para o Cloudinary
    if (file) {
      // Faça upload da nova imagem para o Cloudinary
      const result_mediaUrl = await uploadPostImageToCloudinary(file.path, establishmentObjId, establishment.establishmentName, postId);
      updateFields.mediaUrl = result_mediaUrl;
    }

    // Atualizar o post no banco de dados
    const updatedPost = await Post.findOneAndUpdate({ _id: postId }, { $set: updateFields }, { new: true })
    .select("-likes")
    .select("-likesCount")
    .select("-favorites")
    .select("-favoritesCount")
    .select("-viewsCount")
    .select("-createdAt")
    .select("-comments")
    .select("-__v");

    res.status(200).json({ success: true, updatedPost:updatedPost  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating post." });
  }
});



//
router.get('/get-posts-with-filters', async (req, res) => {
  try {
    const { cityName, companyType, page = 1, limit = 10 } = req.query;
    let query = {}; // Initialize the query as an empty query

    // Check if cityName and companyType are present in the request
    if (cityName && companyType) {
      // Find the establishment based on the city name and company type
      const establishment = await Establishment.findOne({ cityName, companyType });

      if (establishment) {
        // If the establishment is found, filter the posts by this establishment
        query.establishmentObjId = establishment._id;
      } else {
        // If there is no corresponding establishment, return 404
        return res.status(404).send('No establishment found for the specified city and company type');
      }
    } else if (cityName) {
      // If only the cityName is present, filter the posts by the city name
      const establishment = await Establishment.findOne({ cityName });

      if (establishment) {
        query.establishmentObjId = establishment._id;
      } else {
        // If there is no establishment with the provided city name, bring all posts
        query = {};
      }
    } else if (companyType) {
      // If only the companyType is present, filter the posts by the company type
      const establishments = await Establishment.find({ companyType });

      if (establishments.length > 0) {
        // If there are corresponding establishments, get the IDs and filter the posts by those IDs
        const establishmentIds = establishments.map(est => est._id);
        query.establishmentObjId = { $in: establishmentIds };
      } else {
        // If there are no corresponding establishments, return 404
        return res.status(404).json({ error: 'No establishment found for the specified company type' });
      }
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 } // Sort the posts by creation date in descending order
    };

    // Execute the query, populating the establishment data and the details field
    const posts = await Post.paginate(query, options);

    if (posts.docs.length === 0) {
      return res.status(404).json({ error: 'Posts not found' });
    }

    // Array to store the posts populated with establishment data
    const populatedPosts = [];

    // Populate each post document individually
    for (const post of posts.docs) {
      // Use the establishment ID of each post to find the establishment data including details
      const establishment = await Establishment.findById(post.establishmentObjId)
        .select('-password -__v')
        .populate('details'); // Populating the details field
      if (establishment) {
        // Create a new post object with the populated establishment field and likes count
        const populatedPost = { ...post.toObject(), establishmentObjId: establishment };
        // Add the populated post to the array of populated posts
        populatedPosts.push(populatedPost);
      }
    }

    // Return the populated posts
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



