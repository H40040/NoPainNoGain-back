const mongoose = require('mongoose');

const UserStatisticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  totalWorkouts: { 
    type: Number, 
    default: 0 
  },
  totalMinutes: { 
    type: Number, 
    default: 0 
  },
  streakDays: { 
    type: Number, 
    default: 0 
  },
  lastWorkoutDate: Date,
  workoutsPerWeek: {
    type: Number,
    default: 0
  },
  averageWorkoutDuration: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  weightHistory: [{
    value: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  bodyFatHistory: [{
    value: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
});

// Middleware para atualizar o campo updatedAt antes de salvar
UserStatisticsSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
UserStatisticsSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  this.setUpdate(data);
  next();
});

// Criar índice para melhorar a performance
UserStatisticsSchema.index({ userId: 1 });
UserStatisticsSchema.index({ lastWorkoutDate: -1 });

const UserStatistics = mongoose.model('UserStatistics', UserStatisticsSchema);

module.exports = UserStatistics;
