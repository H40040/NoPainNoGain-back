// backend/routes/anamneseV2Routes.js
const express = require('express');
const router = express.Router();
const anamneseController = require('../controllers/anamneseControllerV2');
const { authenticateToken } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para anamnese
router.get('/', anamneseController.getAnamnese);
router.put('/', anamneseController.updateAnamnese);
router.get('/status', anamneseController.checkAnamneseStatus);

// Rotas para anamnese de um usuário específico (apenas para admin)
router.get('/:userId', anamneseController.getAnamnese);
router.put('/:userId', anamneseController.updateAnamnese);
router.get('/:userId/status', anamneseController.checkAnamneseStatus);

module.exports = router;
