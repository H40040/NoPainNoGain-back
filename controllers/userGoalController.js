// backend/controllers/userGoalController.js
const UserGoal = require('../models/userGoalModel');

// Reusable error handler
const handleServerError = (res, error) => {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
};

// Get all goals for a user
exports.getUserGoals = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Check if the requesting user is authorized to access these goals
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a acessar metas de outro usuário'
            });
        }
        
        const goals = await UserGoal.find({ userId }).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: goals.length,
            goals
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Get goal by ID
exports.getGoalById = async (req, res) => {
    try {
        const { id } = req.params;
        const goal = await UserGoal.findById(id);
        
        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Meta não encontrada'
            });
        }
        
        // Check if the requesting user is authorized to access this goal
        if (goal.userId.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a acessar esta meta'
            });
        }
        
        res.json({
            success: true,
            goal
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Create a new goal
exports.createGoal = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Check if the requesting user is authorized to create goals for this user
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a criar metas para outro usuário'
            });
        }
        
        const {
            title,
            description,
            type,
            targetValue,
            currentValue,
            startDate,
            targetDate,
            status,
            category,
            reminderFrequency
        } = req.body;
        
        const newGoal = new UserGoal({
            userId,
            title,
            description,
            type,
            targetValue,
            currentValue: currentValue || 0,
            startDate: startDate || new Date(),
            targetDate,
            status: status || 'ativa',
            category,
            reminderFrequency
        });
        
        await newGoal.save();
        
        res.status(201).json({
            success: true,
            message: 'Meta criada com sucesso',
            goal: newGoal
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

// Update a goal
exports.updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const goal = await UserGoal.findById(id);
        
        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Meta não encontrada'
            });
        }
        
        // Check if the requesting user is authorized to update this goal
        if (goal.userId.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a atualizar esta meta'
            });
        }
        
        const {
            title,
            description,
            type,
            targetValue,
            currentValue,
            startDate,
            targetDate,
            status,
            category,
            reminderFrequency,
            progressHistory
        } = req.body;
        
        // Update fields
        if (title) goal.title = title;
        if (description) goal.description = description;
        if (type) goal.type = type;
        if (targetValue !== undefined) goal.targetValue = targetValue;
        if (currentValue !== undefined) goal.currentValue = currentValue;
        if (startDate) goal.startDate = startDate;
        if (targetDate) goal.targetDate = targetDate;
        if (status) goal.status = status;
        if (category) goal.category = category;
        if (reminderFrequency) goal.reminderFrequency = reminderFrequency;
        
        // Add to progress history if currentValue changed
        if (currentValue !== undefined && currentValue !== goal.currentValue) {
            goal.progressHistory.push({
                value: currentValue,
                date: new Date()
            });
        }
        
        // Check if goal is completed
        if (goal.type === 'increase' && goal.currentValue >= goal.targetValue) {
            goal.status = 'concluída';
            goal.completedAt = new Date();
        } else if (goal.type === 'decrease' && goal.currentValue <= goal.targetValue) {
            goal.status = 'concluída';
            goal.completedAt = new Date();
        }
        
        await goal.save();
        
        res.json({
            success: true,
            message: 'Meta atualizada com sucesso',
            goal
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

// Delete a goal
exports.deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const goal = await UserGoal.findById(id);
        
        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Meta não encontrada'
            });
        }
        
        // Check if the requesting user is authorized to delete this goal
        if (goal.userId.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a excluir esta meta'
            });
        }
        
        await UserGoal.findByIdAndDelete(id);
        
        res.json({
            success: true,
            message: 'Meta excluída com sucesso'
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Update goal progress
exports.updateGoalProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { value } = req.body;
        
        if (value === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Valor de progresso é obrigatório'
            });
        }
        
        const goal = await UserGoal.findById(id);
        
        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Meta não encontrada'
            });
        }
        
        // Check if the requesting user is authorized to update this goal
        if (goal.userId.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a atualizar esta meta'
            });
        }
        
        // Update current value
        goal.currentValue = value;
        
        // Add to progress history
        goal.progressHistory.push({
            value,
            date: new Date()
        });
        
        // Check if goal is completed
        if (goal.type === 'increase' && goal.currentValue >= goal.targetValue) {
            goal.status = 'concluída';
            goal.completedAt = new Date();
        } else if (goal.type === 'decrease' && goal.currentValue <= goal.targetValue) {
            goal.status = 'concluída';
            goal.completedAt = new Date();
        }
        
        await goal.save();
        
        res.json({
            success: true,
            message: 'Progresso da meta atualizado com sucesso',
            goal
        });
    } catch (error) {
        handleServerError(res, error);
    }
};
