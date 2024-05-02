// Função para fazer upload da imagem para o Cloudinary
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const uploadPostImageToCloudinary = async (filePath, estabId, estanName, postId) => {
    try {
         // Verifica se já existe uma imagem na pasta específica
      const folderPath = `was_geht_ab_project/establishments/${estabId}/${estanName}/posts/${postId}`;
  
      // Faz o upload da nova imagem
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folderPath,
        resource_type: "auto",
        allowedFormats: ["jpg", "png", "jpeg"],
        public_id: `${estabId+Date.now()}`,
        overwrite: false,
        upload_preset: "wasGehtAb_preset",
      });
      if (!result.secure_url) {
        throw new Error("Error uploading post image to cloudinary");
      }
  
      return result.secure_url;
    } catch (error) {
      throw error;
    }
  };
  export default  uploadPostImageToCloudinary;