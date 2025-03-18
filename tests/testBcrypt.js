// backend/tests/testBcrypt.js
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

// Função para testar o bcrypt
const testBcrypt = async () => {
    try {
        // Senha de teste
        const plainPassword = 'Senha123!';
        
        // Gerar hash
        console.log('Gerando hash para senha:', plainPassword);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        console.log('Hash gerado:', hashedPassword);
        
        // Verificar senha
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        console.log('Senha corresponde ao hash?', isMatch);
        
        // Criar um usuário de teste temporário
        const testUser = new User({
            name: 'Teste Bcrypt',
            email: 'bcrypt_test@example.com',
            password: plainPassword // Será hasheada pelo middleware pre-save
        });
        
        // Salvar o usuário (isso acionará o middleware pre-save)
        await testUser.save();
        console.log('Usuário salvo com hash da senha:', testUser.password);
        
        // Buscar o usuário do banco de dados
        const savedUser = await User.findOne({ email: 'bcrypt_test@example.com' });
        console.log('Usuário recuperado do banco de dados');
        
        // Testar o método comparePassword do modelo
        const passwordMatch = await savedUser.comparePassword(plainPassword);
        console.log('Senha corresponde usando o método do modelo?', passwordMatch);
        
        // Testar diretamente com bcrypt.compare
        const directMatch = await bcrypt.compare(plainPassword, savedUser.password);
        console.log('Senha corresponde usando bcrypt.compare diretamente?', directMatch);
        
        // Limpar o usuário de teste
        await User.deleteOne({ email: 'bcrypt_test@example.com' });
        console.log('Usuário de teste removido');
    } catch (error) {
        console.error('Erro ao testar bcrypt:', error);
    }
};

// Executar o teste
testBcrypt().finally(() => {
    // Fechar conexão com o MongoDB
    mongoose.connection.close();
});
