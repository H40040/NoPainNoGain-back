// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// Rota pública para registro de usuários
router.post('/register', userController.register);

//router.use(authMiddleware);

// Rotas protegidas que requerem autenticação
router.use(authenticateToken);

router.get('/:id', userController.getUserById);
router.get('/profile', userController.getUserById);
router.put('/update', userController.updateProfile);
router.put('/update-password', userController.changePassword);
router.put('/statistics', userController.updateStatistics);

// Rota para listar todos os usuários (apenas admin)
router.get('/', authorizeRoles('admin'), userController.getAllUsers);

module.exports = router;
