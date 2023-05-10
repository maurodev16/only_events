require('dotenv').config()
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

//Funcao midleware para bloquear as rotas sem token
function checkToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    //     if (authHeader && authHeader.startsWith('Bearer ')) {
    //   const token = authHeader.split(' ')[1];
    //   // Restante do código de validação do token...
    // } 

    if (!token) {
        return res.status(401).json({ auth: false, msg: 'Token não informado.' });
    }

    jwt.verify(token, SECRET_KEY, function (err, decoded) {
        if (err) {
            return res.status(500).json({ auth: false, msg: 'Falha ao autenticar o token.' });
        }

        // Se o token for válido, salva o ID do usuário na requisição
        req.userId = decoded.id;
        next();
    });
}

module.exports = checkToken;