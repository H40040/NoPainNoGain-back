// backend/routes/equipmentRoutes.js
const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Obter todos os equipamentos (acesso público)
router.get('/', equipmentController.getAllEquipment);

// Obter equipamento por ID (acesso público)
router.get('/:id', equipmentController.getEquipmentById);

// Rotas administrativas (requerem autenticação e privilégios de admin)
router.post('/', authenticateToken, authorizeRoles('admin'), equipmentController.createEquipment);
router.put('/:id', authenticateToken, authorizeRoles('admin'), equipmentController.updateEquipment);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), equipmentController.deleteEquipment);

module.exports = router;
