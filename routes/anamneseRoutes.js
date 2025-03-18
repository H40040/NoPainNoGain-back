// backend/routes/anamneseRoutes.js
const express = require('express');
const router = express.Router();
const anamneseController = require('../controllers/anamneseController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Obter anamnese do usuário
router.get('/', anamneseController.getAnamnese);
router.get('/:userId', anamneseController.getAnamnese);

// Criar ou atualizar anamnese
router.put('/', anamneseController.updateAnamnese);
router.put('/:userId', anamneseController.updateAnamnese);

// Verificar status da anamnese (completa ou não)
router.get('/status', anamneseController.checkAnamneseStatus);
router.get('/:userId/status', anamneseController.checkAnamneseStatus);

module.exports = router;
