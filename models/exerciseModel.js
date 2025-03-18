const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  muscleGroup: {
    type: String,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['iniciante', 'intermediário', 'avançado'],
    default: 'intermediário',
    index: true
  },
  category: {
    type: String,
    enum: ['força', 'cardio', 'flexibilidade', 'equilíbrio', 'outro'],
    default: 'força',
    index: true
  },
  equipment: [String],
  sets: Number,
  reps: String,
  rest: Number, // em segundos
  weight: Number,
  notes: String,
  imageUrl: String,
  videoUrl: String,
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar o campo updatedAt antes de salvar
ExerciseSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
ExerciseSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  this.setUpdate(data);
  next();
});

// Criar índices compostos para melhorar a performance
ExerciseSchema.index({ muscleGroup: 1, difficulty: 1 });
ExerciseSchema.index({ category: 1, isActive: 1 });
ExerciseSchema.index({ name: 'text', description: 'text' }); // Índice de texto para pesquisa

const Exercise = mongoose.model('Exercise', ExerciseSchema);

module.exports = Exercise;
