const mongoose = require('mongoose');

const WorkoutExecutionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workout",
    required: true,
    index: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  startTime: Date,
  endTime: Date,
  duration: Number, // em minutos
  caloriesBurned: Number,
  completed: {
    type: Boolean,
    default: true,
    index: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
  difficultyRating: {
    type: String,
    enum: ['fácil', 'moderado', 'difícil', 'muito difícil'],
  },
  mood: {
    type: String,
    enum: ['excelente', 'bom', 'neutro', 'cansado', 'exausto']
  },
  location: {
    type: String,
    enum: ['academia', 'casa', 'ar livre', 'outro']
  },
  exerciseResults: [{
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise"
    },
    sets: [{
      weight: Number,
      reps: Number,
      completed: Boolean,
      difficulty: {
        type: Number,
        min: 1,
        max: 5
      }
    }],
    notes: String,
    skipped: {
      type: Boolean,
      default: false
    },
    timeSpent: Number // em segundos
  }],
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
WorkoutExecutionSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
WorkoutExecutionSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  this.setUpdate(data);
  next();
});

// Criar índices compostos para melhorar a performance
WorkoutExecutionSchema.index({ userId: 1, date: -1 });
WorkoutExecutionSchema.index({ workoutId: 1, date: -1 });
WorkoutExecutionSchema.index({ userId: 1, completed: 1 });
WorkoutExecutionSchema.index({ date: -1 }); // Para consultas de data em geral

const WorkoutExecution = mongoose.model('WorkoutExecution', WorkoutExecutionSchema);

module.exports = WorkoutExecution;
