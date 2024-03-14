// Função para fazer upload da imagem para o Cloudinary
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const uploadImageToCloudinary = async (filePath, estabId, path1, id) => {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: `wasGehtAb-folder/allEstablishments/${estabId}/${path1}/${id}/`,
        resource_type: "auto",
        allowedFormats: ["jpg", "png", "jpeg"],
        public_id: `${id+Date.now()}`,
        overwrite: false,
        upload_preset: "wasGehtAb_preset",
      });
      if (!result.secure_url) {
        throw new Error("Error uploading image to cloudinary");
      }
  
      return result.secure_url;
    } catch (error) {
      throw error;
    }
  };
  export default  uploadImageToCloudinary;