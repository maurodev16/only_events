import mongoose from "mongoose";
import Establishment from "./Establishment.js";
import User from "./User.js";
import Like from "./Likes.js";
const postSchema = new mongoose.Schema({
    establishmentObjId: { type: mongoose.Schema.Types.ObjectId, ref: "Establishment" },//Referência ao estabelecimento ao qual o post pertence.
    content: { type: String, required: true },//O conteúdo do post (texto).
    mediaUrls: { type: [String] },// Lista de URLs de mídia (imagens, vídeos, etc.)
    eventType: { type: String },// Tipo de evento (pode ser usado para filtrar por tipo)
    products: { type: [String] },// Lista de produtos em destaque
    tags: { type: [String] }, // Lista de tags para categorizar o post (ex: #Evento, #Promoção)
    likesCount: { type: Number, default: 0 },
    location: { type: String }, // Pode ser um endereço ou nome do local
    postStatus: { type: String, default: "active", enum: ["active", "inactive", "rascunho"] },
    expirationDate: { type: Date },//Promoção Expirada:
    eventStartTime: { type: Date },
    eventEndTime: { type: Date },
    isRecurring: { type: Boolean, default: false },// Evento que se repete sempre
    comments: [{
        userObjId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Referência ao modelo de usuário, se aplicável
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    }],
},
    {
        timestamps: true,
    }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
