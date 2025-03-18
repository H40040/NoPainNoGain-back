const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'BRL'
  },
  interval: {
    type: String,
    enum: ['mensal', 'trimestral', 'semestral', 'anual'],
    default: 'mensal',
    index: true
  },
  features: [String],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  maxWorkouts: {
    type: Number,
    default: -1 // -1 significa ilimitado
  },
  maxAIGenerations: {
    type: Number,
    default: 5
  },
  trialDays: {
    type: Number,
    default: 0
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
SubscriptionPlanSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
SubscriptionPlanSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  this.setUpdate(data);
  next();
});

// Criar índices compostos para melhorar a performance
SubscriptionPlanSchema.index({ price: 1, interval: 1 });
SubscriptionPlanSchema.index({ isActive: 1, interval: 1 });

const SubscriptionPlan = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);

module.exports = SubscriptionPlan;
