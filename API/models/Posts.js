import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';
import Favorite from "./Favorite.js";
import Establishment from "./Establishment/Establishment.js";
import User from "./User.js";
import Like from "./Likes.js";

const postSchema = new mongoose.Schema({
    establishmentObjId: { type: mongoose.Schema.Types.ObjectId, ref: "Establishment" }, // Referência ao estabelecimento ao qual o post pertence.
    content: { type: String, required: true }, // O conteúdo do post (texto).
    mediaUrl: { type: String }, // URL de mídia (imagens, vídeos, etc.)
    eventType: { type: String }, // Tipo de evento (pode ser usado para filtrar por tipo)
    products: { type: [String], default: [] }, // Lista de produtos em destaque
    tags: { type: [String], default: [] }, // Lista de tags para categorizar o post (ex: #Evento, #Promoção)
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }], // Referência aos likes associados a este post
    likesCount: { type: Number, default: 0 },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Favorite" }], // Referência aos likes associados a este post
    favoritesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 }, // Contador de visualizações do post
    location: { type: String }, // Pode ser um endereço ou nome do local
    postStatus: { type: String, default: "active", enum: ["active", "inactive", "draft"] },
    expirationDate: { type: Date }, //Promoção Expirada:
    eventStartTime: { type: Date },
    eventEndTime: { type: Date },
    isRecurring: { type: Boolean, default: false }, // Evento que se repete sempre
    comments: [{
        userObjId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Referência ao modelo de usuário, se aplicável
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    }],
   
}, {
    timestamps: true,
});


postSchema.plugin(mongoosePaginate);

const Post = mongoose.model("Post", postSchema);

export default Post;
