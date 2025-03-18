const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Importar modelos
const Client = require('../models/clientModel');
const UserPreferences = require('../models/userPreferencesModel');
const UserStatistics = require('../models/userStatisticsModel');
const MedicalInfo = require('../models/medicalInfoModel');
const WorkoutGenerationSettings = require('../models/workoutGenerationSettingsModel');
const Anamnese = require('../models/anamneseModel');
const Treino = require('../models/treinoModel');
const Workout = require('../models/workoutModel');
const Exercise = require('../models/exerciseModel');
const WorkoutExecution = require('../models/workoutExecutionModel');

// Configurar variáveis de ambiente
dotenv.config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conexão com MongoDB estabelecida com sucesso'))
.catch(err => {
  console.error('Erro ao conectar com MongoDB:', err);
  process.exit(1);
});

// Função para migrar dados do modelo Client para os novos modelos
const migrateClientData = async () => {
  try {
    console.log('Iniciando migração de dados de clientes...');
    
    // Buscar todos os clientes
    const clients = await Client.find({});
    console.log(`Encontrados ${clients.length} clientes para migração`);
    
    // Para cada cliente, criar registros nos novos modelos
    for (const client of clients) {
      console.log(`Migrando dados para o cliente: ${client.name} (${client.email})`);
      
      // Criar UserPreferences
      const userPreferencesExists = await UserPreferences.findOne({ userId: client._id });
      if (!userPreferencesExists) {
        await UserPreferences.create({
          userId: client._id,
          workoutDays: client.workoutDays || ['segunda', 'quarta', 'sexta'],
          workoutTime: client.workoutTime || '18:00',
          workoutDuration: client.workoutDuration || 60,
          workoutLocation: client.workoutLocation || 'academia',
          preferredExercises: client.preferredExercises || [],
          excludedExercises: client.excludedExercises || [],
          fitnessGoals: client.fitnessGoals || ['hipertrofia'],
          notificationPreferences: {
            workoutReminders: true,
            progressUpdates: true,
            achievementAlerts: true
          }
        });
        console.log('  - Preferências do usuário criadas');
      }
      
      // Criar UserStatistics
      const userStatisticsExists = await UserStatistics.findOne({ userId: client._id });
      if (!userStatisticsExists) {
        await UserStatistics.create({
          userId: client._id,
          totalWorkouts: 0,
          totalExercises: 0,
          totalWorkoutTime: 0,
          totalCaloriesBurned: 0,
          longestStreak: 0,
          currentStreak: 0,
          lastWorkoutDate: null,
          weeklyWorkouts: 0,
          monthlyWorkouts: 0,
          weightHistory: client.weightHistory || [],
          heightHistory: client.heightHistory || [],
          bodyFatHistory: client.bodyFatHistory || []
        });
        console.log('  - Estatísticas do usuário criadas');
      }
      
      // Criar MedicalInfo
      const medicalInfoExists = await MedicalInfo.findOne({ userId: client._id });
      if (!medicalInfoExists) {
        await MedicalInfo.create({
          userId: client._id,
          allergies: client.allergies || [],
          medicalConditions: client.medicalConditions || [],
          injuries: client.injuries || [],
          medications: client.medications || [],
          bloodType: client.bloodType || null,
          emergencyContact: {
            name: client.emergencyContactName || '',
            phone: client.emergencyContactPhone || '',
            relationship: client.emergencyContactRelationship || ''
          }
        });
        console.log('  - Informações médicas criadas');
      }
      
      // Criar WorkoutGenerationSettings
      const workoutGenSettingsExists = await WorkoutGenerationSettings.findOne({ userId: client._id });
      if (!workoutGenSettingsExists) {
        await WorkoutGenerationSettings.create({
          userId: client._id,
          fitnessLevel: client.fitnessLevel || 'intermediário',
          workoutIntensity: client.workoutIntensity || 'moderado',
          workoutTypes: client.workoutTypes || ['hipertrofia'],
          focusAreas: client.focusAreas || [],
          equipmentAvailable: client.equipmentAvailable || ['halteres', 'barra', 'máquinas'],
          timeAvailable: client.timeAvailable || 60,
          daysPerWeek: client.daysPerWeek || 3,
          aiPreferences: {
            includeWarmup: true,
            includeStretching: true,
            varietyLevel: 'médio'
          }
        });
        console.log('  - Configurações de geração de treino criadas');
      }
    }
    
    console.log('Migração de dados de clientes concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao migrar dados de clientes:', error);
  }
};

// Função para migrar dados do modelo Treino para o modelo Anamnese
const migrateTreinoData = async () => {
  try {
    console.log('Iniciando migração de dados de treinos para anamnese...');
    
    // Buscar todos os treinos
    const treinos = await Treino.find({});
    console.log(`Encontrados ${treinos.length} treinos para migração`);
    
    // Para cada treino, criar um registro de anamnese
    for (const treino of treinos) {
      // Verificar se o treino tem userId válido
      if (!treino.userId) {
        console.log(`Ignorando treino sem userId válido`);
        continue;
      }
      
      console.log(`Migrando treino para o usuário: ${treino.userId}`);
      
      // Verificar se já existe uma anamnese para este usuário
      const anamneseExists = await Anamnese.findOne({ userId: treino.userId });
      if (!anamneseExists) {
        // Preparar o histórico médico como string
        const medicalHistoryText = `Histórico: ${treino.historico || 'Nenhum'}. Medicamentos: ${treino.medicamentos || 'Nenhum'}`;
        
        // Normalizar o nível de fitness para corresponder ao enum no modelo
        let fitnessLevel = 'iniciante';
        if (treino.nivel) {
          const nivelNormalizado = treino.nivel.toLowerCase();
          if (nivelNormalizado === 'avancado' || nivelNormalizado === 'avançado') {
            fitnessLevel = 'avançado';
          } else if (nivelNormalizado === 'intermediario' || nivelNormalizado === 'intermediário') {
            fitnessLevel = 'intermediário';
          } else if (nivelNormalizado === 'iniciante' || nivelNormalizado === 'beginner') {
            fitnessLevel = 'iniciante';
          }
        }
        
        // Verificar se o valor está de acordo com o enum no modelo
        if (fitnessLevel !== 'iniciante' && fitnessLevel !== 'intermediário' && fitnessLevel !== 'avançado') {
          fitnessLevel = 'iniciante';
        }
        
        await Anamnese.create({
          userId: treino.userId,
          height: treino.altura || 0,
          weight: treino.peso || 0,
          age: treino.idade || 0,
          medicalHistory: medicalHistoryText,
          medications: treino.medicamentos || '',
          fitnessLevel: fitnessLevel,
          activityFrequency: treino.frequencia || 0,
          sessionDuration: treino.duracao || 0,
          goals: treino.objetivos ? [treino.objetivos] : [],
          preferredExercises: [],
          avoidedExercises: [],
          occupation: '',
          dietaryRestrictions: [],
          isComplete: true
        });
        console.log('  - Anamnese criada com sucesso');
      }
    }
    
    console.log('Migração de dados de treinos para anamnese concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao migrar dados de treinos para anamnese:', error);
  }
};

// Função para atualizar os índices nos modelos existentes
const updateExistingModelIndexes = async () => {
  try {
    console.log('Atualizando índices nos modelos existentes...');
    
    // Criar índices para o modelo Exercise
    await Exercise.collection.createIndex({ name: 1 });
    await Exercise.collection.createIndex({ muscleGroup: 1 });
    await Exercise.collection.createIndex({ difficulty: 1 });
    await Exercise.collection.createIndex({ category: 1 });
    await Exercise.collection.createIndex({ isActive: 1 });
    await Exercise.collection.createIndex({ createdAt: 1 });
    await Exercise.collection.createIndex({ muscleGroup: 1, difficulty: 1 });
    await Exercise.collection.createIndex({ category: 1, isActive: 1 });
    await Exercise.collection.createIndex({ name: 'text', description: 'text' });
    
    // Criar índices para o modelo Workout
    await Workout.collection.createIndex({ userId: 1 });
    await Workout.collection.createIndex({ name: 1 });
    await Workout.collection.createIndex({ type: 1 });
    await Workout.collection.createIndex({ difficulty: 1 });
    await Workout.collection.createIndex({ isAIGenerated: 1 });
    await Workout.collection.createIndex({ isActive: 1 });
    await Workout.collection.createIndex({ createdAt: 1 });
    await Workout.collection.createIndex({ userId: 1, isActive: 1 });
    await Workout.collection.createIndex({ userId: 1, type: 1 });
    await Workout.collection.createIndex({ userId: 1, isAIGenerated: 1 });
    await Workout.collection.createIndex({ name: 'text', description: 'text' });
    
    // Criar índices para o modelo WorkoutExecution
    await WorkoutExecution.collection.createIndex({ userId: 1 });
    await WorkoutExecution.collection.createIndex({ workoutId: 1 });
    await WorkoutExecution.collection.createIndex({ date: 1 });
    await WorkoutExecution.collection.createIndex({ completed: 1 });
    await WorkoutExecution.collection.createIndex({ userId: 1, date: -1 });
    await WorkoutExecution.collection.createIndex({ workoutId: 1, date: -1 });
    await WorkoutExecution.collection.createIndex({ userId: 1, completed: 1 });
    
    console.log('Índices atualizados com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar índices:', error);
  }
};

// Função principal para executar todas as migrações
const migrateDatabase = async () => {
  try {
    console.log('Iniciando migração do banco de dados...');
    
    // Migrar dados de clientes
    await migrateClientData();
    
    // Migrar dados de treinos para anamnese
    await migrateTreinoData();
    
    // Atualizar índices nos modelos existentes
    await updateExistingModelIndexes();
    
    console.log('Migração do banco de dados concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante a migração do banco de dados:', error);
    process.exit(1);
  }
};

// Executar a função de migração
migrateDatabase();
