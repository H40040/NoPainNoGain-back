// backend/scripts/migrateData.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Treino = require('../models/treinoModel');
const Workout = require('../models/workoutModel');
const Exercise = require('../models/exerciseModel');
const Client = require('../models/clientModel');

// Função para extrair exercícios do texto do treino gerado
const extractExercisesFromText = (treinoGerado) => {
  const exercises = [];
  
  // Expressões regulares para identificar exercícios
  const exerciseRegex = /(\d+\.\s*)([\w\s-]+)(\s*-\s*)(\d+)(\s*séries\s*)(de\s*)?(\d+)(\s*repetições)/gi;
  const matches = treinoGerado.matchAll(exerciseRegex);
  
  for (const match of matches) {
    if (match && match.length >= 8) {
      const name = match[2].trim();
      const sets = parseInt(match[4], 10);
      const reps = match[7];
      
      exercises.push({
        name,
        sets,
        reps: `${reps} repetições`,
        muscleGroup: 'Não especificado', // Seria necessário um processamento mais avançado para identificar o grupo muscular
        rest: 60, // Valor padrão de descanso em segundos
      });
    }
  }
  
  return exercises;
};

// Função principal para migrar dados
const migrateData = async () => {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado ao MongoDB com sucesso!');
    
    // Buscar todos os treinos existentes
    const treinos = await Treino.find({});
    console.log(`Encontrados ${treinos.length} treinos para migração.`);
    
    // Para cada treino, criar um workout e seus exercícios
    for (const treino of treinos) {
      console.log(`Migrando treino para o usuário ${treino.userId}...`);
      
      // Extrair exercícios do texto do treino
      const extractedExercises = extractExercisesFromText(treino.treinoGerado);
      
      // Criar exercícios no banco de dados
      const exerciseIds = [];
      for (const exerciseData of extractedExercises) {
        const exercise = new Exercise(exerciseData);
        await exercise.save();
        exerciseIds.push(exercise._id);
      }
      
      // Criar workout
      const workout = new Workout({
        userId: treino.userId,
        name: `Treino IA - ${new Date(treino.createdAt).toLocaleDateString('pt-BR')}`,
        description: 'Treino gerado por IA com base nos dados fornecidos.',
        type: treino.nivel || 'personalizado',
        exercises: exerciseIds,
        isAIGenerated: true,
        createdAt: treino.createdAt
      });
      
      await workout.save();
      
      // Atualizar estatísticas do cliente
      await Client.findByIdAndUpdate(treino.userId, {
        $inc: { 'statistics.totalWorkouts': 1 }
      });
      
      console.log(`Treino migrado com sucesso! ID: ${workout._id}`);
    }
    
    console.log('Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante a migração:', error);
    process.exit(1);
  }
};

// Executar a migração
migrateData();
