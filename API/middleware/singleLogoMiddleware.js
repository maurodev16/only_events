import multer from 'multer';

// Storage 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../images"));
    },
    filename: function (req, file, cb) {
        if (file) {
            cb(null, new Date().toISOString().replace(/:/g, "-")
                + file.originalname);
        } else {
            cb(null, false);
        }
    }
});


const singleLogoMiddleware = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image")) {
            cb(null, true);
        } else {
            cb({ message: "Unsupported file format" }, false);
        }
    },
    limits: { fileSize: 1024 * 1024 * 5 }, // 1 megabyte
});


console.log("singleLogoMiddleware:::", singleLogoMiddleware)



export default singleLogoMiddleware; // Export the configured multer middleware
