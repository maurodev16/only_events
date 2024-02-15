import multer from 'multer';

// Configuração do Multer
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported Image Format, only JPEG, PNG, and JPG can be supported.'), false);
  }
};

const uploadSingleLogo = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limite de 5MB
  },
  fileFilter: fileFilter,
}).single('file'); // Adiciona o método .single() para lidar com apenas um arquivo por vez

// Middleware para lidar com o upload de arquivos e seus erros
const handleUpload = async (req, res, next) => {
  try {
    // Aguarde o upload do arquivo
    uploadSingleLogo(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Erros do Multer
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).send('File size exceeds the limit.');
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).send('Exceeded the maximum number of files allowed.');
        }
        if (err.code === 'LIMIT_PART_COUNT') {
          return res.status(400).send('Exceeded the maximum number of parts allowed in a multipart body.');
        }
        return res.status(500).send('Multer error occurred.');
      } else if (err) {
        // Outros erros
        console.error('Error during file upload:', err);
        return res.status(500).send('An unexpected error occurred.');
      }
      next(); // Passa para o próximo middleware se não houver erros
    });
  } catch (error) {
    // Erro durante o upload
    console.error('Error during file upload:', error);
    return res.status(500).send('An unexpected error occurred.');
  }
};



export default handleUpload;
