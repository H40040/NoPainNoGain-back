// backend/controllers/exerciseController.js
const Exercise = require('../models/exerciseModel');

// Reusable error handler
const handleServerError = (res, error) => {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
};

// Create a new exercise
exports.createExercise = async (req, res) => {
    try {
        const exerciseData = req.body;
        const newExercise = new Exercise(exerciseData);
        await newExercise.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'Exercício criado com sucesso', 
            exercise: newExercise 
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

// Get all exercises
exports.getAllExercises = async (req, res) => {
    try {
        const exercises = await Exercise.find();
        res.json({ success: true, exercises });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Get exercise by ID
exports.getExerciseById = async (req, res) => {
    try {
        const exerciseId = req.params.id;
        const exercise = await Exercise.findById(exerciseId);
        
        if (!exercise) {
            return res.status(404).json({ 
                success: false, 
                error: 'Exercício não encontrado' 
            });
        }
        
        res.json({ success: true, exercise });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Update exercise by ID
exports.updateExercise = async (req, res) => {
    try {
        const exerciseId = req.params.id;
        const updateData = req.body;
        
        const exercise = await Exercise.findByIdAndUpdate(
            exerciseId,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!exercise) {
            return res.status(404).json({ 
                success: false, 
                error: 'Exercício não encontrado' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Exercício atualizado com sucesso', 
            exercise 
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

// Delete exercise by ID
exports.deleteExercise = async (req, res) => {
    try {
        const exerciseId = req.params.id;
        const exercise = await Exercise.findByIdAndDelete(exerciseId);
        
        if (!exercise) {
            return res.status(404).json({ 
                success: false, 
                error: 'Exercício não encontrado' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Exercício excluído com sucesso' 
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Get exercises by muscle group
exports.getExercisesByMuscleGroup = async (req, res) => {
    try {
        const { muscleGroup } = req.params;
        const exercises = await Exercise.find({ muscleGroup });
        
        res.json({ success: true, exercises });
    } catch (error) {
        handleServerError(res, error);
    }
};
