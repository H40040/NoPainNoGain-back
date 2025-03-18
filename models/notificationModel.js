const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['treino', 'assinatura', 'sistema', 'conquista', 'lembrete', 'outro'],
    default: 'sistema',
    index: true
  },
  priority: {
    type: String,
    enum: ['baixa', 'média', 'alta', 'urgente'],
    default: 'média',
    index: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date,
  actionUrl: String,
  actionText: String,
  expiresAt: {
    type: Date,
    index: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
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
NotificationSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  
  // Atualizar readAt quando a notificação for marcada como lida
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = Date.now();
  }
  
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
NotificationSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  
  // Atualizar readAt quando a notificação for marcada como lida
  if (data.read === true && !data.readAt) {
    data.readAt = Date.now();
  }
  
  this.setUpdate(data);
  next();
});

// Criar índices compostos para melhorar a performance
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, priority: 1, read: 1 });

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
