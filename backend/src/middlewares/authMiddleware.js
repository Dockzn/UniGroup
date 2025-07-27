const jwt = require('jsonwebtoken');


const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        // Se não houver token, apenas continua sem identificar o usuário
        if (!authHeader) {
            console.log('Token não fornecido, mas acesso permitido');
            return next();
        }
        
        const parts = authHeader.split(' ');
        // Se o formato estiver errado, apenas continua sem identificar o usuário
        if (parts.length !== 2) {
            console.log('Formato de token inválido, mas acesso permitido');
            return next();
        }
        
        const [scheme, token] = parts;
        
        // Se o formato estiver errado, apenas continua sem identificar o usuário
        if (!/^Bearer$/i.test(scheme)) {
            console.log('Formato de token inválido, mas acesso permitido');
            return next();
        }
        
        // Tenta verificar o token, mas permite acesso mesmo em caso de falha
        jwt.verify(token, process.env.JWT_SECRET || 'unigroup_default_secret', (err, decoded) => {
            if (err) {
                console.log('Token inválido ou expirado, mas acesso permitido');
                return next();
            }
            
            // Se o token for válido, identifica o usuário
            req.user = decoded;
            return next();
        });
    } catch (error) {
        return res.status(500).json({ 
            message: 'Erro ao autenticar usuário',
            error: error.message
        });
    }
};

module.exports = authMiddleware;
