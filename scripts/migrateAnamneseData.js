// backend/scripts/migrateAnamneseData.js
require('dotenv').config();
const mongoose = require('mongoose');
const Anamnese = require('../models/anamneseModel');
const AnamneseV2 = require('../models/anamneseModelV2');

// Função para conectar ao MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conectado ao MongoDB');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error.message);
        process.exit(1);
    }
};

// Função para migrar dados de Anamnese para AnamneseV2
const migrateAnamneseData = async () => {
    try {
        console.log('Iniciando migração de dados de Anamnese para AnamneseV2...');
        
        // Buscar todas as anamneses existentes
        const anamneses = await Anamnese.find({});
        console.log(`Encontradas ${anamneses.length} anamneses para migração.`);
        
        // Contador de migrações bem-sucedidas
        let successCount = 0;
        let errorCount = 0;
        
        // Para cada anamnese, criar uma nova anamnese V2
        for (const anamnese of anamneses) {
            try {
                // Verificar se já existe uma anamnese V2 para este usuário
                const existingAnamneseV2 = await AnamneseV2.findOne({ userId: anamnese.userId });
                
                if (existingAnamneseV2) {
                    console.log(`Anamnese V2 já existe para o usuário ${anamnese.userId}. Atualizando...`);
                    
                    // Converter injuries e medications para arrays, se necessário
                    const injuries = Array.isArray(anamnese.injuries) 
                        ? anamnese.injuries 
                        : (anamnese.injuries ? [anamnese.injuries] : []);
                    
                    const medications = Array.isArray(anamnese.medications) 
                        ? anamnese.medications 
                        : (anamnese.medications ? [anamnese.medications] : []);
                    
                    // Atualizar anamnese V2 existente
                    existingAnamneseV2.height = anamnese.height;
                    existingAnamneseV2.weight = anamnese.weight;
                    existingAnamneseV2.age = anamnese.age;
                    existingAnamneseV2.gender = anamnese.gender;
                    existingAnamneseV2.medicalHistory = anamnese.medicalHistory;
                    existingAnamneseV2.injuries = injuries;
                    existingAnamneseV2.surgeries = anamnese.surgeries;
                    existingAnamneseV2.medications = medications;
                    existingAnamneseV2.fitnessLevel = anamnese.fitnessLevel;
                    existingAnamneseV2.activityFrequency = anamnese.activityFrequency;
                    existingAnamneseV2.sessionDuration = anamnese.sessionDuration;
                    existingAnamneseV2.goals = Array.isArray(anamnese.goals) ? anamnese.goals : (anamnese.goals ? [anamnese.goals] : []);
                    existingAnamneseV2.preferredExercises = Array.isArray(anamnese.preferredExercises) ? anamnese.preferredExercises : (anamnese.preferredExercises ? [anamnese.preferredExercises] : []);
                    existingAnamneseV2.avoidedExercises = Array.isArray(anamnese.avoidedExercises) ? anamnese.avoidedExercises : (anamnese.avoidedExercises ? [anamnese.avoidedExercises] : []);
                    existingAnamneseV2.sleepHours = anamnese.sleepHours;
                    existingAnamneseV2.stressLevel = anamnese.stressLevel;
                    existingAnamneseV2.occupation = anamnese.occupation;
                    existingAnamneseV2.dietaryRestrictions = Array.isArray(anamnese.dietaryRestrictions) ? anamnese.dietaryRestrictions : (anamnese.dietaryRestrictions ? [anamnese.dietaryRestrictions] : []);
                    existingAnamneseV2.isComplete = anamnese.isComplete;
                    existingAnamneseV2.lastUpdated = anamnese.lastUpdated || new Date();
                    existingAnamneseV2.createdAt = anamnese.createdAt || new Date();
                    
                    await existingAnamneseV2.save();
                    console.log(`Anamnese V2 atualizada para o usuário ${anamnese.userId}`);
                } else {
                    console.log(`Criando nova Anamnese V2 para o usuário ${anamnese.userId}...`);
                    
                    // Converter injuries e medications para arrays, se necessário
                    const injuries = Array.isArray(anamnese.injuries) 
                        ? anamnese.injuries 
                        : (anamnese.injuries ? [anamnese.injuries] : []);
                    
                    const medications = Array.isArray(anamnese.medications) 
                        ? anamnese.medications 
                        : (anamnese.medications ? [anamnese.medications] : []);
                    
                    // Criar nova anamnese V2
                    const anamneseV2 = new AnamneseV2({
                        userId: anamnese.userId,
                        height: anamnese.height,
                        weight: anamnese.weight,
                        age: anamnese.age,
                        gender: anamnese.gender,
                        medicalHistory: anamnese.medicalHistory,
                        injuries: injuries,
                        surgeries: anamnese.surgeries,
                        medications: medications,
                        fitnessLevel: anamnese.fitnessLevel,
                        activityFrequency: anamnese.activityFrequency,
                        sessionDuration: anamnese.sessionDuration,
                        goals: Array.isArray(anamnese.goals) ? anamnese.goals : (anamnese.goals ? [anamnese.goals] : []),
                        preferredExercises: Array.isArray(anamnese.preferredExercises) ? anamnese.preferredExercises : (anamnese.preferredExercises ? [anamnese.preferredExercises] : []),
                        avoidedExercises: Array.isArray(anamnese.avoidedExercises) ? anamnese.avoidedExercises : (anamnese.avoidedExercises ? [anamnese.avoidedExercises] : []),
                        sleepHours: anamnese.sleepHours,
                        stressLevel: anamnese.stressLevel,
                        occupation: anamnese.occupation,
                        dietaryRestrictions: Array.isArray(anamnese.dietaryRestrictions) ? anamnese.dietaryRestrictions : (anamnese.dietaryRestrictions ? [anamnese.dietaryRestrictions] : []),
                        isComplete: anamnese.isComplete,
                        lastUpdated: anamnese.lastUpdated || new Date(),
                        createdAt: anamnese.createdAt || new Date()
                    });
                    
                    await anamneseV2.save();
                    console.log(`Nova Anamnese V2 criada para o usuário ${anamnese.userId}`);
                }
                
                successCount++;
            } catch (error) {
                console.error(`Erro ao migrar anamnese para o usuário ${anamnese.userId}:`, error.message);
                errorCount++;
            }
        }
        
        console.log(`\nMigração concluída!`);
        console.log(`Total de anamneses: ${anamneses.length}`);
        console.log(`Migrações bem-sucedidas: ${successCount}`);
        console.log(`Migrações com erro: ${errorCount}`);
        
    } catch (error) {
        console.error('Erro durante a migração:', error.message);
    }
};

// Função principal
const main = async () => {
    try {
        // Conectar ao MongoDB
        await connectDB();
        
        // Migrar dados
        await migrateAnamneseData();
        
        // Desconectar do MongoDB
        await mongoose.disconnect();
        console.log('Desconectado do MongoDB');
        
        console.log('Processo de migração concluído com sucesso!');
    } catch (error) {
        console.error('Erro no processo de migração:', error.message);
    }
};

// Executar função principal
main().catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
});
