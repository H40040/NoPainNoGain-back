// backend/routes/userStatisticsRoutes.js
const express = require('express');
const router = express.Router();
const userStatisticsController = require('../controllers/userStatisticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Obter estatísticas do usuário
router.get('/', userStatisticsController.getUserStatistics);
router.get('/:userId', userStatisticsController.getUserStatistics);

// Atualizar estatísticas do usuário
router.put('/', userStatisticsController.updateUserStatistics);
router.put('/:userId', userStatisticsController.updateUserStatistics);

// Adicionar entrada de peso
router.post('/weight', userStatisticsController.addWeightEntry);
router.post('/:userId/weight', userStatisticsController.addWeightEntry);

module.exports = router;
