// backend/controllers/userPreferencesController.js
const UserPreferences = require('../models/userPreferencesModel');

// Reusable error handler
const handleServerError = (res, error) => {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
};

// Get user preferences
exports.getUserPreferences = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Check if the requesting user is authorized to access these preferences
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a acessar preferências de outro usuário'
            });
        }
        
        const userPreferences = await UserPreferences.findOne({ userId });
        
        if (!userPreferences) {
            return res.status(404).json({
                success: false,
                error: 'Preferências do usuário não encontradas'
            });
        }
        
        res.json({
            success: true,
            userPreferences
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Create or update user preferences
exports.updateUserPreferences = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Check if the requesting user is authorized to update these preferences
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a atualizar preferências de outro usuário'
            });
        }
        
        const {
            workoutDays,
            workoutTime,
            workoutDuration,
            workoutLocation,
            preferredExercises,
            excludedExercises,
            fitnessGoals,
            notificationPreferences
        } = req.body;
        
        // Find existing preferences or create new ones
        let userPreferences = await UserPreferences.findOne({ userId });
        
        if (userPreferences) {
            // Update existing preferences
            if (workoutDays) userPreferences.workoutDays = workoutDays;
            if (workoutTime) userPreferences.workoutTime = workoutTime;
            if (workoutDuration) userPreferences.workoutDuration = workoutDuration;
            if (workoutLocation) userPreferences.workoutLocation = workoutLocation;
            if (preferredExercises) userPreferences.preferredExercises = preferredExercises;
            if (excludedExercises) userPreferences.excludedExercises = excludedExercises;
            if (fitnessGoals) userPreferences.fitnessGoals = fitnessGoals;
            
            if (notificationPreferences) {
                userPreferences.notificationPreferences = {
                    ...userPreferences.notificationPreferences,
                    ...notificationPreferences
                };
            }
            
            await userPreferences.save();
            
            res.json({
                success: true,
                message: 'Preferências atualizadas com sucesso',
                userPreferences
            });
        } else {
            // Create new preferences
            userPreferences = new UserPreferences({
                userId,
                workoutDays: workoutDays || ['segunda', 'quarta', 'sexta'],
                workoutTime: workoutTime || '18:00',
                workoutDuration: workoutDuration || 60,
                workoutLocation: workoutLocation || 'academia',
                preferredExercises: preferredExercises || [],
                excludedExercises: excludedExercises || [],
                fitnessGoals: fitnessGoals || ['hipertrofia'],
                notificationPreferences: notificationPreferences || {
                    workoutReminders: true,
                    progressUpdates: true,
                    achievementAlerts: true
                }
            });
            
            await userPreferences.save();
            
            res.status(201).json({
                success: true,
                message: 'Preferências criadas com sucesso',
                userPreferences
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

// Reset user preferences to default
exports.resetUserPreferences = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Check if the requesting user is authorized to reset these preferences
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a resetar preferências de outro usuário'
            });
        }
        
        // Find and delete existing preferences
        await UserPreferences.findOneAndDelete({ userId });
        
        // Create new preferences with default values
        const defaultPreferences = new UserPreferences({
            userId,
            workoutDays: ['segunda', 'quarta', 'sexta'],
            workoutTime: '18:00',
            workoutDuration: 60,
            workoutLocation: 'academia',
            preferredExercises: [],
            excludedExercises: [],
            fitnessGoals: ['hipertrofia'],
            notificationPreferences: {
                workoutReminders: true,
                progressUpdates: true,
                achievementAlerts: true
            }
        });
        
        await defaultPreferences.save();
        
        res.json({
            success: true,
            message: 'Preferências resetadas para os valores padrão',
            userPreferences: defaultPreferences
        });
    } catch (error) {
        handleServerError(res, error);
    }
};
