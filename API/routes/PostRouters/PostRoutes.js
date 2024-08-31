import mongoose from "mongoose";
import Post from "../../models/PostModel/Posts.js";
import User from "../../models/UserModel/User.js";
import Like from "../../models/LikeModel/Likes.js";
import dotenv from "dotenv";
import express from "express";
import logoMiddleware from "../../middleware/logoMiddleware.js";
import checkToken from "../../middleware/checkToken.js";
import uploadPostImageToCloudinary from "../../services/Cloudinary/uploadPostImageToCloudinary.js";
import configureCloudinary from "../../services/Cloudinary/cloudinary_config.js";
import { v2 as cloudinary } from "cloudinary";
configureCloudinary();
dotenv.config();
const router = express.Router();

/////

router.post(
  "/create-post/:companyObjId",
  logoMiddleware.single("file"),
  async (req, res) => {
    const file = req.file; // Imagem enviada na solicitação
    const companyObjId = req.params.companyObjId;
    console.log("companyObjId", companyObjId);
    try {
      const postData = await req.body;

      console.log("content", postData.content);

      // Verificar se o companyelecimento existe
      const company = await Company.findById(companyObjId);
      console.log("company", company);

      if (!company) {
        console.log("2::: company", company);
        console.log("3::: companyObjId", companyObjId);
        return res.status(404).json({ error: "Company not found." });
      }
      console.log("file up", file);

      // Check if photos for the gallery have been sent
      if (!file || file.length === 0) {
        return res.status(400).json({ error: "No File provided." });
      }
      console.log("file down", file);

      const file_name = `${file.originalname.split(".")[0]}`;

      const post = new Post({
        companyObjId: companyObjId,
        content: postData.content,
        eventType: postData.eventType,
        products: postData.products,
        tags: postData.tags,
        likes: postData.likes,
        likesCount: postData.likesCount,
        likesCount: postData.likesCount,
        favorites: postData.favorites,
        favoritesCount: postData.favoritesCount,
        cityName: postData.cityName,
        postalCode: postData.postalCode,
        streetName: postData.streetName,
        number: postData.number,
        postStatus: postData.postStatus,
        expirationDate: postData.expirationDate,
        eventStartDate: postData.eventStartDate,
        eventStartTime: postData.eventStartTime,
        eventEndTime: postData.eventEndTime,
        isRecurring: postData.isRecurring,
        comments: postData.comments,
      });
      const newPost = await post.save();
      console.log("newPost", newPost);

      // // Envio do arquivo para o Cloudinary
      const result_mediaUrl = await uploadPostImageToCloudinary(
        file.path,
        companyObjId,
        company.companyName,
        newPost._id
      );
      newPost.mediaUrl = result_mediaUrl;
      await newPost.save();
      res.status(201).json({ post: newPost });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating post." });
    }
  }
);

router.get("/get-profile-posts/:companyObjId", async (req, res) => {
  try {
    const companyObjId = req.params.companyObjId;
    const { page = 1, limit = 10 } = req.query;

    console.log("companyObjId", companyObjId);

    // Verificar se o companyelecimento existe
    const company = await Company.findById(companyObjId);
    console.log("company", company);

    if (!company) {
      console.log("2::: company", company);
      console.log("3::: companyObjId", companyObjId);
      return res.status(404).json({ error: "Company not found." });
    }

    const query = { companyObjId }; // Filtra os posts pelo ID do companyelecimento

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }, // Ordena os posts por data de criação em ordem decrescente
    };

    // Execute the query to find posts by company ID
    const posts = await Post.paginate(query, options);

    if (posts.docs.length === 0) {
      return res.status(404).json({ error: "Posts not found" });
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
router.put(
  "/edit-post/:companyObjId/:postId",
  logoMiddleware.single("file"),
  async (req, res) => {
    const file = req.file; // Imagem enviada na solicitação
    const postId = req.params.postId;
    const companyObjId = req.params.companyObjId;

    try {
      const postData = req.body;

      // Verificar se o post existe
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found." });
      }

      // Verificar se o companyelecimento existe
      const company = await Company.findById(companyObjId);
      if (!company) {
        return res.status(404).json({ error: "Company not found." });
      }

      // Verificar se o usuário é o proprietário do post
      if (post.companyObjId.toString() !== company._id.toString()) {
        return res
          .status(403)
          .json({ error: "Unauthorized to edit this post." });
      }

      // Construir um objeto com os campos que serão atualizados
      const updateFields = {};
      let unauthorizedUpdate = false; // Flag para identificar campos não autorizados
      Object.keys(postData).forEach((key) => {
        if (
          key === "companyObjId" ||
          key === "likes" ||
          key === "likesCount" ||
          key === "favorites" ||
          key === "favoritesCount" ||
          key === "viewsCount" ||
          key === "comments"
        ) {
          unauthorizedUpdate = true; // Definir a flag como true
          return; // Sair do loop imediatamente
        }

        // Adicionar o campo ao objeto de atualização
        updateFields[key] = postData[key];
      });
      // Verificar se uma atualização não autorizada foi encontrada
      if (unauthorizedUpdate) {
        return res
          .status(403)
          .json({ error: "Unauthorized to edit this post." });
      }
      // Verificar se uma nova imagem foi enviada e fazer upload para o Cloudinary
      if (file) {
        // Faça upload da nova imagem para o Cloudinary
        const result_mediaUrl = await uploadPostImageToCloudinary(
          file.path,
          companyObjId,
          company.companyName,
          postId
        );
        updateFields.mediaUrl = result_mediaUrl;
      }

      // Atualizar o post no banco de dados
      const updatedPost = await Post.findOneAndUpdate(
        { _id: postId },
        { $set: updateFields },
        { new: true }
      )
        .select("-likes")
        .select("-likesCount")
        .select("-favorites")
        .select("-favoritesCount")
        .select("-viewsCount")
        .select("-createdAt")
        .select("-comments")
        .select("-__v");

      res.status(200).json({ success: true, updatedPost: updatedPost });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating post." });
    }
  }
);

//get-posts-with-filters
router.get("/get-posts-with-filters", async (req, res) => {
  try {
    const { cityName, postalCode, companyType, page = 1, limit = 10 } = req.query;

    let postQuery = {};
    let companyQuery = {};

    // Filtragem pelo tipo de empresa
    if (companyType) {
      const companyTypes = companyType.split(",");
      companyQuery.companyType = { $in: companyTypes };
    }

    // Filtros de localização nos posts
    if (cityName) {
      postQuery.cityName = cityName;
    }
    if (postalCode) {
      postQuery.postalCode = postalCode;
    }

    // Busca de IDs de empresas que correspondem aos critérios
    if (Object.keys(companyQuery).length > 0 || cityName || postalCode) {
      const companies = await User.find(companyQuery)
        .select("_id cityName postalCode")
        .lean();

      if (companies.length > 0) {
        const companyIds = companies.map((company) => company._id);
        postQuery.companyObjId = { $in: companyIds };
      } else {
        return res.status(404).json({ error: "No matching companies found." });
      }
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: {
        path: "companyObjId",
        select: "-password -__v -passwordResetToken -passwordResetTokenExpires",
      },
    };

    const posts = await Post.paginate(postQuery, options);

    if (posts.docs.length === 0) {
      return res.status(404).json({ error: "Posts not found" });
    }

    res.status(200).json({
      posts: posts.docs,
      total: posts.totalDocs,
      totalPages: posts.totalPages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;
