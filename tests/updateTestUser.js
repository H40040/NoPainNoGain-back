// backend/tests/updateTestUser.js
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

// Função para atualizar a senha do usuário de teste
const updateTestUserPassword = async () => {
    try {
        // Verificar se o usuário de teste existe
        const existingUser = await User.findOne({ email: 'teste@example.com' });
        
        if (!existingUser) {
            console.log('Usuário de teste não encontrado.');
            return null;
        }
        
        // Atualizar a senha do usuário de teste
        const password = 'Teste123!';
        console.log('Nova senha do usuário de teste:', password);
        const hashedPassword = await bcrypt.hash(password, 10);
        
        existingUser.password = hashedPassword;
        await existingUser.save();
        
        console.log('Senha do usuário de teste atualizada com sucesso:', existingUser._id);
        return existingUser;
    } catch (error) {
        console.error('Erro ao atualizar senha do usuário de teste:', error);
        throw error;
    }
};

// Executar a função para atualizar a senha do usuário de teste
const updateUser = async () => {
    try {
        await updateTestUserPassword();
        console.log('Atualização concluída com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar usuário de teste:', error);
    } finally {
        // Fechar a conexão com o MongoDB
        mongoose.connection.close();
    }
};

// Executar o script
updateUser();
