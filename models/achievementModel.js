const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['treino', 'assiduidade', 'progresso', 'social', 'especial'],
    default: 'treino',
    index: true
  },
  type: {
    type: String,
    enum: ['contagem', 'sequência', 'único', 'nível'],
    default: 'contagem',
    index: true
  },
  requirement: {
    type: Number,
    default: 1
  },
  levels: [{
    level: Number,
    requirement: Number,
    reward: {
      type: String,
      enum: ['pontos', 'badge', 'recurso', 'outro'],
      default: 'pontos'
    },
    rewardValue: Number,
    badgeImageUrl: String
  }],
  isHidden: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  badgeImageUrl: String,
  points: {
    type: Number,
    default: 10
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
AchievementSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
AchievementSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  this.setUpdate(data);
  next();
});

// Criar índices compostos para melhorar a performance
AchievementSchema.index({ category: 1, isActive: 1 });
AchievementSchema.index({ type: 1, isActive: 1 });

const Achievement = mongoose.model('Achievement', AchievementSchema);

module.exports = Achievement;
