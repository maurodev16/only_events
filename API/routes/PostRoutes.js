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

router.get('/get-posts-by-user-id', async (req, res) => {
  try {
    const { userId, page = 1, limit = 10 } = req.query;
    const query = { userId }; // Initialize the query with the userId

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 } // Sort the posts by creation date in descending order
    };

    // Execute the query to find posts by user ID
    const posts = await Post.paginate(query, options);

    if (posts.docs.length === 0) {
      return res.status(404).json({ error: 'Posts not found' });
    }

    // Array to store the populated posts
    const populatedPosts = [];

    // Populate each post document individually
    for (const post of posts.docs) {
      // Use the establishment ID of each post to find the establishment data
      const establishment = await Establishment.findById(post.establishmentObjId).select('-password').select('-__v');
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

    // Execute the query, populating the establishment data
    const posts = await Post.paginate(query, options);

    if (posts.docs.length === 0) {
      return res.status(404).json({ error: 'Posts not found' });
    }

    // Array to store the posts populated with establishment data
    const populatedPosts = [];

    // Populate each post document individually
    for (const post of posts.docs) {
      // Use the establishment ID of each post to find the establishment data
      const establishment = await Establishment.findById(post.establishmentObjId).select('-password').select('-__v');
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



