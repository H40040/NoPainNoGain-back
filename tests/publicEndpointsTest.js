// backend/tests/publicEndpointsTest.js
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
    
    const filePath = path.join(resultsDir, `${testName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Resultados salvos em: ${filePath}`);
};

// Função para testar endpoints
const testEndpoint = async (method, endpoint, data = null) => {
    try {
        let response;
        if (method.toLowerCase() === 'get') {
            response = await axios.get(`${API_URL}${endpoint}`);
        } else if (method.toLowerCase() === 'post') {
            response = await axios.post(`${API_URL}${endpoint}`, data);
        } else if (method.toLowerCase() === 'put') {
            response = await axios.put(`${API_URL}${endpoint}`, data);
        } else if (method.toLowerCase() === 'delete') {
            response = await axios.delete(`${API_URL}${endpoint}`);
        }
        
        console.log(`\n=== TESTE: ${method.toUpperCase()} ${endpoint} ===`);
        console.log('Status:', response.status);
        console.log('Resposta:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error(`\n=== ERRO: ${method.toUpperCase()} ${endpoint} ===`);
        console.error('Status:', error.response?.status);
        console.error('Erro:', error.response?.data || error.message);
        return null;
    }
};

// Função principal para executar todos os testes
const runPublicEndpointsTests = async () => {
    console.log('Iniciando testes de endpoints públicos...\n');
    
    // Testar endpoint raiz da API
    const apiRoot = await testEndpoint('get', '');
    if (apiRoot) saveTestResults('api_root', apiRoot);
    
    // Testar endpoint de grupos musculares
    const muscleGroups = await testEndpoint('get', '/muscle-groups');
    if (muscleGroups) saveTestResults('muscle_groups', muscleGroups);
    
    // Testar endpoint de equipamentos
    const equipment = await testEndpoint('get', '/equipment');
    if (equipment) saveTestResults('equipment', equipment);
    
    // Testar endpoint de planos de assinatura
    const plans = await testEndpoint('get', '/subscriptions/plans');
    if (plans) saveTestResults('subscription_plans', plans);
    
    // Testar obtenção de um grupo muscular específico
    if (muscleGroups && muscleGroups.muscleGroups && muscleGroups.muscleGroups.length > 0) {
        const muscleGroupId = muscleGroups.muscleGroups[0]._id;
        const singleMuscleGroup = await testEndpoint('get', `/muscle-groups/${muscleGroupId}`);
        if (singleMuscleGroup) saveTestResults('single_muscle_group', singleMuscleGroup);
    }
    
    // Testar obtenção de um equipamento específico
    if (equipment && equipment.equipment && equipment.equipment.length > 0) {
        const equipmentId = equipment.equipment[0]._id;
        const singleEquipment = await testEndpoint('get', `/equipment/${equipmentId}`);
        if (singleEquipment) saveTestResults('single_equipment', singleEquipment);
    }
    
    // Testar obtenção de um plano de assinatura específico
    if (plans && plans.plans && plans.plans.length > 0) {
        const planId = plans.plans[0]._id;
        const singlePlan = await testEndpoint('get', `/subscriptions/plans/${planId}`);
        if (singlePlan) saveTestResults('single_plan', singlePlan);
    }
    
    console.log('\nTestes de endpoints públicos concluídos!');
};

// Executar todos os testes
runPublicEndpointsTests().catch(error => {
    console.error('Erro ao executar testes:', error);
});
