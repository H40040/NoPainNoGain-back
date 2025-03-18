const mongoose = require('mongoose');

const UserFeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['app', 'treino', 'exercício', 'suporte', 'sugestão', 'outro'],
    default: 'app',
    index: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
    index: true
  },
  title: String,
  comment: String,
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel',
    index: true
  },
  targetModel: {
    type: String,
    enum: ['Workout', 'Exercise', 'WorkoutExecution', null],
    default: null
  },
  status: {
    type: String,
    enum: ['novo', 'revisado', 'respondido', 'resolvido', 'arquivado'],
    default: 'novo',
    index: true
  },
  adminResponse: String,
  adminResponseDate: Date,
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  tags: [String],
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
UserFeedbackSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  
  // Atualizar adminResponseDate quando uma resposta for adicionada
  if (this.isModified('adminResponse') && this.adminResponse && !this.adminResponseDate) {
    this.adminResponseDate = Date.now();
    this.status = 'respondido';
  }
  
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
UserFeedbackSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  
  // Atualizar adminResponseDate quando uma resposta for adicionada
  if (data.adminResponse && !data.adminResponseDate) {
    data.adminResponseDate = Date.now();
    data.status = 'respondido';
  }
  
  this.setUpdate(data);
  next();
});

// Criar índices compostos para melhorar a performance
UserFeedbackSchema.index({ userId: 1, type: 1 });
UserFeedbackSchema.index({ rating: 1, createdAt: -1 });
UserFeedbackSchema.index({ status: 1, createdAt: -1 });
UserFeedbackSchema.index({ type: 1, rating: 1 });

const UserFeedback = mongoose.model('UserFeedback', UserFeedbackSchema);

module.exports = UserFeedback;
