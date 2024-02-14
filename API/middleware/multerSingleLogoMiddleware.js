import multer from 'multer';

// Define the storage settings for multer
// const storage = multer.diskStorage({
//   // Define how the filename should be stored
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });


import multer from 'multer';

// Configure multer with the storage settings and file filter
const uploadSinglelogo = multer({
  limits: {
    // Limit the file size to 5MB
    fileSize: 1024 * 1024 * 5 // 5 Megabytes
  },
  // Define a function to filter the types of files allowed for upload
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload a valid image file'), false);
    }

    cb(null, true);
  }
});

export default uploadSinglelogo; // Export the configured multer middleware

