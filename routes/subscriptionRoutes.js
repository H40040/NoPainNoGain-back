// backend/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// ===== ROTAS PARA PLANOS DE ASSINATURA (ACESSO PÚBLICO) =====

// Obter todos os planos de assinatura (acesso público)
router.get('/plans', subscriptionController.getAllPlans);

// Obter plano de assinatura por ID (acesso público)
router.get('/plans/:id', subscriptionController.getPlanById);

// Rotas administrativas para gerenciar planos
router.post('/plans', authenticateToken, authorizeRoles('admin'), subscriptionController.createPlan);
router.put('/plans/:id', authenticateToken, authorizeRoles('admin'), subscriptionController.updatePlan);
router.delete('/plans/:id', authenticateToken, authorizeRoles('admin'), subscriptionController.deletePlan);

// ===== ROTAS PARA ASSINATURAS DE USUÁRIOS (REQUEREM AUTENTICAÇÃO) =====

// Aplicar middleware de autenticação para todas as rotas abaixo
router.use(authenticateToken);

// Obter assinatura ativa do usuário
router.get('/', subscriptionController.getUserSubscription);
router.get('/:userId', subscriptionController.getUserSubscription);

// Obter histórico de assinaturas do usuário
router.get('/history', subscriptionController.getUserSubscriptionHistory);
router.get('/:userId/history', subscriptionController.getUserSubscriptionHistory);

// Criar nova assinatura
router.post('/', subscriptionController.createSubscription);
router.post('/:userId', subscriptionController.createSubscription);

// Cancelar assinatura
router.post('/cancel', subscriptionController.cancelSubscription);
router.post('/:userId/cancel', subscriptionController.cancelSubscription);

// Renovar assinatura
router.post('/renew', subscriptionController.renewSubscription);
router.post('/:userId/renew', subscriptionController.renewSubscription);

// Verificar status da assinatura
router.get('/status', subscriptionController.checkSubscriptionStatus);
router.get('/:userId/status', subscriptionController.checkSubscriptionStatus);

module.exports = router;
