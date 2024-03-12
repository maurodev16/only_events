import multer from 'multer';
import path from 'path';
//Set Storage Engine
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    console.log("storage::::", req.file);
    cb(null, file.fieldname + '-' + Date.now() +
      path.extname(file.originalname));
  }
});

// Define a function to filter the types of files allowed for upload
const fileFilter = (req, file, cb) => {
  console.log("fileFilter:::", req.file);
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb({ message: 'Unsupported File Format, only JPEG, PNG end JPG can be supported.' }, false);
  }

};

// Configure multer with the storage settings and file filter
const postMediaMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export default postMediaMiddleware; 
