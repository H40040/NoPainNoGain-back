const mongoose = require('mongoose');

const UserSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['ativa', 'cancelada', 'expirada', 'pendente', 'trial'],
    default: 'pendente',
    index: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  paymentMethod: {
    type: String,
    enum: ['cartão', 'boleto', 'pix', 'outro'],
    default: 'cartão'
  },
  paymentStatus: {
    type: String,
    enum: ['pago', 'pendente', 'falha', 'reembolsado'],
    default: 'pendente',
    index: true
  },
  transactionId: String,
  lastPaymentDate: Date,
  nextPaymentDate: Date,
  cancellationReason: String,
  cancellationDate: Date,
  remainingAIGenerations: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: String
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
UserSubscriptionSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
UserSubscriptionSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  this.setUpdate(data);
  next();
});

// Criar índices compostos para melhorar a performance
UserSubscriptionSchema.index({ userId: 1, status: 1 });
UserSubscriptionSchema.index({ endDate: 1, status: 1 });
UserSubscriptionSchema.index({ userId: 1, planId: 1 });
UserSubscriptionSchema.index({ paymentStatus: 1, nextPaymentDate: 1 });

const UserSubscription = mongoose.model('UserSubscription', UserSubscriptionSchema);

module.exports = UserSubscription;
