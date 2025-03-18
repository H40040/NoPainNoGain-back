// backend/routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Reusable error handler
const handleServerError = (res, error) => {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
};

// Login tradicional para usuários
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email e senha são obrigatórios' 
            });
        }
        
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Usuário não encontrado.' 
            });
        }

        if (!user.isActive) {
            return res.status(403).json({ 
                success: false, 
                error: 'Conta desativada. Entre em contato com o suporte.' 
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                error: 'Senha incorreta.' 
            });
        }

        // Atualizar último login
        user.lastLogin = new Date();
        user.lastActivity = new Date();
        await user.save();

        // Gerar token JWT com mais informações do usuário
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email,
                name: user.name,
                role: user.role 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        // Retornar dados do usuário (exceto senha)
        const userData = user.toObject();
        delete userData.password;

        res.status(200).json({ 
            success: true, 
            token,
            user: userData
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Registro de novos usuários
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validação básica
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nome, email e senha são obrigatórios' 
            });
        }
        
        // Verificar se o email já está em uso
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ 
                success: false, 
                error: 'Este email já está em uso' 
            });
        }
        
        // Criar novo usuário
        const newUser = new User({
            name,
            email,
            password,
            role: 'user',
            isActive: true,
            createdAt: new Date(),
            lastLogin: new Date(),
            lastActivity: new Date()
        });
        
        await newUser.save();
        
        // Gerar token JWT
        const token = jwt.sign(
            { 
                id: newUser._id, 
                email: newUser.email,
                name: newUser.name,
                role: newUser.role 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        // Retornar dados do usuário (exceto senha)
        const userData = newUser.toObject();
        delete userData.password;
        
        res.status(201).json({ 
            success: true, 
            message: 'Usuário registrado com sucesso',
            token,
            user: userData
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Login para administradores
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email, role: 'admin' });
        
        if (!admin) {
            return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
        }
        
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
        }
        
        // Atualizar último login
        admin.lastLogin = new Date();
        admin.lastActivity = new Date();
        await admin.save();
        
        const token = jwt.sign({ 
            id: admin._id, 
            email: admin.email,
            name: admin.name,
            role: 'admin' 
        }, process.env.JWT_SECRET, { expiresIn: '8h' });
        
        // Retornar dados do admin (exceto senha)
        const adminData = admin.toObject();
        delete adminData.password;
        
        res.status(200).json({ 
            success: true, 
            token,
            user: adminData
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Obter perfil do usuário
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'Usuário não encontrado' 
            });
        }
        
        // Atualizar última atividade
        user.lastActivity = new Date();
        await user.save();
        
        res.status(200).json({ 
            success: true, 
            user 
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Atualizar perfil do usuário
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, phone, birthDate, gender } = req.body;
        
        // Encontrar usuário
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'Usuário não encontrado' 
            });
        }
        
        // Atualizar campos
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (birthDate) user.birthDate = new Date(birthDate);
        if (gender) user.gender = gender;
        
        // Se o email for alterado, verificar se já está em uso
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ 
                    success: false, 
                    error: 'Este email já está em uso' 
                });
            }
            user.email = email;
        }
        
        // Salvar alterações
        await user.save();
        
        // Retornar dados atualizados (exceto senha)
        const userData = user.toObject();
        delete userData.password;
        
        res.status(200).json({ 
            success: true, 
            message: 'Perfil atualizado com sucesso',
            user: userData
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Renovar token
router.post('/refresh-token', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'Usuário não encontrado' 
            });
        }
        
        // Atualizar última atividade
        user.lastActivity = new Date();
        await user.save();
        
        // Gerar novo token
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email,
                name: user.name,
                role: user.role 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        res.status(200).json({ 
            success: true, 
            token 
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Logout (opcional, já que JWT é stateless)
router.post('/logout', authenticateToken, (req, res) => {
    // No frontend, o token deve ser removido do armazenamento local
    res.status(200).json({ 
        success: true, 
        message: 'Logout realizado com sucesso' 
    });
});

module.exports = router;
