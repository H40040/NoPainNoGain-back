// backend/tests/adminApiTest.js
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
    
    const filePath = path.join(resultsDir, `admin_${testName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Resultados salvos em: ${filePath}`);
};

// Função para fazer login como administrador e obter token
const loginAsAdmin = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        
        if (response.data.success && response.data.user.role === 'admin') {
            authToken = response.data.token;
            userId = response.data.user.id;
            console.log('Login como administrador realizado com sucesso!');
            console.log(`ID do administrador: ${userId}`);
            return true;
        } else {
            console.error('Falha no login como administrador ou usuário não é administrador');
            return false;
        }
    } catch (error) {
        console.error('Erro ao fazer login como administrador:', error.response?.data || error.message);
        return false;
    }
};

// Função para testar endpoints
const testEndpoint = async (method, endpoint, data = null) => {
    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        };
        
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

// Função principal para executar todos os testes administrativos
const runAdminTests = async () => {
    console.log('Iniciando testes de API para administradores...');
    
    // Fazer login como administrador
    console.log('\n=== REALIZANDO LOGIN COMO ADMINISTRADOR ===\n');
    
    // Substitua por credenciais válidas de um administrador
    const loggedIn = await loginAsAdmin('admin@example.com', 'senha123');
    
    if (!loggedIn) {
        console.error('Não foi possível realizar o login como administrador. Encerrando testes.');
        return;
    }
    
    // Testar endpoints administrativos
    console.log('\n=== TESTANDO ENDPOINTS ADMINISTRATIVOS ===\n');
    
    // MuscleGroups (Admin)
    console.log('\n--- MuscleGroups (Admin) ---\n');
    
    const newMuscleGroup = await testEndpoint('post', '/muscle-groups', {
        name: 'Teste Músculo',
        description: 'Grupo muscular para teste',
        bodyRegion: 'teste',
        recommendedFrequency: 2,
        recommendedExercises: 3
    });
    if (newMuscleGroup) saveTestResults('new_muscle_group', newMuscleGroup);
    
    // Se criou com sucesso, vamos atualizar e depois deletar
    if (newMuscleGroup && newMuscleGroup.success && newMuscleGroup.muscleGroup) {
        const muscleGroupId = newMuscleGroup.muscleGroup._id;
        
        const updatedMuscleGroup = await testEndpoint('put', `/muscle-groups/${muscleGroupId}`, {
            name: 'Teste Músculo Atualizado',
            description: 'Descrição atualizada para teste'
        });
        if (updatedMuscleGroup) saveTestResults('updated_muscle_group', updatedMuscleGroup);
        
        const deletedMuscleGroup = await testEndpoint('delete', `/muscle-groups/${muscleGroupId}`);
        if (deletedMuscleGroup) saveTestResults('deleted_muscle_group', deletedMuscleGroup);
    }
    
    // Equipment (Admin)
    console.log('\n--- Equipment (Admin) ---\n');
    
    const newEquipment = await testEndpoint('post', '/equipment', {
        name: 'Teste Equipamento',
        description: 'Equipamento para teste',
        category: 'teste',
        difficulty: 'intermediário'
    });
    if (newEquipment) saveTestResults('new_equipment', newEquipment);
    
    // Se criou com sucesso, vamos atualizar e depois deletar
    if (newEquipment && newEquipment.success && newEquipment.equipment) {
        const equipmentId = newEquipment.equipment._id;
        
        const updatedEquipment = await testEndpoint('put', `/equipment/${equipmentId}`, {
            name: 'Teste Equipamento Atualizado',
            description: 'Descrição atualizada para teste'
        });
        if (updatedEquipment) saveTestResults('updated_equipment', updatedEquipment);
        
        const deletedEquipment = await testEndpoint('delete', `/equipment/${equipmentId}`);
        if (deletedEquipment) saveTestResults('deleted_equipment', deletedEquipment);
    }
    
    // Subscription Plans (Admin)
    console.log('\n--- Subscription Plans (Admin) ---\n');
    
    const newPlan = await testEndpoint('post', '/subscriptions/plans', {
        name: 'Plano Teste',
        description: 'Plano para teste',
        price: 99.9,
        currency: 'BRL',
        interval: 'mensal',
        features: ['Recurso 1', 'Recurso 2'],
        active: true
    });
    if (newPlan) saveTestResults('new_plan', newPlan);
    
    // Se criou com sucesso, vamos atualizar e depois deletar
    if (newPlan && newPlan.success && newPlan.plan) {
        const planId = newPlan.plan._id;
        
        const updatedPlan = await testEndpoint('put', `/subscriptions/plans/${planId}`, {
            name: 'Plano Teste Atualizado',
            description: 'Descrição atualizada para teste',
            price: 89.9
        });
        if (updatedPlan) saveTestResults('updated_plan', updatedPlan);
        
        const deletedPlan = await testEndpoint('delete', `/subscriptions/plans/${planId}`);
        if (deletedPlan) saveTestResults('deleted_plan', deletedPlan);
    }
    
    // Teste de acesso a dados de outros usuários (Admin)
    console.log('\n--- Acesso a Dados de Usuários (Admin) ---\n');
    
    // Obter lista de usuários (endpoint que deve existir para administradores)
    const users = await testEndpoint('get', '/users');
    if (users) saveTestResults('users_list', users);
    
    // Se obteve a lista de usuários, vamos tentar acessar dados de um usuário específico
    if (users && users.success && users.users && users.users.length > 0) {
        // Pegar o ID de um usuário que não seja o administrador atual
        const targetUserId = users.users.find(user => user._id !== userId)?._id;
        
        if (targetUserId) {
            // Testar acesso aos dados de preferências do usuário
            const userPreferences = await testEndpoint('get', `/user-preferences/${targetUserId}`);
            if (userPreferences) saveTestResults('other_user_preferences', userPreferences);
            
            // Testar acesso aos dados de anamnese do usuário
            const userAnamnese = await testEndpoint('get', `/anamnese/${targetUserId}`);
            if (userAnamnese) saveTestResults('other_user_anamnese', userAnamnese);
            
            // Testar acesso às estatísticas do usuário
            const userStatistics = await testEndpoint('get', `/user-statistics/${targetUserId}`);
            if (userStatistics) saveTestResults('other_user_statistics', userStatistics);
            
            // Testar acesso às metas do usuário
            const userGoals = await testEndpoint('get', `/user-goals/${targetUserId}`);
            if (userGoals) saveTestResults('other_user_goals', userGoals);
            
            // Testar acesso à assinatura do usuário
            const userSubscription = await testEndpoint('get', `/subscriptions/${targetUserId}`);
            if (userSubscription) saveTestResults('other_user_subscription', userSubscription);
        }
    }
    
    console.log('\nTestes administrativos concluídos!');
};

// Executar todos os testes administrativos
runAdminTests().catch(error => {
    console.error('Erro ao executar testes administrativos:', error);
});
