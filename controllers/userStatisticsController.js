// backend/controllers/userStatisticsController.js
const UserStatistics = require('../models/userStatisticsModel');
const WorkoutExecution = require('../models/workoutExecutionModel');

// Reusable error handler
const handleServerError = (res, error) => {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
};

// Get user statistics
exports.getUserStatistics = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Check if the requesting user is authorized to access these statistics
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a acessar estatísticas de outro usuário'
            });
        }
        
        const userStatistics = await UserStatistics.findOne({ userId });
        
        if (!userStatistics) {
            return res.status(404).json({
                success: false,
                error: 'Estatísticas do usuário não encontradas'
            });
        }
        
        res.json({
            success: true,
            userStatistics
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Update user statistics
exports.updateUserStatistics = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Check if the requesting user is authorized to update these statistics
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a atualizar estatísticas de outro usuário'
            });
        }
        
        const {
            totalWorkouts,
            totalExercises,
            totalWorkoutTime,
            totalCaloriesBurned,
            longestStreak,
            currentStreak,
            lastWorkoutDate,
            weeklyWorkouts,
            monthlyWorkouts,
            weightHistory,
            heightHistory,
            bodyFatHistory
        } = req.body;
        
        // Find existing statistics or create new ones
        let userStatistics = await UserStatistics.findOne({ userId });
        
        if (userStatistics) {
            // Update existing statistics
            if (totalWorkouts !== undefined) userStatistics.totalWorkouts = totalWorkouts;
            if (totalExercises !== undefined) userStatistics.totalExercises = totalExercises;
            if (totalWorkoutTime !== undefined) userStatistics.totalWorkoutTime = totalWorkoutTime;
            if (totalCaloriesBurned !== undefined) userStatistics.totalCaloriesBurned = totalCaloriesBurned;
            if (longestStreak !== undefined) userStatistics.longestStreak = longestStreak;
            if (currentStreak !== undefined) userStatistics.currentStreak = currentStreak;
            if (lastWorkoutDate) userStatistics.lastWorkoutDate = lastWorkoutDate;
            if (weeklyWorkouts !== undefined) userStatistics.weeklyWorkouts = weeklyWorkouts;
            if (monthlyWorkouts !== undefined) userStatistics.monthlyWorkouts = monthlyWorkouts;
            
            // Handle history arrays (add new entries)
            if (weightHistory && weightHistory.length > 0) {
                weightHistory.forEach(entry => {
                    userStatistics.weightHistory.push(entry);
                });
            }
            
            if (heightHistory && heightHistory.length > 0) {
                heightHistory.forEach(entry => {
                    userStatistics.heightHistory.push(entry);
                });
            }
            
            if (bodyFatHistory && bodyFatHistory.length > 0) {
                bodyFatHistory.forEach(entry => {
                    userStatistics.bodyFatHistory.push(entry);
                });
            }
            
            await userStatistics.save();
            
            res.json({
                success: true,
                message: 'Estatísticas atualizadas com sucesso',
                userStatistics
            });
        } else {
            // Create new statistics
            userStatistics = new UserStatistics({
                userId,
                totalWorkouts: totalWorkouts || 0,
                totalExercises: totalExercises || 0,
                totalWorkoutTime: totalWorkoutTime || 0,
                totalCaloriesBurned: totalCaloriesBurned || 0,
                longestStreak: longestStreak || 0,
                currentStreak: currentStreak || 0,
                lastWorkoutDate: lastWorkoutDate || null,
                weeklyWorkouts: weeklyWorkouts || 0,
                monthlyWorkouts: monthlyWorkouts || 0,
                weightHistory: weightHistory || [],
                heightHistory: heightHistory || [],
                bodyFatHistory: bodyFatHistory || []
            });
            
            await userStatistics.save();
            
            res.status(201).json({
                success: true,
                message: 'Estatísticas criadas com sucesso',
                userStatistics
            });
        }
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

// Add weight entry
exports.addWeightEntry = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Check if the requesting user is authorized
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a atualizar dados de outro usuário'
            });
        }
        
        const { weight, date } = req.body;
        
        if (!weight) {
            return res.status(400).json({
                success: false,
                error: 'Peso é obrigatório'
            });
        }
        
        // Find existing statistics or create new ones
        let userStatistics = await UserStatistics.findOne({ userId });
        
        if (!userStatistics) {
            userStatistics = new UserStatistics({
                userId,
                weightHistory: []
            });
        }
        
        // Add new weight entry
        userStatistics.weightHistory.push({
            value: weight,
            date: date || new Date()
        });
        
        await userStatistics.save();
        
        res.json({
            success: true,
            message: 'Peso registrado com sucesso',
            weightHistory: userStatistics.weightHistory
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Add body fat entry
exports.addBodyFatEntry = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Check if the requesting user is authorized
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a atualizar dados de outro usuário'
            });
        }
        
        const { bodyFat, date } = req.body;
        
        if (!bodyFat) {
            return res.status(400).json({
                success: false,
                error: 'Percentual de gordura corporal é obrigatório'
            });
        }
        
        // Find existing statistics or create new ones
        let userStatistics = await UserStatistics.findOne({ userId });
        
        if (!userStatistics) {
            userStatistics = new UserStatistics({
                userId,
                bodyFatHistory: []
            });
        }
        
        // Add new body fat entry
        userStatistics.bodyFatHistory.push({
            value: bodyFat,
            date: date || new Date()
        });
        
        await userStatistics.save();
        
        res.json({
            success: true,
            message: 'Percentual de gordura corporal registrado com sucesso',
            bodyFatHistory: userStatistics.bodyFatHistory
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Calculate and update user statistics
exports.calculateUserStatistics = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Check if the requesting user is authorized
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a calcular estatísticas de outro usuário'
            });
        }
        
        // Find or create user statistics
        let userStatistics = await UserStatistics.findOne({ userId });
        
        if (!userStatistics) {
            userStatistics = new UserStatistics({ userId });
        }
        
        // Get completed workout executions
        const workoutExecutions = await WorkoutExecution.find({ 
            userId, 
            completed: true 
        }).sort({ date: 1 });
        
        if (workoutExecutions.length === 0) {
            return res.json({
                success: true,
                message: 'Nenhum treino completado para calcular estatísticas',
                userStatistics
            });
        }
        
        // Calculate total workouts
        userStatistics.totalWorkouts = workoutExecutions.length;
        
        // Calculate total workout time
        userStatistics.totalWorkoutTime = workoutExecutions.reduce(
            (total, execution) => total + (execution.duration || 0), 0
        );
        
        // Calculate total calories burned
        userStatistics.totalCaloriesBurned = workoutExecutions.reduce(
            (total, execution) => total + (execution.caloriesBurned || 0), 0
        );
        
        // Calculate total exercises
        let totalExercises = 0;
        workoutExecutions.forEach(execution => {
            totalExercises += execution.exercises ? execution.exercises.length : 0;
        });
        userStatistics.totalExercises = totalExercises;
        
        // Calculate streaks
        const streakData = calculateStreaks(workoutExecutions);
        userStatistics.currentStreak = streakData.currentStreak;
        userStatistics.longestStreak = streakData.longestStreak;
        
        // Set last workout date
        if (workoutExecutions.length > 0) {
            const lastExecution = workoutExecutions[workoutExecutions.length - 1];
            userStatistics.lastWorkoutDate = lastExecution.date;
        }
        
        // Calculate weekly and monthly workouts
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        userStatistics.weeklyWorkouts = workoutExecutions.filter(
            execution => execution.date >= oneWeekAgo
        ).length;
        
        userStatistics.monthlyWorkouts = workoutExecutions.filter(
            execution => execution.date >= oneMonthAgo
        ).length;
        
        await userStatistics.save();
        
        res.json({
            success: true,
            message: 'Estatísticas calculadas com sucesso',
            userStatistics
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Helper function to calculate streaks
function calculateStreaks(workoutExecutions) {
    if (workoutExecutions.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }
    
    // Sort executions by date
    const sortedExecutions = [...workoutExecutions].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    );
    
    // Group executions by date (to handle multiple workouts on same day)
    const workoutDates = {};
    sortedExecutions.forEach(execution => {
        const dateStr = new Date(execution.date).toISOString().split('T')[0];
        workoutDates[dateStr] = true;
    });
    
    const dates = Object.keys(workoutDates).map(dateStr => new Date(dateStr));
    dates.sort((a, b) => a - b);
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Calculate longest streak
    for (let i = 0; i < dates.length; i++) {
        if (i === 0) {
            tempStreak = 1;
            continue;
        }
        
        const prevDate = new Date(dates[i-1]);
        const currDate = new Date(dates[i]);
        
        prevDate.setDate(prevDate.getDate() + 1);
        
        if (prevDate.toISOString().split('T')[0] === currDate.toISOString().split('T')[0]) {
            // Consecutive days
            tempStreak++;
        } else {
            // Streak broken
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
            }
            tempStreak = 1;
        }
    }
    
    // Check if the last streak is the longest
    if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
    }
    
    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the most recent workout was today or yesterday
    const lastWorkoutDate = new Date(dates[dates.length - 1]);
    lastWorkoutDate.setHours(0, 0, 0, 0);
    
    if (lastWorkoutDate.getTime() === today.getTime() || 
        lastWorkoutDate.getTime() === yesterday.getTime()) {
        
        currentStreak = 1;
        
        // Count backwards from the last workout date
        for (let i = dates.length - 2; i >= 0; i--) {
            const prevDate = new Date(dates[i]);
            const currDate = new Date(dates[i+1]);
            
            prevDate.setHours(0, 0, 0, 0);
            currDate.setHours(0, 0, 0, 0);
            
            prevDate.setDate(prevDate.getDate() + 1);
            
            if (prevDate.getTime() === currDate.getTime()) {
                // Consecutive days
                currentStreak++;
            } else {
                // Streak broken
                break;
            }
        }
    } else {
        // Streak is broken if last workout was not today or yesterday
        currentStreak = 0;
    }
    
    return { currentStreak, longestStreak };
}
