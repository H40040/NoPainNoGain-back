// backend/routes/index.js
const express = require('express');
const router = express.Router();

// Importar todas as rotas
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const workoutRoutes = require('./workoutRoutes');
const muscleGroupRoutes = require('./muscleGroupRoutes');
const equipmentRoutes = require('./equipmentRoutes');
const anamneseRoutes = require('./anamneseRoutes');
const anamneseV2Routes = require('./anamneseV2Routes');
const userStatisticsRoutes = require('./userStatisticsRoutes');
const userGoalRoutes = require('./userGoalRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');

// Aplicar rotas claramente
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/workouts', workoutRoutes);
router.use('/anamnese', anamneseRoutes);
router.use('/anamnese-v2', anamneseV2Routes);
router.use('/user-statistics', userStatisticsRoutes);
router.use('/user-goals', userGoalRoutes);
router.use('/subscriptions', subscriptionRoutes);

// Rota adicional explícita para geração de treino
router.post('/workouts/generate', workoutRoutes);

// Rota básica de validação do backend
router.get('/', (req, res) => {
    res.json({ success: true, message: "API funcionando corretamente!" });
});

module.exports = router;
