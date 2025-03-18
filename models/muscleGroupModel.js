const mongoose = require('mongoose');

const MuscleGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: String,
  bodyRegion: {
    type: String,
    enum: ['superior', 'inferior', 'core', 'total'],
    default: 'superior',
    index: true
  },
  imageUrl: String,
  anatomyImageUrl: String,
  relatedMuscles: [{
    type: String
  }],
  recommendedFrequency: {
    type: Number,
    default: 2, // vezes por semana
    min: 1,
    max: 7
  },
  recoveryTime: {
    type: Number,
    default: 48, // horas
    min: 24,
    max: 96
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
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
MuscleGroupSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
MuscleGroupSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  this.setUpdate(data);
  next();
});

// Criar índices compostos para melhorar a performance
MuscleGroupSchema.index({ bodyRegion: 1, isActive: 1 });
MuscleGroupSchema.index({ name: 'text', description: 'text' }); // Índice de texto para pesquisa

const MuscleGroup = mongoose.model('MuscleGroup', MuscleGroupSchema);

module.exports = MuscleGroup;
