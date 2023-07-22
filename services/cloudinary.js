require('dotenv').config();
const cloudinary = require('cloudinary');
const upload = require('multer');

const fs = require('fs');

// Cloudinary Configuration 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (file, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(file, (error, res) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    url: res.url,
                    public_id: res.public_id,
                }, {
                    resource_type: "auto",
                    folder: folder
                })
            }
        });
    });
};

module.exports = {
    cloudinary,
    uploadToCloudinary,
};
