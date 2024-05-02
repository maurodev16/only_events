// Função para fazer upload da imagem para o Cloudinary
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const uploadLogoToCloudinary = async (filePath, estabId, estanName) => {
    try {
         // Verifica se já existe uma imagem na pasta específica
      const folderPath = `was_geht_ab_project/establishments/${estabId}/${estanName}/logo/`;

      const resources = await cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath
      });

      // Se houver uma imagem na pasta, exclua-a
      if (resources.resources.length>0) {
        const publicIds = resources.resources.map(resource=>resource.public_id);
        await cloudinary.api.delete_resources(publicIds);
      }
    
      // Faz o upload da nova imagem

      const result = await cloudinary.uploader.upload(filePath, {
     
        folder: `was_geht_ab_project/establishments/${estabId}/${estanName}/logo/`,
        resource_type: "auto",
        allowedFormats: ["jpg", "png", "jpeg"],
        public_id: `${estabId+Date.now()}`,
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
  export default  uploadLogoToCloudinary;