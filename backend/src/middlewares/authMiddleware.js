const jwt = require('jsonwebtoken');


const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }
        
        const parts = authHeader.split(' ');
        if (parts.length !== 2) {
            return res.status(401).json({ message: 'Formato de token inválido' });
        }
        
        const [scheme, token] = parts;
        
        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ message: 'Formato de token inválido' });
        }
        
        jwt.verify(token, process.env.JWT_SECRET || 'unigroup_default_secret', (err, decoded) => {
            if (err) {
                return res.status(401).json({ 
                    message: 'Token inválido ou expirado',
                    error: err.message
                });
            }
            
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
