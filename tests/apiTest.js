// backend/tests/apiTest.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuração base
const API_URL = 'http://localhost:5000/api';
let authToken = null;
let userId = null;

// Função para salvar os resultados dos testes
const saveTestResults = (testName, data) => {
    const resultsDir = path.join(__dirname, 'results');
    
    // Criar diretório de resultados se não existir
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const filePath = path.join(resultsDir, `${testName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Resultados salvos em: ${filePath}`);
};

// Função para fazer login e obter token
const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        
        if (response.data.success) {
            authToken = response.data.token;
            userId = response.data.user.id;
            console.log('Login realizado com sucesso!');
            console.log(`ID do usuário: ${userId}`);
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

// Função para testar endpoints
const testEndpoint = async (method, endpoint, data = null, requiresAuth = true) => {
    try {
        const config = requiresAuth && authToken ? {
            headers: {
                'Authorization': `Bearer ${authToken}`
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

// Função principal para executar todos os testes
const runAllTests = async () => {
    console.log('Iniciando testes da API...');
    
    // Testar endpoints públicos
    console.log('\n=== TESTANDO ENDPOINTS PÚBLICOS ===\n');
    
    const muscleGroups = await testEndpoint('get', '/muscle-groups', null, false);
    if (muscleGroups) saveTestResults('muscle_groups', muscleGroups);
    
    const equipment = await testEndpoint('get', '/equipment', null, false);
    if (equipment) saveTestResults('equipment', equipment);
    
    const plans = await testEndpoint('get', '/subscriptions/plans', null, false);
    if (plans) saveTestResults('subscription_plans', plans);
    
    // Fazer login para testar endpoints autenticados
    console.log('\n=== REALIZANDO LOGIN ===\n');
    
    // Substitua por credenciais válidas
    const loggedIn = await login('admin@example.com', 'senha123');
    
    if (!loggedIn) {
        console.error('Não foi possível realizar o login. Encerrando testes.');
        return;
    }
    
    // Testar endpoints autenticados
    console.log('\n=== TESTANDO ENDPOINTS AUTENTICADOS ===\n');
    
    // UserPreferences
    console.log('\n--- UserPreferences ---\n');
    const userPreferences = await testEndpoint('get', '/user-preferences');
    if (userPreferences) saveTestResults('user_preferences', userPreferences);
    
    const updatedPreferences = await testEndpoint('put', '/user-preferences', {
        workoutDays: ['segunda', 'quarta', 'sexta'],
        workoutTime: '19:00',
        workoutDuration: 60,
        workoutLocation: 'academia',
        fitnessGoals: ['hipertrofia', 'condicionamento']
    });
    if (updatedPreferences) saveTestResults('updated_preferences', updatedPreferences);
    
    // Anamnese
    console.log('\n--- Anamnese ---\n');
    const anamnese = await testEndpoint('get', '/anamnese');
    if (anamnese) saveTestResults('anamnese', anamnese);
    
    const updatedAnamnese = await testEndpoint('put', '/anamnese', {
        height: 175,
        weight: 75,
        age: 30,
        gender: 'masculino',
        fitnessLevel: 'intermediário',
        goals: ['hipertrofia', 'perda de peso'],
        isComplete: true
    });
    if (updatedAnamnese) saveTestResults('updated_anamnese', updatedAnamnese);
    
    // UserStatistics
    console.log('\n--- UserStatistics ---\n');
    const userStatistics = await testEndpoint('get', '/user-statistics');
    if (userStatistics) saveTestResults('user_statistics', userStatistics);
    
    const weightEntry = await testEndpoint('post', '/user-statistics/weight', {
        weight: 74.5,
        date: new Date()
    });
    if (weightEntry) saveTestResults('weight_entry', weightEntry);
    
    // UserGoals
    console.log('\n--- UserGoals ---\n');
    const userGoals = await testEndpoint('get', '/user-goals');
    if (userGoals) saveTestResults('user_goals', userGoals);
    
    const newGoal = await testEndpoint('post', '/user-goals', {
        title: 'Perder 5kg',
        description: 'Objetivo de perda de peso para o verão',
        type: 'decrease',
        targetValue: 70,
        currentValue: 75,
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias a partir de hoje
        category: 'peso',
        reminderFrequency: 'semanal'
    });
    if (newGoal) saveTestResults('new_goal', newGoal);
    
    // Subscription
    console.log('\n--- Subscription ---\n');
    const subscription = await testEndpoint('get', '/subscriptions');
    if (subscription) saveTestResults('subscription', subscription);
    
    console.log('\nTestes concluídos!');
};

// Executar todos os testes
runAllTests().catch(error => {
    console.error('Erro ao executar testes:', error);
});
