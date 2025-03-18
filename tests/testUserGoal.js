// backend/tests/testUserGoal.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

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
            
            // Extrair userId do token JWT
            const decoded = jwt.decode(authToken);
            userId = decoded.id;
            
            console.log('Login realizado com sucesso!');
            console.log(`ID do usuário do token: ${userId}`);
            console.log(`ID do usuário da resposta: ${response.data.user?._id}`);
            
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

// Função para testar a criação de meta do usuário
const testUserGoalCreate = async () => {
    try {
        console.log('\n=== TESTANDO CRIAÇÃO DE META DO USUÁRIO ===\n');
        
        // Dados de teste para meta
        const goalData = {
            title: 'Perder 5kg',
            description: 'Objetivo de perda de peso para o verão',
            type: 'peso',
            targetValue: 70,
            currentValue: 75,
            startValue: 75,
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 dias a partir de hoje
            category: 'saúde',
            frequency: 'semanal'
        };
        
        // Configurar headers com token de autenticação
        const config = {
            headers: { Authorization: `Bearer ${authToken}` }
        };
        
        // Tentar criar meta do usuário - usando a rota sem userId na URL
        // O userId será extraído do token pelo middleware
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

// Função para testar a atualização de meta do usuário
const testUserGoalUpdate = async (goalId) => {
    try {
        console.log(`\n=== TESTANDO ATUALIZAÇÃO DE META DO USUÁRIO (ID: ${goalId}) ===\n`);
        
        // Dados de teste para atualização
        const updateData = {
            currentValue: 72, // Progresso na meta
            status: 'ativa' // Usando um valor válido para o campo status
        };
        
        // Configurar headers com token de autenticação
        const config = {
            headers: { Authorization: `Bearer ${authToken}` }
        };
        
        // Tentar atualizar meta do usuário
        const response = await axios.put(`${API_URL}/user-goals/${goalId}`, updateData, config);
        
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
    console.log('Iniciando teste de metas do usuário...\n');
    
    // Fazer login com o usuário de teste
    const loggedIn = await login('debug@example.com', 'Debug123!');
    
    if (!loggedIn) {
        console.error('Não foi possível realizar o login. Encerrando teste.');
        return;
    }
    
    // Testar criação de meta do usuário
    const goalResult = await testUserGoalCreate();
    
    // Se a meta foi criada com sucesso, testar atualização
    if (goalResult && goalResult.success && goalResult.goal) {
        const goalId = goalResult.goal._id;
        await testUserGoalUpdate(goalId);
    }
    
    console.log('\nTeste de metas do usuário concluído!');
};

// Executar o teste
runTest().catch(error => {
    console.error('Erro ao executar teste:', error);
});
