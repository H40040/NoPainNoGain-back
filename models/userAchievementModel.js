const mongoose = require('mongoose');

const UserAchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  achievementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true,
    index: true
  },
  earned: {
    type: Boolean,
    default: true,
    index: true
  },
  currentValue: {
    type: Number,
    default: 1
  },
  currentLevel: {
    type: Number,
    default: 1
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  earnedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  pointsAwarded: {
    type: Number,
    default: 0
  },
  viewed: {
    type: Boolean,
    default: false,
    index: true
  },
  progressHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    value: Number,
    level: Number
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
UserAchievementSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
UserAchievementSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  this.setUpdate(data);
  next();
});

// Criar índices compostos para melhorar a performance
UserAchievementSchema.index({ userId: 1, earned: 1 });
UserAchievementSchema.index({ userId: 1, viewed: 1 });
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

const UserAchievement = mongoose.model('UserAchievement', UserAchievementSchema);

module.exports = UserAchievement;
