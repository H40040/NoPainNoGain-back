// backend/tests/debugAuthTest.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const axios = require('axios');

// Configurações
const API_URL = 'http://localhost:5000/api';
const TEST_USER = {
    name: 'Debug User',
    email: 'debug@example.com',
    password: 'Debug123!'
};

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => {
        console.error('Erro ao conectar ao MongoDB:', err);
        process.exit(1);
    });

// Função para criar um novo usuário de teste
const createDebugUser = async () => {
    try {
        // Verificar se o usuário já existe
        const existingUser = await User.findOne({ email: TEST_USER.email });
        
        if (existingUser) {
            console.log('Removendo usuário existente...');
            await User.deleteOne({ email: TEST_USER.email });
        }
        
        // Criar um novo usuário
        console.log('Criando novo usuário com senha:', TEST_USER.password);
        
        // Criar hash manualmente para verificação
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(TEST_USER.password, salt);
        console.log('Hash gerado manualmente:', hashedPassword);
        
        // Criar o usuário no banco de dados
        const newUser = new User({
            name: TEST_USER.name,
            email: TEST_USER.email,
            password: TEST_USER.password // Será hasheada pelo middleware pre-save
        });
        
        await newUser.save();
        
        // Buscar o usuário recém-criado para verificar a senha
        const savedUser = await User.findOne({ email: TEST_USER.email });
        console.log('Usuário criado com ID:', savedUser._id);
        console.log('Hash da senha armazenado:', savedUser.password);
        
        // Verificar se a senha pode ser validada
        const isValid = await bcrypt.compare(TEST_USER.password, savedUser.password);
        console.log('Senha pode ser validada com bcrypt.compare?', isValid);
        
        const isValidWithMethod = await savedUser.comparePassword(TEST_USER.password);
        console.log('Senha pode ser validada com o método do modelo?', isValidWithMethod);
        
        return savedUser;
    } catch (error) {
        console.error('Erro ao criar usuário de teste:', error);
        throw error;
    }
};

// Função para testar o login via API
const testLoginAPI = async () => {
    try {
        console.log('\nTestando login via API com:', TEST_USER.email, TEST_USER.password);
        
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        
        console.log('Resposta do login:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erro ao fazer login via API:', error.response?.data || error.message);
        
        // Se houver erro, vamos verificar o usuário diretamente no banco de dados
        try {
            const user = await User.findOne({ email: TEST_USER.email });
            if (user) {
                console.log('Usuário encontrado no banco de dados:', user._id);
                console.log('Hash da senha armazenado:', user.password);
                
                // Verificar a senha novamente
                const isValid = await bcrypt.compare(TEST_USER.password, user.password);
                console.log('Senha válida segundo bcrypt?', isValid);
            } else {
                console.log('Usuário não encontrado no banco de dados!');
            }
        } catch (dbError) {
            console.error('Erro ao verificar usuário no banco de dados:', dbError);
        }
        
        return null;
    }
};

// Função para testar o login diretamente no banco de dados
const testLoginDirect = async () => {
    try {
        console.log('\nTestando login diretamente no banco de dados');
        
        // Buscar o usuário
        const user = await User.findOne({ email: TEST_USER.email });
        
        if (!user) {
            console.log('Usuário não encontrado no banco de dados!');
            return null;
        }
        
        console.log('Usuário encontrado:', user._id);
        
        // Verificar a senha
        const isMatch = await bcrypt.compare(TEST_USER.password, user.password);
        console.log('Senha corresponde?', isMatch);
        
        if (isMatch) {
            console.log('Login direto bem-sucedido!');
            return { success: true, user };
        } else {
            console.log('Senha incorreta no teste direto.');
            return { success: false, error: 'Senha incorreta' };
        }
    } catch (error) {
        console.error('Erro ao fazer login direto:', error);
        return null;
    }
};

// Função principal
const runDebugTest = async () => {
    try {
        // Criar usuário de teste
        await createDebugUser();
        
        // Testar login via API
        await testLoginAPI();
        
        // Testar login diretamente
        await testLoginDirect();
        
    } catch (error) {
        console.error('Erro ao executar teste de debug:', error);
    } finally {
        // Fechar conexão com o MongoDB
        mongoose.connection.close();
    }
};

// Executar o teste
runDebugTest();
