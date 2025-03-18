const User = require("../models/userModel");
const bcrypt = require('bcryptjs');

// Reusable error handler
const handleServerError = (res, error) => {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id || req.userId;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao buscar usuário' });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Todos os campos são obrigatórios.'
            });
        }

        // Verifica se usuário já existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Este e-mail já está cadastrado.'
            });
        }

        const newUser = new User({ 
            name, email, password,
            role: 'user',
            isActive: true,
            lastLogin: new Date(),
            lastActivity: new Date()
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso!',
            user: newUser
        });
    } catch (error) {
        handleServerError(res, error);
    }
};


// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'Perfil não encontrado' });
        }
        
        // Atualizar lastActivity
        await User.findByIdAndUpdate(userId, { lastActivity: new Date() });
        
        res.json({ success: true, user });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const updateData = req.body;
        
        // Não permitir atualização de email ou senha por esta rota
        delete updateData.email;
        delete updateData.password;
        delete updateData.role;
        delete updateData.isActive;
        
        // Atualizar lastActivity
        updateData.lastActivity = new Date();
        
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }
        
        res.json({ success: true, message: 'Perfil atualizado com sucesso', user });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (const key in error.errors) {
                validationErrors[key] = error.errors[key].message;
            }
            return res.status(400).json({ success: false, error: 'Erro de validação', details: validationErrors });
        }
        handleServerError(res, error);
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.userId;
        const { password: newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'Senha atual e nova senha são obrigatórias' 
            });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }
        
        // Verificar senha atual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Senha atual incorreta' });
        }
        
        // Atualizar senha e lastActivity
        user.password = newPassword;
        user.lastActivity = new Date();
        await user.save();
        
        res.json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        // Verificar se o usuário é admin
        if (req.userRole !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                error: 'Acesso negado. Apenas administradores podem acessar esta rota.' 
            });
        }
        
        const users = await User.find().select('-password');
        res.json({ success: true, users });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Update user statistics
exports.updateStatistics = async (req, res) => {
    try {
        const userId = req.userId;
        const { statistics } = req.body;
        
        if (!statistics) {
            return res.status(400).json({ 
                success: false, 
                error: 'Dados de estatísticas são obrigatórios' 
            });
        }
        
        // Atualizar estatísticas e lastActivity
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { statistics },
                lastActivity: new Date()
            },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }
        
        res.json({ 
            success: true, 
            message: 'Estatísticas atualizadas com sucesso', 
            statistics: user.statistics 
        });
    } catch (error) {
        handleServerError(res, error);
    }
};
