// backend/controllers/anamneseControllerV2.js
const AnamneseV2 = require('../models/anamneseModelV2');

// Reusable error handler
const handleServerError = (res, error) => {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
};

// Get anamnese for a user
exports.getAnamnese = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Check if the requesting user is authorized to access this anamnese
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a acessar anamnese de outro usuário'
            });
        }
        
        const anamnese = await AnamneseV2.findOne({ userId });
        
        if (!anamnese) {
            return res.status(404).json({
                success: false,
                error: 'Anamnese não encontrada',
                isComplete: false
            });
        }
        
        res.json({
            success: true,
            anamnese,
            isComplete: anamnese.isComplete
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Create or update anamnese
exports.updateAnamnese = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Check if the requesting user is authorized to update this anamnese
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a atualizar anamnese de outro usuário'
            });
        }
        
        const {
            height,
            weight,
            age,
            gender,
            medicalHistory,
            injuries,
            surgeries,
            medications,
            fitnessLevel,
            activityFrequency,
            sessionDuration,
            goals,
            preferredExercises,
            avoidedExercises,
            sleepHours,
            stressLevel,
            occupation,
            dietaryRestrictions,
            isComplete
        } = req.body;
        
        // Find existing anamnese or create new one
        let anamnese = await AnamneseV2.findOne({ userId });
        
        if (anamnese) {
            // Update existing anamnese
            if (height !== undefined) anamnese.height = height;
            if (weight !== undefined) anamnese.weight = weight;
            if (age !== undefined) anamnese.age = age;
            if (gender) anamnese.gender = gender;
            if (medicalHistory) anamnese.medicalHistory = medicalHistory;
            if (injuries) anamnese.injuries = Array.isArray(injuries) ? injuries : [injuries];
            if (surgeries) anamnese.surgeries = surgeries;
            if (medications) anamnese.medications = Array.isArray(medications) ? medications : [medications];
            if (fitnessLevel) anamnese.fitnessLevel = fitnessLevel;
            if (activityFrequency !== undefined) anamnese.activityFrequency = activityFrequency;
            if (sessionDuration !== undefined) anamnese.sessionDuration = sessionDuration;
            if (goals) anamnese.goals = Array.isArray(goals) ? goals : [goals];
            if (preferredExercises) anamnese.preferredExercises = Array.isArray(preferredExercises) ? preferredExercises : [preferredExercises];
            if (avoidedExercises) anamnese.avoidedExercises = Array.isArray(avoidedExercises) ? avoidedExercises : [avoidedExercises];
            if (sleepHours !== undefined) anamnese.sleepHours = sleepHours;
            if (stressLevel) anamnese.stressLevel = stressLevel;
            if (occupation) anamnese.occupation = occupation;
            if (dietaryRestrictions) anamnese.dietaryRestrictions = Array.isArray(dietaryRestrictions) ? dietaryRestrictions : [dietaryRestrictions];
            if (isComplete !== undefined) anamnese.isComplete = isComplete;
            
            await anamnese.save();
            
            res.json({
                success: true,
                message: 'Anamnese atualizada com sucesso',
                anamnese
            });
        } else {
            // Create new anamnese
            anamnese = new AnamneseV2({
                userId,
                height,
                weight,
                age,
                gender,
                medicalHistory,
                injuries: Array.isArray(injuries) ? injuries : (injuries ? [injuries] : []),
                surgeries,
                medications: Array.isArray(medications) ? medications : (medications ? [medications] : []),
                fitnessLevel: fitnessLevel || 'iniciante',
                activityFrequency,
                sessionDuration,
                goals: Array.isArray(goals) ? goals : (goals ? [goals] : []),
                preferredExercises: Array.isArray(preferredExercises) ? preferredExercises : (preferredExercises ? [preferredExercises] : []),
                avoidedExercises: Array.isArray(avoidedExercises) ? avoidedExercises : (avoidedExercises ? [avoidedExercises] : []),
                sleepHours,
                stressLevel,
                occupation,
                dietaryRestrictions: Array.isArray(dietaryRestrictions) ? dietaryRestrictions : (dietaryRestrictions ? [dietaryRestrictions] : []),
                isComplete: isComplete !== undefined ? isComplete : false
            });
            
            await anamnese.save();
            
            res.status(201).json({
                success: true,
                message: 'Anamnese criada com sucesso',
                anamnese
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

// Check if anamnese is complete
exports.checkAnamneseStatus = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        const anamnese = await AnamneseV2.findOne({ userId });
        
        if (!anamnese) {
            return res.json({
                success: true,
                isComplete: false,
                message: 'Anamnese não encontrada'
            });
        }
        
        res.json({
            success: true,
            isComplete: anamnese.isComplete,
            message: anamnese.isComplete ? 'Anamnese completa' : 'Anamnese incompleta'
        });
    } catch (error) {
        handleServerError(res, error);
    }
};
