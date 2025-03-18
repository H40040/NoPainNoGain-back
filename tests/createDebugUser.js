// backend/tests/createDebugUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');

// Configurações
const DEBUG_USER = {
    name: 'Usuário Debug',
    email: 'debug@example.com',
    password: 'Debug123!',
    role: 'user',
    isActive: true
};

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => {
        console.error('Erro ao conectar ao MongoDB:', err);
        process.exit(1);
    });

// Função para criar usuário de debug
const createDebugUser = async () => {
    try {
        // Verificar se o usuário já existe
        const existingUser = await User.findOne({ email: DEBUG_USER.email });
        
        if (existingUser) {
            console.log('Usuário debug já existe. Removendo...');
            await User.deleteOne({ email: DEBUG_USER.email });
        }
        
        // Criar um novo usuário
        const newUser = new User({
            name: DEBUG_USER.name,
            email: DEBUG_USER.email,
            password: DEBUG_USER.password,
            role: DEBUG_USER.role,
            isActive: DEBUG_USER.isActive,
            lastLogin: new Date(),
            lastActivity: new Date()
        });
        
        await newUser.save();
        console.log('Usuário debug criado com sucesso:', newUser._id);
        return newUser;
    } catch (error) {
        console.error('Erro ao criar usuário debug:', error);
        throw error;
    } finally {
        // Fechar conexão com o MongoDB
        mongoose.connection.close();
    }
};

// Executar a função
createDebugUser();
