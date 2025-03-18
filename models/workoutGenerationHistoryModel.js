const mongoose = require('mongoose');

const WorkoutGenerationHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workout"
  },
  prompt: String, // O prompt usado para gerar o treino
  generatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  successful: {
    type: Boolean,
    default: true
  },
  errorMessage: String, // Mensagem de erro, se houver
  parameters: {
    // Parâmetros usados para gerar o treino
    type: mongoose.Schema.Types.Mixed
  }
});

// Criar índices para melhorar a performance
WorkoutGenerationHistorySchema.index({ userId: 1, generatedAt: -1 });

const WorkoutGenerationHistory = mongoose.model('WorkoutGenerationHistory', WorkoutGenerationHistorySchema);

module.exports = WorkoutGenerationHistory;
