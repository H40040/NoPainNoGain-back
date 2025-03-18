// backend/routes/userGoalRoutes.js
const express = require('express');
const router = express.Router();
const userGoalController = require('../controllers/userGoalController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Obter todas as metas do usuário
router.get('/', userGoalController.getUserGoals);
router.get('/:userId/all', userGoalController.getUserGoals);

// Obter meta específica por ID
router.get('/:id', userGoalController.getGoalById);

// Criar nova meta
router.post('/', userGoalController.createGoal);
router.post('/:userId', userGoalController.createGoal);

// Atualizar meta
router.put('/:id', userGoalController.updateGoal);

// Excluir meta
router.delete('/:id', userGoalController.deleteGoal);

// Atualizar progresso da meta
router.post('/:id/progress', userGoalController.updateGoalProgress);

module.exports = router;
