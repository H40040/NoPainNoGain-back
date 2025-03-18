const mongoose = require('mongoose');

const UserGoalSchema = new mongoose.Schema({
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
  description: String,
  type: {
    type: String,
    enum: ['peso', 'força', 'resistência', 'flexibilidade', 'hábito', 'outro', 'decrease', 'increase'],
    default: 'outro',
    index: true
  },
  targetValue: {
    type: Number,
    required: function() {
      return ['peso', 'força'].includes(this.type);
    }
  },
  unit: {
    type: String,
    default: function() {
      switch(this.type) {
        case 'peso': return 'kg';
        case 'força': return 'kg';
        case 'resistência': return 'min';
        case 'flexibilidade': return 'cm';
        default: return '';
      }
    }
  },
  startValue: Number,
  currentValue: Number,
  startDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  targetDate: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['ativa', 'concluída', 'cancelada', 'expirada'],
    default: 'ativa',
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  frequency: {
    type: String,
    enum: ['diária', 'semanal', 'mensal', 'única'],
    default: 'semanal'
  },
  reminderEnabled: {
    type: Boolean,
    default: true
  },
  reminderDays: {
    type: [String],
    default: ['segunda', 'quarta', 'sexta']
  },
  reminderTime: String,
  completedAt: Date,
  progressHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    value: Number,
    notes: String
  }],
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
UserGoalSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  
  // Atualizar completedAt quando a meta for concluída
  if (this.isModified('status') && this.status === 'concluída' && !this.completedAt) {
    this.completedAt = Date.now();
  }
  
  // Calcular progresso automaticamente se os valores necessários estiverem presentes
  if ((this.isModified('currentValue') || this.isModified('targetValue') || this.isModified('startValue')) 
      && this.currentValue !== undefined && this.targetValue !== undefined && this.startValue !== undefined) {
    const totalDifference = this.targetValue - this.startValue;
    if (totalDifference !== 0) {
      const currentDifference = this.currentValue - this.startValue;
      this.progress = Math.min(100, Math.max(0, (currentDifference / totalDifference) * 100));
    }
  }
  
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
UserGoalSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  
  // Atualizar completedAt quando a meta for concluída
  if (data.status === 'concluída' && !data.completedAt) {
    data.completedAt = Date.now();
  }
  
  this.setUpdate(data);
  next();
});

// Criar índices compostos para melhorar a performance
UserGoalSchema.index({ userId: 1, status: 1 });
UserGoalSchema.index({ userId: 1, targetDate: 1 });
UserGoalSchema.index({ userId: 1, type: 1 });
UserGoalSchema.index({ status: 1, targetDate: 1 });

const UserGoal = mongoose.model('UserGoal', UserGoalSchema);

module.exports = UserGoal;
