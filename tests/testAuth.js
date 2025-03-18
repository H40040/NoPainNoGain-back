// backend/tests/testAuth.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const axios = require('axios');

// Configurações
const API_URL = 'http://localhost:5000/api';
const TEST_USER = {
    name: 'Usuário Teste',
    email: 'novo_teste@example.com',
    password: 'Senha123!'
};

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => {
        console.error('Erro ao conectar ao MongoDB:', err);
        process.exit(1);
    });

// Função para criar um novo usuário de teste
const createTestUser = async () => {
    try {
        // Verificar se o usuário já existe
        const existingUser = await User.findOne({ email: TEST_USER.email });
        
        if (existingUser) {
            console.log('Removendo usuário existente...');
            await User.deleteOne({ email: TEST_USER.email });
        }
        
        // Criar um novo usuário - não precisamos criptografar a senha manualmente
        // pois o middleware pre-save do modelo User já fará isso
        const newUser = new User({
            name: TEST_USER.name,
            email: TEST_USER.email,
            password: TEST_USER.password,
            role: 'user',
            isActive: true,
            lastLogin: new Date(),
            lastActivity: new Date()
        });
        
        await newUser.save();
        console.log('Usuário de teste criado com sucesso:', newUser._id);
        return newUser;
    } catch (error) {
        console.error('Erro ao criar usuário de teste:', error);
        throw error;
    }
};

// Função para testar o login
const testLogin = async () => {
    try {
        console.log('Testando login com:', TEST_USER.email, TEST_USER.password);
        
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        
        console.log('Resposta do login:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erro ao fazer login:', error.response?.data || error.message);
        return null;
    }
};

// Função principal
const runTest = async () => {
    try {
        // Criar usuário de teste
        await createTestUser();
        
        // Testar login
        const loginResult = await testLogin();
        
        if (loginResult && loginResult.success) {
            console.log('Login bem-sucedido! Token:', loginResult.token);
        } else {
            console.log('Falha no login.');
        }
    } catch (error) {
        console.error('Erro ao executar teste:', error);
    } finally {
        // Fechar conexão com o MongoDB
        mongoose.connection.close();
    }
};

// Executar o teste
runTest();
