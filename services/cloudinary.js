const cloudinary = require('cloudinary').v2;

const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    const publicId = imageUrl.match(/\/([^/]+)\.[a-z]+$/i)[1]; // Extrai o public_id da URL
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

  module.exports = { deleteImageFromCloudinary };
  
  
  
  