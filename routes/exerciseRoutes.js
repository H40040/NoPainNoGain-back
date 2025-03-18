// backend/routes/exerciseRoutes.js
const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para exercícios
router.post('/', exerciseController.createExercise);
router.get('/', exerciseController.getAllExercises);
router.get('/:id', exerciseController.getExerciseById);
router.put('/:id', exerciseController.updateExercise);
router.delete('/:id', exerciseController.deleteExercise);
router.get('/muscle-group/:muscleGroup', exerciseController.getExercisesByMuscleGroup);

module.exports = router;
