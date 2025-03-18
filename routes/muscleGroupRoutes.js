// backend/routes/muscleGroupRoutes.js
const express = require('express');
const router = express.Router();
const muscleGroupController = require('../controllers/muscleGroupController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Obter todos os grupos musculares (acesso público)
router.get('/', muscleGroupController.getAllMuscleGroups);

// Obter grupo muscular por ID (acesso público)
router.get('/:id', muscleGroupController.getMuscleGroupById);

// Rotas administrativas (requerem autenticação e privilégios de admin)
router.post('/', authenticateToken, authorizeRoles('admin'), muscleGroupController.createMuscleGroup);
router.put('/:id', authenticateToken, authorizeRoles('admin'), muscleGroupController.updateMuscleGroup);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), muscleGroupController.deleteMuscleGroup);

module.exports = router;
