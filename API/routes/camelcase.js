import mongoose from "mongoose";
import { Router } from "express";
import MusicCategory from "../models/MusicCategory.js";
const router = Router();

router.post('/renomearCamelCaseMusicCategory', async (req, res) => {
  try {
    const cursor = MusicCategory.find().cursor();

    await cursor.eachAsync(async (documento) => {
      // Crie um objeto de renomeação usando o formato {$rename: { <field1>: <newName1>, <field2>: <newName2>, ... }}
      const operacaoRenomear = {
        music_category_name: 'musicCategoryName'
      };

      // Use findOneAndUpdate com $rename para renomear a chave diretamente no MongoDB
      await MusicCategory.findOneAndUpdate(
        { _id: documento._id },
        { $rename: operacaoRenomear },
        { new: true } // Retorna o documento atualizado
      );
    });

    res.json({ mensagem: 'Operação concluída com sucesso!' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ mensagem: 'Ocorreu um erro durante a operação.' });
  }
});

export default router;
