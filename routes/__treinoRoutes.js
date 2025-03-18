// backend/routes/treinoRoutes.js
const express = require("express");
const router = express.Router();
const treinoController = require("../controllers/treinoController");
const { authenticateToken } = require('../middleware/authMiddleware');

// Apply authenticateToken to all routes
router.post("/gerar", authenticateToken, treinoController.gerarTreino);
router.get("/list", authenticateToken, treinoController.listTreinos);

module.exports = router;
