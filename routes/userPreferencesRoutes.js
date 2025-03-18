// backend/routes/userPreferencesRoutes.js
const express = require('express');
const router = express.Router();
const userPreferencesController = require('../controllers/userPreferencesController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Obter preferências do usuário
router.get('/', userPreferencesController.getUserPreferences);
router.get('/:userId', userPreferencesController.getUserPreferences);

// Atualizar preferências do usuário
router.put('/', userPreferencesController.updateUserPreferences);
router.put('/:userId', userPreferencesController.updateUserPreferences);

// Resetar preferências do usuário para os valores padrão
router.post('/reset', userPreferencesController.resetUserPreferences);
router.post('/:userId/reset', userPreferencesController.resetUserPreferences);

module.exports = router;
