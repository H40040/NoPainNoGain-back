// backend/tests/protectedEndpointsTest.js
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
    
    const filePath = path.join(resultsDir, `protected_${testName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Resultados salvos em: ${filePath}`);
};

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

// Função para testar endpoints protegidos
const testProtectedEndpoint = async (method, endpoint, data = null) => {
    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        };
        
        console.log(`\n=== TESTE: ${method.toUpperCase()} ${endpoint} ===\n`);
        
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
        
        console.log('Status:', response.status);
        console.log('Resposta:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error('Status:', error.response?.status);
        console.error('Erro:', error.response?.data || error.message);
        return null;
    }
};

// Função principal para executar todos os testes
const runProtectedEndpointsTests = async () => {
    console.log('Iniciando testes de endpoints protegidos...\n');
    
    // Fazer login com o usuário de teste que sabemos que funciona
    const loggedIn = await login('debug@example.com', 'Debug123!');
    
    if (!loggedIn) {
        console.error('Não foi possível realizar o login. Encerrando testes.');
        return;
    }
    
    // Testar endpoints protegidos
    
    // 1. UserPreferences
    console.log('\n--- TESTANDO ENDPOINTS DE PREFERÊNCIAS DO USUÁRIO ---\n');
    
    // Tentar obter preferências do usuário (pode não existir ainda)
    const userPreferences = await testProtectedEndpoint('get', '/user-preferences');
    if (userPreferences) saveTestResults('user_preferences_get', userPreferences);
    
    // Criar/atualizar preferências do usuário
    const preferencesData = {
        workoutDays: ['segunda', 'quarta', 'sexta'],
        workoutTime: '18:00',
        workoutDuration: 60,
        workoutLocation: 'academia',
        fitnessGoals: ['hipertrofia', 'condicionamento'],
        preferredExercises: ['supino', 'agachamento'],
        excludedExercises: ['barra fixa'],
        notificationPreferences: {
            workoutReminders: true,
            progressUpdates: true,
            achievementAlerts: true
        }
    };
    
    const updatedPreferences = await testProtectedEndpoint('put', '/user-preferences', preferencesData);
    if (updatedPreferences) saveTestResults('user_preferences_update', updatedPreferences);
    
    // 2. Anamnese
    console.log('\n--- TESTANDO ENDPOINTS DE ANAMNESE ---\n');
    
    // Tentar obter anamnese do usuário (pode não existir ainda)
    const anamnese = await testProtectedEndpoint('get', '/anamnese');
    if (anamnese) saveTestResults('anamnese_get', anamnese);
    
    // Criar/atualizar anamnese do usuário
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
    
    const updatedAnamnese = await testProtectedEndpoint('put', '/anamnese', anamneseData);
    if (updatedAnamnese) saveTestResults('anamnese_update', updatedAnamnese);
    
    // 3. UserStatistics
    console.log('\n--- TESTANDO ENDPOINTS DE ESTATÍSTICAS DO USUÁRIO ---\n');
    
    // Tentar obter estatísticas do usuário
    const userStatistics = await testProtectedEndpoint('get', '/user-statistics');
    if (userStatistics) saveTestResults('user_statistics_get', userStatistics);
    
    // Adicionar entrada de peso
    const weightData = {
        weight: 74.5,
        date: new Date().toISOString()
    };
    
    const weightEntry = await testProtectedEndpoint('post', '/user-statistics/weight', weightData);
    if (weightEntry) saveTestResults('weight_entry_add', weightEntry);
    
    // 4. UserGoals
    console.log('\n--- TESTANDO ENDPOINTS DE METAS DO USUÁRIO ---\n');
    
    // Tentar obter metas do usuário
    const userGoals = await testProtectedEndpoint('get', '/user-goals');
    if (userGoals) saveTestResults('user_goals_get', userGoals);
    
    // Criar nova meta
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
    
    const newGoal = await testProtectedEndpoint('post', '/user-goals', goalData);
    if (newGoal) saveTestResults('user_goal_create', newGoal);
    
    // Se criou com sucesso, vamos atualizar a meta
    if (newGoal && newGoal.success && newGoal.goal) {
        const goalId = newGoal.goal._id;
        
        const updateGoalData = {
            currentValue: 73,
            progress: 40
        };
        
        const updatedGoal = await testProtectedEndpoint('put', `/user-goals/${goalId}`, updateGoalData);
        if (updatedGoal) saveTestResults('user_goal_update', updatedGoal);
    }
    
    // 5. Subscription
    console.log('\n--- TESTANDO ENDPOINTS DE ASSINATURA ---\n');
    
    // Tentar obter assinatura do usuário
    const subscription = await testProtectedEndpoint('get', '/subscriptions');
    if (subscription) saveTestResults('subscription_get', subscription);
    
    console.log('\nTestes de endpoints protegidos concluídos!');
};

// Executar todos os testes
runProtectedEndpointsTests().catch(error => {
    console.error('Erro ao executar testes:', error);
});
