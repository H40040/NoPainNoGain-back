// backend/controllers/equipmentController.js
const Equipment = require('../models/equipmentModel');

// Reusable error handler
const handleServerError = (res, error) => {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
};

// Get all equipment
exports.getAllEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.find({ isActive: true }).sort({ name: 1 });
        
        res.json({
            success: true,
            count: equipment.length,
            equipment
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Get equipment by ID
exports.getEquipmentById = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        
        if (!equipment) {
            return res.status(404).json({
                success: false,
                error: 'Equipamento não encontrado'
            });
        }
        
        res.json({
            success: true,
            equipment
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Create new equipment (admin only)
exports.createEquipment = async (req, res) => {
    try {
        const { name, description, category, imageUrl } = req.body;
        
        const newEquipment = new Equipment({
            name,
            description,
            category,
            imageUrl
        });
        
        await newEquipment.save();
        
        res.status(201).json({
            success: true,
            message: 'Equipamento criado com sucesso',
            equipment: newEquipment
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

// Update equipment (admin only)
exports.updateEquipment = async (req, res) => {
    try {
        const { name, description, category, imageUrl, isActive } = req.body;
        
        const equipment = await Equipment.findById(req.params.id);
        
        if (!equipment) {
            return res.status(404).json({
                success: false,
                error: 'Equipamento não encontrado'
            });
        }
        
        // Update fields
        if (name) equipment.name = name;
        if (description) equipment.description = description;
        if (category) equipment.category = category;
        if (imageUrl) equipment.imageUrl = imageUrl;
        if (isActive !== undefined) equipment.isActive = isActive;
        
        await equipment.save();
        
        res.json({
            success: true,
            message: 'Equipamento atualizado com sucesso',
            equipment
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

// Delete equipment (admin only)
exports.deleteEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        
        if (!equipment) {
            return res.status(404).json({
                success: false,
                error: 'Equipamento não encontrado'
            });
        }
        
        // Soft delete - just mark as inactive
        equipment.isActive = false;
        await equipment.save();
        
        res.json({
            success: true,
            message: 'Equipamento desativado com sucesso'
        });
    } catch (error) {
        handleServerError(res, error);
    }
};
