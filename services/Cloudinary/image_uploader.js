import cloudinary from 'cloudinary';
import { configureCloudinary } from './cloudinary_config';


configureCloudinary();

async function uploadImage(file) {
  try {
    if (!file || file.length === 0) {
      throw new Error("No image provided");
    }

    const public_id = `${file.originalname.split(".")[0]}`;
    const result = await cloudinary.uploader.upload(file.path, {
      allowed_formats: ["png", "jpg", "gif", "jpeg"],
      public_id: public_id,
      overwrite: false,
      upload_preset: "wasGehtAb_preset",
    });

    if (!result.secure_url) {
      throw new Error("Error uploading image");
    }

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error.message);
    throw error;
  }
}


export default { uploadImage };

// const deleteImageFromCloudinary = async (imageUrl) => {
//   try {
//     const publicId = imageUrl.match(/\/([^/]+)\.[a-z]+$/i)[1]; // Extrai o public_id da URL
//     const result = await cloudinary.uploader.destroy(publicId);
//     return result.result === 'ok';
//   } catch (error) {
//     console.error('Error deleting image from Cloudinary:', error);
//     return false;
//   }
// };

//   export default { deleteImageFromCloudinary };
  
  
  