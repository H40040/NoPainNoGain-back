// backend/tests/authTest.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuração base
const API_URL = 'http://localhost:5000/api';

// Função para salvar os resultados dos testes
const saveTestResults = (testName, data) => {
    const resultsDir = path.join(__dirname, 'results');
    
    // Criar diretório de resultados se não existir
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const filePath = path.join(resultsDir, `auth_${testName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Resultados salvos em: ${filePath}`);
};

// Função para testar endpoints de autenticação
const testAuthEndpoint = async (method, endpoint, data = null, token = null) => {
    try {
        const config = token ? {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        } : {};
        
        let response;
        if (method.toLowerCase() === 'get') {
            response = await axios.get(`${API_URL}${endpoint}`, config);
        } else if (method.toLowerCase() === 'post') {
            response = await axios.post(`${API_URL}${endpoint}`, data, config);
        } else if (method.toLowerCase() === 'put') {
            response = await axios.put(`${API_URL}${endpoint}`, data, config);
        } else if (method.toLowerCase() === 'delete') {
            response = await axios.delete(`${API_URL}${endpoint}`, config);
        }
        
        console.log(`Teste para ${method.toUpperCase()} ${endpoint}:`);
        console.log('Status:', response.status);
        console.log('Dados:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error(`Erro ao testar ${method.toUpperCase()} ${endpoint}:`, 
            error.response?.data || error.message);
        return null;
    }
};

// Função principal para executar todos os testes de autenticação
const runAuthTests = async () => {
    console.log('Iniciando testes de autenticação...');
    
    // Testar registro de usuário
    console.log('\n=== TESTANDO REGISTRO DE USUÁRIO ===\n');
    
    const testUser = {
        name: 'Usuário Teste',
        email: `teste${Date.now()}@example.com`, // Email único para evitar conflitos
        password: 'Senha123!',
        confirmPassword: 'Senha123!'
    };
    
    const register = await testAuthEndpoint('post', '/auth/register', testUser);
    if (register) saveTestResults('register', register);
    
    // Testar login com credenciais inválidas
    console.log('\n=== TESTANDO LOGIN COM CREDENCIAIS INVÁLIDAS ===\n');
    
    const invalidLogin = await testAuthEndpoint('post', '/auth/login', {
        email: testUser.email,
        password: 'senhaerrada'
    });
    if (invalidLogin) saveTestResults('invalid_login', invalidLogin);
    
    // Testar login com credenciais válidas
    console.log('\n=== TESTANDO LOGIN COM CREDENCIAIS VÁLIDAS ===\n');
    
    const validLogin = await testAuthEndpoint('post', '/auth/login', {
        email: testUser.email,
        password: testUser.password
    });
    if (validLogin) saveTestResults('valid_login', validLogin);
    
    // Se o login foi bem-sucedido, testar outros endpoints de autenticação
    if (validLogin && validLogin.success && validLogin.token) {
        const token = validLogin.token;
        
        // Testar verificação de token
        console.log('\n=== TESTANDO VERIFICAÇÃO DE TOKEN ===\n');
        
        const verifyToken = await testAuthEndpoint('get', '/auth/verify', null, token);
        if (verifyToken) saveTestResults('verify_token', verifyToken);
        
        // Testar obtenção do perfil do usuário
        console.log('\n=== TESTANDO OBTENÇÃO DO PERFIL DO USUÁRIO ===\n');
        
        const profile = await testAuthEndpoint('get', '/auth/profile', null, token);
        if (profile) saveTestResults('profile', profile);
        
        // Testar atualização do perfil do usuário
        console.log('\n=== TESTANDO ATUALIZAÇÃO DO PERFIL DO USUÁRIO ===\n');
        
        const updateProfile = await testAuthEndpoint('put', '/auth/profile', {
            name: 'Usuário Teste Atualizado'
        }, token);
        if (updateProfile) saveTestResults('update_profile', updateProfile);
        
        // Testar alteração de senha
        console.log('\n=== TESTANDO ALTERAÇÃO DE SENHA ===\n');
        
        const changePassword = await testAuthEndpoint('put', '/auth/change-password', {
            currentPassword: testUser.password,
            newPassword: 'NovaSenha123!',
            confirmPassword: 'NovaSenha123!'
        }, token);
        if (changePassword) saveTestResults('change_password', changePassword);
        
        // Testar login com a nova senha
        console.log('\n=== TESTANDO LOGIN COM A NOVA SENHA ===\n');
        
        const newPasswordLogin = await testAuthEndpoint('post', '/auth/login', {
            email: testUser.email,
            password: 'NovaSenha123!'
        });
        if (newPasswordLogin) saveTestResults('new_password_login', newPasswordLogin);
        
        // Testar logout
        console.log('\n=== TESTANDO LOGOUT ===\n');
        
        const logout = await testAuthEndpoint('post', '/auth/logout', null, newPasswordLogin.token || token);
        if (logout) saveTestResults('logout', logout);
    }
    
    // Testar solicitação de redefinição de senha
    console.log('\n=== TESTANDO SOLICITAÇÃO DE REDEFINIÇÃO DE SENHA ===\n');
    
    const forgotPassword = await testAuthEndpoint('post', '/auth/forgot-password', {
        email: testUser.email
    });
    if (forgotPassword) saveTestResults('forgot_password', forgotPassword);
    
    console.log('\nTestes de autenticação concluídos!');
};

// Executar todos os testes de autenticação
runAuthTests().catch(error => {
    console.error('Erro ao executar testes de autenticação:', error);
});
