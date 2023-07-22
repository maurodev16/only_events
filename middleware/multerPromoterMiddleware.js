const multer = require('multer');
const path = require('path')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = path.resolve(__dirname, '..', 'uploads', 'files', 'images', 'logos')
        cb(null, destinationPath)
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
    }
});

//file validation

const fileFilter = (req, file, cb) => {
    // Verificar se o tipo do arquivo é válido
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        // Rejeitar o arquivo
        cb(new Error('Unsupported Image Format, only JPEG and    PNG can be supported.'), false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5  // Limite de 5MB
    },
    fileFilter: fileFilter
});

module.exports = upload;