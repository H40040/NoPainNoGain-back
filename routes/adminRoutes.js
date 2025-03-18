// backend/routes/adminRoutes.js
const express = require('express');
const User = require('../models/userModel');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Reusable error handler
const handleServerError = (res, error) => {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
};

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);
// Aplicar middleware de autorização para garantir que apenas admins possam acessar estas rotas
router.use(authorizeRoles('admin'));

// Listar usuários (with pagination)
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Get the page number from the query string (default to 1)
        const limit = parseInt(req.query.limit) || 10; // Get the limit from the query string (default to 10)
        const skip = (page - 1) * limit; // Calculate the number of documents to skip

        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);

        const users = await User.find()
            .select('-password') // Exclude password from the results
            .sort({ createdAt: -1 }) // Sort by creation date (newest first)
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total: totalUsers,
                    page,
                    totalPages,
                    limit
                }
            }
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Obter detalhes de um usuário específico
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }
        
        res.json({ success: true, data: user });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Atualizar status de um usuário (ativar/desativar)
router.put('/users/:id/status', async (req, res) => {
    try {
        const { isActive } = req.body;
        
        if (isActive === undefined) {
            return res.status(400).json({ success: false, error: 'Status não fornecido' });
        }
        
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            { isActive }, 
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }
        
        res.json({ 
            success: true, 
            data: user,
            message: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso`
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Obter estatísticas para o dashboard do admin
router.get('/statistics', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        
        // Usuários registrados nos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        
        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                newUsers
            }
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

module.exports = router;
