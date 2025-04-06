// backend/controllers/workoutController.js
const Workout = require('../models/workoutModel');
const Exercise = require('../models/exerciseModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const logger = require('../config/logger');
const axios = require('axios');
//const { formatPromptData } = require('../../utils/promptUtils');

// Reusable error handler
const handleServerError = (res, error) => {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
};

// Create a new workout
exports.createWorkout = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, description, type, exercises = [] } = req.body;

        // Validação explícita dos campos obrigatórios
        if (!name || !type) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios (nome e tipo) estão faltando.'
            });
        }

        const newWorkout = new Workout({
            userId,
            name,
            description,
            type,
            exercises,
            isAIGenerated: false
        });

        await newWorkout.save();

        await User.findByIdAndUpdate(userId, {
            $inc: { 'statistics.totalWorkouts': 1 }
        });

        res.status(201).json({
            success: true,
            message: 'Treino criado com sucesso',
            workout: newWorkout
        });
    } catch (error) {
        handleServerError(res, error);
    }
};


// Get all workouts for a user
exports.getUserWorkouts = async (req, res) => {
    try {
        const userId = req.user._id;
        
        logger.debug('Fetching workouts for user', { userId });
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: 'ID de usuário inválido'
            });
        }
        
        const workouts = await Workout.find({ userId })
            .populate('exercises')
            .sort({ createdAt: -1 })
            .maxTimeMS(5000);
            
        if (!workouts || workouts.length === 0) {
            logger.info('No workouts found for user', { userId });
            return res.status(404).json({
                success: false,
                error: 'Nenhum treino encontrado para este usuário',
                suggestion: 'Crie seu primeiro treino para começar'
            });
        }
        
        logger.debug(`Found ${workouts.length} workouts for user`, { userId });
        
        res.status(200).json({
            success: true,
            count: workouts.length,
            data: workouts
        });
        
    } catch (err) {
        logger.error('Error fetching workouts', {
            error: err.message,
            stack: err.stack,
            userId: req.user?._id
        });
        
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar treinos',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get workout by ID
exports.getWorkoutById = async (req, res) => {
    try {
        const workoutId = req.params.id;
        const userId = req.userId;
        
        const workout = await Workout.findOne({ 
            _id: workoutId,
            userId
        }).populate('exercises');
        
        if (!workout) {
            return res.status(404).json({
                success: false,
                error: 'Treino não encontrado'
            });
        }
        
        res.json({ success: true, workout });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Update workout by ID
exports.updateWorkout = async (req, res) => {
    try {
        const workoutId = req.params.id;
        const userId = req.userId;
        const updateData = req.body;
        
        // Garantir que o userId não seja alterado
        delete updateData.userId;
        updateData.updatedAt = Date.now();
        
        const workout = await Workout.findOneAndUpdate(
            { _id: workoutId, userId },
            updateData,
            { new: true, runValidators: true }
        ).populate('exercises');
        
        if (!workout) {
            return res.status(404).json({
                success: false,
                error: 'Treino não encontrado ou você não tem permissão para editá-lo'
            });
        }
        
        res.json({
            success: true,
            message: 'Treino atualizado com sucesso',
            workout
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (const key in error.errors) {
                validationErrors[key] = error.errors[key].message;
            }
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: validationErrors
            });
        }
        handleServerError(res, error);
    }
};

// Delete workout by ID
exports.deleteWorkout = async (req, res) => {
    try {
        const workoutId = req.params.id;
        const userId = req.userId;
        
        const workout = await Workout.findOneAndDelete({
            _id: workoutId,
            userId
        });
        
        if (!workout) {
            return res.status(404).json({
                success: false,
                error: 'Treino não encontrado ou você não tem permissão para excluí-lo'
            });
        }
        
        res.json({
            success: true,
            message: 'Treino excluído com sucesso'
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Add exercise to workout
exports.addExerciseToWorkout = async (req, res) => {
    try {
        const { workoutId, exerciseId } = req.params;
        const userId = req.userId;
        
        // Verificar se o exercício existe
        const exercise = await Exercise.findById(exerciseId);
        if (!exercise) {
            return res.status(404).json({
                success: false,
                error: 'Exercício não encontrado'
            });
        }
        
        // Verificar se o treino existe e pertence ao usuário
        const workout = await Workout.findOne({
            _id: workoutId,
            userId
        });
        
        if (!workout) {
            return res.status(404).json({
                success: false,
                error: 'Treino não encontrado ou você não tem permissão para editá-lo'
            });
        }
        
        // Adicionar exercício ao treino se ainda não estiver incluído
        if (!workout.exercises.includes(exerciseId)) {
            workout.exercises.push(exerciseId);
            workout.updatedAt = Date.now();
            await workout.save();
        }
        
        res.json({
            success: true,
            message: 'Exercício adicionado ao treino com sucesso',
            workout
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Remove exercise from workout
exports.removeExerciseFromWorkout = async (req, res) => {
    try {
        const { workoutId, exerciseId } = req.params;
        const userId = req.userId;
        
        // Verificar se o treino existe e pertence ao usuário
        const workout = await Workout.findOne({
            _id: workoutId,
            userId
        });
        
        if (!workout) {
            return res.status(404).json({
                success: false,
                error: 'Treino não encontrado ou você não tem permissão para editá-lo'
            });
        }
        
        // Remover exercício do treino
        workout.exercises = workout.exercises.filter(
            exercise => exercise.toString() !== exerciseId
        );
        workout.updatedAt = Date.now();
        await workout.save();
        
        res.json({
            success: true,
            message: 'Exercício removido do treino com sucesso',
            workout
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Clone workout
exports.cloneWorkout = async (req, res) => {
    try {
        const workoutId = req.params.id;
        const userId = req.userId;
        const { name } = req.body;
        
        // Buscar o treino original
        const originalWorkout = await Workout.findOne({
            _id: workoutId,
            userId
        });
        
        if (!originalWorkout) {
            return res.status(404).json({
                success: false,
                error: 'Treino não encontrado ou você não tem permissão para cloná-lo'
            });
        }
        
        // Criar um novo treino baseado no original
        const newWorkout = new Workout({
            userId,
            name: name || `Cópia de ${originalWorkout.name}`,
            description: originalWorkout.description,
            type: originalWorkout.type,
            exercises: [...originalWorkout.exercises],
            isAIGenerated: originalWorkout.isAIGenerated
        });
        
        await newWorkout.save();
        
        // Atualizar estatísticas do usuário
        await User.findByIdAndUpdate(userId, {
            $inc: { 'statistics.totalWorkouts': 1 }
        });
        
        res.status(201).json({
            success: true,
            message: 'Treino clonado com sucesso',
            workout: newWorkout
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Function to format the user data for the prompt
const formatPrompt = (data) => {
    let dataPrompt = `## Informações do Aluno\n`;
    dataPrompt += data.nome ? `Nome: ${data.nome}\n` : '';
    dataPrompt += data.idade ? `Idade: ${data.idade}\n` : '';
    dataPrompt += data.peso ? `Peso: ${data.peso} kg\n` : '';
    dataPrompt += data.altura ? `Altura: ${data.altura} cm\n` : '';
    dataPrompt += data.historico ? `Histórico de Lesões e Doenças: ${data.historico}\n` : '';
    dataPrompt += data.queixas ? `Queixas, Sintomas e Preocupações: ${data.queixas}\n` : '';
    dataPrompt += data.habitos ? `Hábitos: ${data.habitos}\n` : '';
    dataPrompt += data.medicamentos ? `Uso de Medicamentos e Suplementos: ${data.medicamentos}\n` : '';
    dataPrompt += `Objetivos Específicos: ${data.objetivos}\n\n`;
    dataPrompt += `## Informações do Treino\n`;
    dataPrompt += `Frequência: ${data.frequencia}x por semana\n`;
    dataPrompt += `Duração: ${data.duracao} min\n`;
    dataPrompt += `Nível: ${data.nivel}\n`;
    dataPrompt += data.preferencias ? `Preferências: ${data.preferencias}\n` : '';
    dataPrompt += `\n## Gerar treino personalizado.\n`;
    return dataPrompt;
};

// Function to generate the workout plan using the Gemini API
const generateWorkout = async (prompt) => {
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                model: "models/gemini-1.5-flash",
                contents: [{ parts: [{ text: prompt }] }]
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.status !== 200) {
            console.error("Erro na API Gemini:", response.data);
            return null;
        }

        return response.data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (apiError) {
        console.error("Erro na API Gemini:", apiError.response?.data || apiError.message);
        return null;
    }
};


// Generate AI workout
// Gerar treino com IA e salvar em um único modelo
exports.generateAIWorkout = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID não encontrado.' });
        }

        const data = req.body;
        const dataPrompt = formatPrompt(data);
        const prompt = JSON.stringify(dataPrompt);
        const treinoGerado = await generateWorkout(prompt);

        if (!treinoGerado) {
            return res.status(500).json({ success: false, error: "Erro ao gerar treino." });
        }

        const newWorkout = new Workout({
            userId,
            name: `Treino IA - ${new Date().toLocaleDateString('pt-BR')}`,
            description: treinoGerado,
            type: data.nivel || 'personalizado',
            isAIGenerated: true
        });

        await newWorkout.save();

        await User.findByIdAndUpdate(userId, {
            $inc: { 'statistics.totalWorkouts': 1 }
        });

        res.json({
            success: true,
            treinoGerado,
            workout: newWorkout,
            message: "Treino gerado e salvo com sucesso!"
        });

    } catch (error) {
        handleServerError(res, error);
    }
};
