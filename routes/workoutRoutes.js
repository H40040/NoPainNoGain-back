// backend/routes/workoutRoutes.js
const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para treinos
router.post('/', workoutController.createWorkout);
router.get('/', workoutController.getUserWorkouts);
router.get('/:id', workoutController.getWorkoutById);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);

// Rotas para gerenciamento de exercícios em treinos
router.post('/:workoutId/exercises/:exerciseId', workoutController.addExerciseToWorkout);
router.delete('/:workoutId/exercises/:exerciseId', workoutController.removeExerciseFromWorkout);

// Rota para clonar um treino
router.post('/:id/clone', workoutController.cloneWorkout);

// Rota para gerar treino com IA
router.post('/generate-ai', workoutController.generateAIWorkout);

module.exports = router;
