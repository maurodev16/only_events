import multer from 'multer';


// Define a function to filter the types of files allowed for upload
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg', file.mimetype === 'image/png', file.mimetype === 'image/jpg') {
    cb(null, true);
  }  else {
        // If the MIME type is not allowed, reject the file
        cb({message:'Unsupported File Format, only JPEG, PNG end JPG can be supported.'}, false);
    }
};

// Configure multer with the storage settings and file filter
const muiltiImagesMiddleware = multer({
    storage: storage,
    limits: {
        // Limit the file size to 5MB
        fileSize: 1024 * 1024 * 5 // 5 Megabytes
    },
    fileFilter: fileFilter // Apply the file filter function
});

export default muiltiImagesMiddleware; // Export the configured multer middleware
