// backend/controllers/muscleGroupController.js
const MuscleGroup = require('../models/muscleGroupModel');

// Reusable error handler
const handleServerError = (res, error) => {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
};

// Get all muscle groups
exports.getAllMuscleGroups = async (req, res) => {
    try {
        const muscleGroups = await MuscleGroup.find({ isActive: true }).sort({ name: 1 });
        
        res.json({
            success: true,
            count: muscleGroups.length,
            muscleGroups
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Get muscle group by ID
exports.getMuscleGroupById = async (req, res) => {
    try {
        const muscleGroup = await MuscleGroup.findById(req.params.id);
        
        if (!muscleGroup) {
            return res.status(404).json({
                success: false,
                error: 'Grupo muscular não encontrado'
            });
        }
        
        res.json({
            success: true,
            muscleGroup
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Create new muscle group (admin only)
exports.createMuscleGroup = async (req, res) => {
    try {
        const { name, description, bodyPart } = req.body;
        
        const newMuscleGroup = new MuscleGroup({
            name,
            description,
            bodyPart
        });
        
        await newMuscleGroup.save();
        
        res.status(201).json({
            success: true,
            message: 'Grupo muscular criado com sucesso',
            muscleGroup: newMuscleGroup
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

// Update muscle group (admin only)
exports.updateMuscleGroup = async (req, res) => {
    try {
        const { name, description, bodyPart, isActive } = req.body;
        
        const muscleGroup = await MuscleGroup.findById(req.params.id);
        
        if (!muscleGroup) {
            return res.status(404).json({
                success: false,
                error: 'Grupo muscular não encontrado'
            });
        }
        
        // Update fields
        if (name) muscleGroup.name = name;
        if (description) muscleGroup.description = description;
        if (bodyPart) muscleGroup.bodyPart = bodyPart;
        if (isActive !== undefined) muscleGroup.isActive = isActive;
        
        await muscleGroup.save();
        
        res.json({
            success: true,
            message: 'Grupo muscular atualizado com sucesso',
            muscleGroup
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

// Delete muscle group (admin only)
exports.deleteMuscleGroup = async (req, res) => {
    try {
        const muscleGroup = await MuscleGroup.findById(req.params.id);
        
        if (!muscleGroup) {
            return res.status(404).json({
                success: false,
                error: 'Grupo muscular não encontrado'
            });
        }
        
        // Soft delete - just mark as inactive
        muscleGroup.isActive = false;
        await muscleGroup.save();
        
        res.json({
            success: true,
            message: 'Grupo muscular desativado com sucesso'
        });
    } catch (error) {
        handleServerError(res, error);
    }
};
