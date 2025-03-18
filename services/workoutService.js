// backend/services/workoutService.js
const Workout = require('../models/workoutModel');
const Exercise = require('../models/exerciseModel');
const User = require('../models/userModel');
const Treino = require('../models/treinoModel'); // Mantido para compatibilidade

/**
 * Salva um treino gerado por IA
 * @param {string} userId - ID do usuário
 * @param {Object} data - Dados do formulário de anamnese
 * @param {string} treinoGerado - Texto do treino gerado pela IA
 * @returns {Promise<boolean>} - Retorna true se o treino foi salvo com sucesso
 */
const saveWorkout = async (userId, data, treinoGerado) => {
    try {
        // // 1. Salvar no modelo antigo para manter compatibilidade
        // const novoTreino = new Treino({ userId, ...data, treinoGerado });
        // await novoTreino.save();
        
        // 2. Extrair exercícios do texto gerado
        const extractedExercises = extractExercisesFromText(treinoGerado);
        
        // 3. Criar exercícios no banco de dados
        const exercisesCreated = await Exercise.insertMany(extractedExercises);
        const exerciseIds = exercisesCreated.map(exercise => exercise._id);
        
        // 4. Criar o workout
        const workout = new Workout({
            userId,
            name: `Treino IA - ${new Date().toLocaleDateString('pt-BR')}`,
            description: 'Treino gerado por IA com base nos dados fornecidos.',
            type: data.nivel || 'personalizado',
            exercises: exerciseIds,
            isAIGenerated: true
        });
        
        await workout.save();
        
        // 5. Atualizar estatísticas do usuário
        await User.findByIdAndUpdate(userId, {
            $inc: { 'statistics.totalWorkouts': 1 },
            $set: { 'statistics.lastWorkoutDate': new Date() }
        });
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar workout:', error);
        return false;
    }
};

/**
 * Extrai exercícios do texto do treino gerado
 * @param {string} treinoGerado - Texto do treino gerado pela IA
 * @returns {Array} - Lista de objetos de exercícios
 */
const extractExercisesFromText = (treinoGerado) => {
    const exercises = [];
    const exerciseRegex = /(\d+)\.\s*([^\-]+)-\s*(\d+)\s*séries?\s*(?:de)?\s*(\d+)\s*repetições?/gi;
    const matches = [...treinoGerado.matchAll(exerciseRegex)];

    matches.forEach(match => {
        const [, order, name, sets, reps] = match;
        exercises.push({
            name: name.trim(),
            sets: parseInt(sets),
            reps: `${reps} repetições`,
            muscleGroup: 'Não especificado', 
            rest: 60,
            order: parseInt(order)
        });
    });

    return exercises;
};


/**
 * Obtém todos os treinos de um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} - Lista de treinos
 */
const getUserWorkouts = async (userId) => {
    try {
        return await Workout.find({ userId })
            .populate('exercises')
            .sort({ createdAt: -1 });
    } catch (error) {
        console.error('Erro ao buscar workouts do usuário:', error);
        throw new Error('Falha ao buscar treinos.');
    }
};


/**
 * Obtém um treino pelo ID
 * @param {string} workoutId - ID do treino
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object|null>} - Treino encontrado ou null
 */
const getWorkoutById = async (workoutId, userId) => {
    try {
        const workout = await Workout.findOne({
            _id: workoutId,
            userId
        }).populate('exercises');
        return workout;
    } catch (error) {
        console.error('Erro ao buscar workout por ID:', error);
        return null;
    }
};

module.exports = {
    saveWorkout,
    getUserWorkouts,
    getWorkoutById,
    extractExercisesFromText
};
