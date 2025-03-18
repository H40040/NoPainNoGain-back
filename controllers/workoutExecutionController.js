// backend/controllers/workoutExecutionController.js
const WorkoutExecution = require('../models/workoutExecutionModel');
const Workout = require('../models/workoutModel');
const User = require('../models/userModel');

// Reusable error handler
const handleServerError = (res, error) => {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
};

// Start a workout execution
exports.startWorkout = async (req, res) => {
    try {
        const userId = req.userId;
        const { workoutId } = req.body;
        
        // Verificar se o treino existe e pertence ao usuário
        const workout = await Workout.findOne({
            _id: workoutId,
            userId
        }).populate('exercises');
        
        if (!workout) {
            return res.status(404).json({
                success: false,
                error: 'Treino não encontrado ou você não tem permissão para acessá-lo'
            });
        }
        
        // Criar uma nova execução de treino
        const workoutExecution = new WorkoutExecution({
            userId,
            workoutId,
            date: new Date(),
            completed: false,
            exerciseResults: workout.exercises.map(exercise => ({
                exerciseId: exercise._id,
                sets: Array(exercise.sets || 3).fill().map(() => ({
                    weight: 0,
                    reps: 0,
                    completed: false
                }))
            }))
        });
        
        await workoutExecution.save();
        
        res.status(201).json({
            success: true,
            message: 'Treino iniciado com sucesso',
            workoutExecution
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Complete a workout execution
exports.completeWorkout = async (req, res) => {
    try {
        const userId = req.userId;
        const executionId = req.params.id;
        const { duration, exerciseResults } = req.body;
        
        // Buscar a execução do treino
        const workoutExecution = await WorkoutExecution.findOne({
            _id: executionId,
            userId
        });
        
        if (!workoutExecution) {
            return res.status(404).json({
                success: false,
                error: 'Execução de treino não encontrada ou você não tem permissão para acessá-la'
            });
        }
        
        // Atualizar a execução do treino
        workoutExecution.completed = true;
        workoutExecution.duration = duration;
        
        if (exerciseResults) {
            workoutExecution.exerciseResults = exerciseResults;
        }
        
        await workoutExecution.save();
        
        // Atualizar estatísticas do usuário
        const user = await User.findById(userId);
        
        if (user) {
            // Atualizar estatísticas
            user.statistics.totalWorkouts += 1;
            user.statistics.totalMinutes += (duration || 0);
            user.statistics.lastWorkoutDate = new Date();
            
            // Calcular streak (dias consecutivos de treino)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const lastWorkout = user.statistics.lastWorkoutDate;
            if (lastWorkout) {
                const lastWorkoutDay = new Date(lastWorkout);
                lastWorkoutDay.setHours(0, 0, 0, 0);
                
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastWorkoutDay.getTime() === yesterday.getTime()) {
                    user.statistics.streakDays += 1;
                } else if (lastWorkoutDay.getTime() !== today.getTime()) {
                    user.statistics.streakDays = 1;
                }
            } else {
                user.statistics.streakDays = 1;
            }
            
            await user.save();
        }
        
        res.json({
            success: true,
            message: 'Treino concluído com sucesso',
            workoutExecution
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Update exercise results during workout
exports.updateExerciseResults = async (req, res) => {
    try {
        const userId = req.userId;
        const executionId = req.params.id;
        const { exerciseId, setIndex, weight, reps, completed } = req.body;
        
        // Buscar a execução do treino
        const workoutExecution = await WorkoutExecution.findOne({
            _id: executionId,
            userId
        });
        
        if (!workoutExecution) {
            return res.status(404).json({
                success: false,
                error: 'Execução de treino não encontrada ou você não tem permissão para acessá-la'
            });
        }
        
        // Encontrar o exercício na lista de resultados
        const exerciseResultIndex = workoutExecution.exerciseResults.findIndex(
            result => result.exerciseId.toString() === exerciseId
        );
        
        if (exerciseResultIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Exercício não encontrado nesta execução de treino'
            });
        }
        
        // Atualizar o set específico
        if (setIndex >= 0 && setIndex < workoutExecution.exerciseResults[exerciseResultIndex].sets.length) {
            const set = workoutExecution.exerciseResults[exerciseResultIndex].sets[setIndex];
            
            if (weight !== undefined) set.weight = weight;
            if (reps !== undefined) set.reps = reps;
            if (completed !== undefined) set.completed = completed;
            
            await workoutExecution.save();
            
            res.json({
                success: true,
                message: 'Resultado do exercício atualizado com sucesso',
                workoutExecution
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Índice de set inválido'
            });
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

// Get all workout executions for a user
exports.getUserWorkoutExecutions = async (req, res) => {
    try {
        const userId = req.userId;
        const workoutExecutions = await WorkoutExecution.find({ userId })
            .populate('workoutId')
            .sort({ date: -1 });
        
        res.json({ success: true, workoutExecutions });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Get workout execution by ID
exports.getWorkoutExecutionById = async (req, res) => {
    try {
        const executionId = req.params.id;
        const userId = req.userId;
        
        const workoutExecution = await WorkoutExecution.findOne({ 
            _id: executionId,
            userId
        })
        .populate('workoutId')
        .populate('exerciseResults.exerciseId');
        
        if (!workoutExecution) {
            return res.status(404).json({
                success: false,
                error: 'Execução de treino não encontrada ou você não tem permissão para acessá-la'
            });
        }
        
        res.json({ success: true, workoutExecution });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Get workout executions by workout ID
exports.getWorkoutExecutionsByWorkoutId = async (req, res) => {
    try {
        const workoutId = req.params.workoutId;
        const userId = req.userId;
        
        const workoutExecutions = await WorkoutExecution.find({ 
            workoutId,
            userId
        })
        .sort({ date: -1 });
        
        res.json({ success: true, workoutExecutions });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Delete workout execution
exports.deleteWorkoutExecution = async (req, res) => {
    try {
        const executionId = req.params.id;
        const userId = req.userId;
        
        const workoutExecution = await WorkoutExecution.findOneAndDelete({
            _id: executionId,
            userId
        });
        
        if (!workoutExecution) {
            return res.status(404).json({
                success: false,
                error: 'Execução de treino não encontrada ou você não tem permissão para excluí-la'
            });
        }
        
        // Se a execução estava marcada como concluída, atualizar estatísticas do usuário
        if (workoutExecution.completed) {
            await User.findByIdAndUpdate(userId, {
                $inc: { 'statistics.totalWorkouts': -1, 'statistics.totalMinutes': -(workoutExecution.duration || 0) }
            });
        }
        
        res.json({
            success: true,
            message: 'Execução de treino excluída com sucesso'
        });
    } catch (error) {
        handleServerError(res, error);
    }
};
