// backend/tests/testAnamneseUpdate.js
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

// Função para testar a atualização da anamnese
const testAnamneseUpdate = async () => {
    try {
        console.log('\n=== TESTANDO ATUALIZAÇÃO DE ANAMNESE ===\n');
        
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
        
        // Tentar atualizar anamnese
        const response = await axios.put(`${API_URL}/anamnese`, anamneseData, config);
        
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
    console.log('Iniciando teste de atualização de anamnese...\n');
    
    // Fazer login com o usuário de teste
    const loggedIn = await login('debug@example.com', 'Debug123!');
    
    if (!loggedIn) {
        console.error('Não foi possível realizar o login. Encerrando teste.');
        return;
    }
    
    // Testar atualização de anamnese
    await testAnamneseUpdate();
    
    console.log('\nTeste de atualização de anamnese concluído!');
};

// Executar o teste
runTest().catch(error => {
    console.error('Erro ao executar teste:', error);
});
