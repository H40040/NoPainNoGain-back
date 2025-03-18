// backend/routes/workoutExecutionRoutes.js
const express = require('express');
const router = express.Router();
const workoutExecutionController = require('../controllers/workoutExecutionController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para execuções de treino
router.post('/start', workoutExecutionController.startWorkout);
router.put('/:id/complete', workoutExecutionController.completeWorkout);
router.put('/:id/exercise-result', workoutExecutionController.updateExerciseResults);
router.get('/', workoutExecutionController.getUserWorkoutExecutions);
router.get('/:id', workoutExecutionController.getWorkoutExecutionById);
router.get('/workout/:workoutId', workoutExecutionController.getWorkoutExecutionsByWorkoutId);
router.delete('/:id', workoutExecutionController.deleteWorkoutExecution);

module.exports = router;
