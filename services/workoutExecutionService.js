// backend/services/workoutExecutionService.js
const WorkoutExecution = require('../models/workoutExecutionModel');
const User = require('../models/userModel');

/**
 * Atualiza as estatísticas do usuário com base na execução de um treino
 * @param {string} userId - ID do usuário
 * @param {number} duration - Duração do treino em minutos
 * @returns {Promise<boolean>} - Retorna true se as estatísticas foram atualizadas com sucesso
 */
const updateUserStatistics = async (userId, duration) => {
    try {
        const user = await User.findById(userId);
        
        if (!user) {
            return false;
        }
        
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
        return true;
    } catch (error) {
        console.error('Erro ao atualizar estatísticas do usuário:', error);
        return false;
    }
};

/**
 * Obtém o histórico de execuções de treino de um usuário
 * @param {string} userId - ID do usuário
 * @param {number} limit - Limite de registros a retornar
 * @returns {Promise<Array>} - Lista de execuções de treino
 */
const getUserWorkoutHistory = async (userId, limit = 10) => {
    try {
        const workoutExecutions = await WorkoutExecution.find({ 
            userId,
            completed: true
        })
        .populate('workoutId')
        .sort({ date: -1 })
        .limit(limit);
        
        return workoutExecutions;
    } catch (error) {
        console.error('Erro ao buscar histórico de treinos:', error);
        return [];
    }
};

/**
 * Calcula estatísticas de progresso com base no histórico de treinos
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} - Estatísticas de progresso
 */
const calculateProgressStats = async (userId) => {
    try {
        // Obter todas as execuções de treino concluídas
        const workoutExecutions = await WorkoutExecution.find({
            userId,
            completed: true
        }).sort({ date: 1 });
        
        if (workoutExecutions.length === 0) {
            return {
                totalWorkouts: 0,
                totalMinutes: 0,
                averageDuration: 0,
                longestStreak: 0,
                currentStreak: 0
            };
        }
        
        // Calcular estatísticas básicas
        const totalWorkouts = workoutExecutions.length;
        const totalMinutes = workoutExecutions.reduce((sum, execution) => sum + (execution.duration || 0), 0);
        const averageDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;
        const executionsByDay = {};
        // Calcular streaks
        let currentStreak = 0;
        let longestStreak = 0;
        let previousDate = null;
        
       // No loop que verifica as datas consecutivas
    workoutExecutions.forEach(execution => {
    const dateStr = new Date(execution.date).toISOString().split('T')[0];
    executionsByDay[dateStr] = true;
    });
  
  const dates = Object.keys(executionsByDay).sort();
    dates.forEach((dateStr, index) => {
        const currentDate = new Date(dateStr);
        
        if (previousDate) {
        const diffDays = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
            currentStreak += 1;
        } else {
            currentStreak = 1;
        }
    
        longestStreak = Math.max(longestStreak, currentStreak);
        } else {
        currentStreak = 1;
        }
    
        previousDate = currentDate;
    });
  
        // Validar streak atual
        const lastWorkoutDate = new Date(dates[dates.length - 1]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if ((today - lastWorkoutDate) / (1000 * 60 * 60 * 24) > 1) {
            currentStreak = 0;
        } 
        
        return {
            totalWorkouts,
            totalMinutes,
            averageDuration,
            longestStreak,
            currentStreak
        };
    } catch (error) {
        console.error('Erro ao calcular estatísticas de progresso:', error);
        return {
            totalWorkouts: 0,
            totalMinutes: 0,
            averageDuration: 0,
            longestStreak: 0,
            currentStreak: 0
        };
    }
};

module.exports = {
    updateUserStatistics,
    getUserWorkoutHistory,
    calculateProgressStats
};
