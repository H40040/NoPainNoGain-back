// backend/tests/testAnamneseV2.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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

// Função para testar a atualização da anamnese V2
const testAnamneseV2Update = async () => {
    try {
        console.log('\n=== TESTANDO ATUALIZAÇÃO DE ANAMNESE V2 ===\n');
        
        // Dados de teste para anamnese
        const anamneseData = {
            height: 175,
            weight: 75,
            age: 30,
            gender: 'masculino',
            fitnessLevel: 'intermediário',
            medicalHistory: 'Sem histórico médico relevante',
            injuries: ['Tendinite no ombro em 2020'],
            surgeries: 'Nenhuma',
            medications: ['Suplemento de proteína', 'Multivitamínico'],
            goals: ['hipertrofia', 'perda de peso'],
            activityFrequency: 3,
            sessionDuration: 60,
            sleepHours: 7,
            stressLevel: 'médio',
            dietaryRestrictions: ['lactose'],
            isComplete: true
        };
        
        // Configurar headers com token de autenticação
        const config = {
            headers: { Authorization: `Bearer ${authToken}` }
        };
        
        // Tentar atualizar anamnese V2
        const response = await axios.put(`${API_URL}/anamnese-v2`, anamneseData, config);
        
        console.log('Status:', response.status);
        console.log('Resposta:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error('Status:', error.response?.status);
        console.error('Erro:', error.response?.data || error.message);
        return null;
    }
};

// Função para testar a obtenção da anamnese V2
const testAnamneseV2Get = async () => {
    try {
        console.log('\n=== TESTANDO OBTENÇÃO DE ANAMNESE V2 ===\n');
        
        // Configurar headers com token de autenticação
        const config = {
            headers: { Authorization: `Bearer ${authToken}` }
        };
        
        // Tentar obter anamnese V2
        const response = await axios.get(`${API_URL}/anamnese-v2`, config);
        
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
    console.log('Iniciando teste de anamnese V2...\n');
    
    // Fazer login com o usuário de teste
    const loggedIn = await login('debug@example.com', 'Debug123!');
    
    if (!loggedIn) {
        console.error('Não foi possível realizar o login. Encerrando teste.');
        return;
    }
    
    // Testar atualização de anamnese V2
    await testAnamneseV2Update();
    
    // Testar obtenção de anamnese V2
    await testAnamneseV2Get();
    
    console.log('\nTeste de anamnese V2 concluído!');
};

// Executar o teste
runTest().catch(error => {
    console.error('Erro ao executar teste:', error);
});
