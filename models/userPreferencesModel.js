const mongoose = require('mongoose');

const UserPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  workoutDays: [String], // dias da semana preferidos
  workoutDuration: Number, // duração preferida em minutos
  preferredExercises: [String],
  avoidedExercises: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar o campo updatedAt antes de salvar
UserPreferencesSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
UserPreferencesSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  this.setUpdate(data);
  next();
});

// Criar índice composto para melhorar a performance
UserPreferencesSchema.index({ userId: 1 });

const UserPreferences = mongoose.model('UserPreferences', UserPreferencesSchema);

module.exports = UserPreferences;
