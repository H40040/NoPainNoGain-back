// backend/tests/testUserGoalDecrease.js
const axios = require('axios');

// Configuração base
const API_URL = 'http://localhost:5000/api';
let authToken = null;
let userId = null;

// Função para fazer login e obter token
const login = async (email, password) => {
    try {
        console.log(`\n=== REALIZANDO LOGIN (${email}) ===\n`);
        
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        
        if (response.data.success) {
            authToken = response.data.token;
            userId = response.data.user?.id;
            console.log('Login realizado com sucesso!');
            if (userId) console.log(`ID do usuário: ${userId}`);
            return true;
        } else {
            console.error('Falha no login:', response.data.error);
            return false;
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error.response?.data || error.message);
        return false;
    }
};

// Função para testar a criação de meta do usuário com tipo 'decrease'
const testUserGoalDecreaseCreate = async () => {
    try {
        console.log('\n=== TESTANDO CRIAÇÃO DE META DO USUÁRIO COM TIPO "DECREASE" ===\n');
        
        // Dados de teste para meta com tipo 'decrease'
        const goalData = {
            title: 'Diminuir tempo de corrida',
            description: 'Objetivo de melhorar o tempo de corrida para 5km',
            type: 'decrease',
            targetValue: 25, // 25 minutos
            currentValue: 30, // 30 minutos
            startValue: 30,
            targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 dias a partir de hoje
            category: 'fitness',
            frequency: 'semanal',
            unit: 'min'
        };
        
        // Configurar headers com token de autenticação
        const config = {
            headers: { Authorization: `Bearer ${authToken}` }
        };
        
        // Tentar criar meta do usuário
        const response = await axios.post(`${API_URL}/user-goals`, goalData, config);
        
        console.log('Status:', response.status);
        console.log('Resposta:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error('Status:', error.response?.status);
        console.error('Erro:', error.response?.data || error.message);
        return null;
    }
};

// Função para testar a criação de meta do usuário com tipo 'increase'
const testUserGoalIncreaseCreate = async () => {
    try {
        console.log('\n=== TESTANDO CRIAÇÃO DE META DO USUÁRIO COM TIPO "INCREASE" ===\n');
        
        // Dados de teste para meta com tipo 'increase'
        const goalData = {
            title: 'Aumentar distância de corrida',
            description: 'Objetivo de aumentar a distância de corrida semanal',
            type: 'increase',
            targetValue: 20, // 20 km
            currentValue: 10, // 10 km
            startValue: 10,
            targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 dias a partir de hoje
            category: 'fitness',
            frequency: 'semanal',
            unit: 'km'
        };
        
        // Configurar headers com token de autenticação
        const config = {
            headers: { Authorization: `Bearer ${authToken}` }
        };
        
        // Tentar criar meta do usuário
        const response = await axios.post(`${API_URL}/user-goals`, goalData, config);
        
        console.log('Status:', response.status);
        console.log('Resposta:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error('Status:', error.response?.status);
        console.error('Erro:', error.response?.data || error.message);
        return null;
    }
};

// Função principal
const runTest = async () => {
    console.log('Iniciando teste de metas do usuário com tipos "decrease" e "increase"...\n');
    
    // Fazer login com o usuário de teste
    const loggedIn = await login('debug@example.com', 'Debug123!');
    
    if (!loggedIn) {
        console.error('Não foi possível realizar o login. Encerrando teste.');
        return;
    }
    
    // Testar criação de meta do usuário com tipo 'decrease'
    await testUserGoalDecreaseCreate();
    
    // Testar criação de meta do usuário com tipo 'increase'
    await testUserGoalIncreaseCreate();
    
    console.log('\nTeste de metas do usuário com tipos "decrease" e "increase" concluído!');
};

// Executar o teste
runTest().catch(error => {
    console.error('Erro ao executar teste:', error);
});
