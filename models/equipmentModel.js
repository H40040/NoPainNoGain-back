const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: String,
  category: {
    type: String,
    enum: ['máquina', 'peso livre', 'acessório', 'cardio', 'outro'],
    default: 'outro',
    index: true
  },
  imageUrl: String,
  muscleGroups: [{
    type: String,
    index: true
  }],
  difficulty: {
    type: String,
    enum: ['iniciante', 'intermediário', 'avançado'],
    default: 'intermediário',
    index: true
  },
  alternatives: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
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
EquipmentSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
EquipmentSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  this.setUpdate(data);
  next();
});

// Criar índices compostos para melhorar a performance
EquipmentSchema.index({ category: 1, isActive: 1 });
EquipmentSchema.index({ name: 'text', description: 'text' }); // Índice de texto para pesquisa

const Equipment = mongoose.model('Equipment', EquipmentSchema);

module.exports = Equipment;
