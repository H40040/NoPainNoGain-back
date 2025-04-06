// backend/middleware/authMiddleware.js
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const logger = require('../config/logger');

// Middleware para verificar token de autenticação
const authenticateToken = async (req, res, next) => {
  try {
    // 1. Verify token exists
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      logger.warn('Auth middleware: No token provided');
      return res.status(401).json({ 
        success: false, 
        error: 'Token de autenticação não fornecido' 
      });
    }

    // 2. Verify token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Validate token payload structure
    if (!decoded?.id) {
      logger.warn('Auth middleware: Invalid token payload', { payload: decoded });
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido' 
      });
    }

    // 4. Convert ID to ObjectId safely
    let userId;
    try {
      userId = mongoose.Types.ObjectId(decoded.id);
    } catch (err) {
      logger.error('Auth middleware: Invalid user ID format', { 
        id: decoded.id, 
        error: err.message 
      });
      return res.status(400).json({ 
        success: false, 
        error: 'ID de usuário inválido' 
      });
    }

    // 5. Find user
    const user = await User.findOne({ _id: userId, isActive: true });
    
    if (!user) {
      logger.warn('Auth middleware: User not found or inactive', { userId });
      return res.status(401).json({ 
        success: false, 
        error: 'Usuário não encontrado ou conta desativada' 
      });
    }

    // 6. Attach user to request
    req.user = user; // Now passing the full user object
    req.userId = user._id; // For backwards compatibility
    
    logger.debug('Auth middleware: User authenticated successfully', { 
      userId: user._id,
      email: user.email 
    });
    
    user.lastActivity = new Date();
    await user.save({ validateBeforeSave: false });
    next();
  } catch (err) {
    logger.error('Auth middleware: Authentication failed', { 
      error: err.message, 
      stack: err.stack 
    });
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Falha na autenticação' 
    });
  }
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
