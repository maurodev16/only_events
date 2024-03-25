// models/PostView.js
import mongoose from 'mongoose';

const postViewSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Se desejar rastrear visualizações de usuários autenticados
    ipAddress: { type: String }, // Se desejar rastrear visualizações por endereço IP
    userAgent: { type: String }, // Se desejar rastrear visualizações por agente do usuário
    createdAt: { type: Date, default: Date.now },
});

const PostView = mongoose.model('PostView', postViewSchema);

export default PostView;
