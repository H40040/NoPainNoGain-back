// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware para verificar token de autenticação
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Token de autenticação não informado' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        const message = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
        return res.status(401).json({ success: false, error: message });
      }
  
      try {
        // Buscar usuário completo no banco apenas com o userId do JWT
        const user = await User.findById(decoded.userId);
  
        if (!user || !user.isActive) {
          return res.status(401).json({ success: false, error: 'Usuário não encontrado ou inativo' });
        }
  
        // Informações adicionais do usuário são anexadas aqui
        req.userId = user._id;
        req.user = {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        };
  
        user.lastActivity = new Date();
        await user.save({ validateBeforeSave: false });
  
        next();
      } catch (error) {
        console.error('Erro ao autenticar usuário:', error);
        res.status(500).json({ success: false, error: 'Erro interno no servidor' });
      }
    });
  };
  

// Middleware para verificar permissões de acesso baseadas em roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Acesso não autorizado para este recurso'
            });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};
