// backend/tests/createTestUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => {
        console.error('Erro ao conectar ao MongoDB:', err);
        process.exit(1);
    });

// Função para criar usuário de teste
const createTestUser = async () => {
    try {
        // Verificar se o usuário de teste já existe
        const existingUser = await User.findOne({ email: 'teste@example.com' });
        
        if (existingUser) {
            console.log('Usuário de teste já existe:', existingUser._id);
            return existingUser;
        }
        
        // Criar um novo usuário de teste
        const password = 'Teste123!';
        console.log('Senha do usuário de teste:', password);
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            name: 'Usuário Teste',
            email: 'teste@example.com',
            password: hashedPassword,
            role: 'user',
            // Adicione outros campos necessários aqui
        });
        
        await newUser.save();
        console.log('Usuário de teste criado com sucesso:', newUser._id);
        return newUser;
    } catch (error) {
        console.error('Erro ao criar usuário de teste:', error);
        throw error;
    }
};

// Função para criar administrador de teste
const createTestAdmin = async () => {
    try {
        // Verificar se o administrador de teste já existe
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        
        if (existingAdmin) {
            console.log('Administrador de teste já existe:', existingAdmin._id);
            return existingAdmin;
        }
        
        // Criar um novo administrador de teste
        const hashedPassword = await bcrypt.hash('Admin123!', 10);
        
        const newAdmin = new User({
            name: 'Administrador',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            // Adicione outros campos necessários aqui
        });
        
        await newAdmin.save();
        console.log('Administrador de teste criado com sucesso:', newAdmin._id);
        return newAdmin;
    } catch (error) {
        console.error('Erro ao criar administrador de teste:', error);
        throw error;
    }
};

// Executar as funções para criar usuários de teste
const createTestUsers = async () => {
    try {
        await createTestUser();
        await createTestAdmin();
        console.log('Usuários de teste criados com sucesso!');
    } catch (error) {
        console.error('Erro ao criar usuários de teste:', error);
    } finally {
        // Fechar a conexão com o MongoDB
        mongoose.connection.close();
    }
};

// Executar o script
createTestUsers();
