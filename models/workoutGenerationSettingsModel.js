const mongoose = require('mongoose');

const WorkoutGenerationSettingsSchema = new mongoose.Schema({
  blockPeriodDays: {
    type: Number,
    default: 7, // Padrão: 7 dias entre gerações de treino
    min: 1,
    max: 30
  },
  enableGeneration: {
    type: Boolean,
    default: true // Habilitado por padrão
  },
  maxGenerationsPerUser: {
    type: Number,
    default: 3, // Máximo de 3 gerações por período
    min: 1,
    max: 10
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  }
});

// Middleware para atualizar o campo updatedAt antes de salvar
WorkoutGenerationSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
WorkoutGenerationSettingsSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  this.setUpdate(data);
  next();
});

const WorkoutGenerationSettings = mongoose.model('WorkoutGenerationSettings', WorkoutGenerationSettingsSchema);

module.exports = WorkoutGenerationSettings;
