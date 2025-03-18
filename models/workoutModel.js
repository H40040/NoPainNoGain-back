const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  type: {
    type: String,
    enum: ['força', 'hipertrofia', 'resistência', 'cardio', 'flexibilidade', 'misto'],
    default: 'hipertrofia',
    index: true
  },
  difficulty: {
    type: String,
    enum: ['iniciante', 'intermediário', 'avançado'],
    default: 'intermediário',
    index: true
  },
  duration: {
    type: Number, // em minutos
    default: 60
  },
  frequency: {
    type: Number, // vezes por semana
    default: 3
  },
  isAIGenerated: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  exercises: [{
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: [true, 'O ID do exercício é obrigatório']
    },
    sets: {
      type: Number,
      required: [true, 'O número de séries é obrigatório'],
      min: [1, 'Mínimo de uma série']
    },
    reps: {
      type: String,
      required: [true, 'O número de repetições é obrigatório']
    },
    rest: {
      type: Number,
      default: 60, // descanso padrão 60 segundos
      min: [10, 'Mínimo 10 segundos de descanso']
    },
    notes: String,
    order: {
      type: Number,
      required: [true, 'A ordem do exercício é obrigatória']
    }
  }],  
  
  tags: [{
    type: String,
    default: [],
    index: true
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
WorkoutSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
WorkoutSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  this.setUpdate(data);
  next();
});

// Criar índices compostos para melhorar a performance
WorkoutSchema.index({ userId: 1, isActive: 1 });
WorkoutSchema.index({ userId: 1, type: 1 });
WorkoutSchema.index({ userId: 1, isAIGenerated: 1 });
WorkoutSchema.index({ name: 'text', description: 'text' }); // Índice de texto para pesquisa

const Workout = mongoose.model('Workout', WorkoutSchema);

module.exports = Workout;
