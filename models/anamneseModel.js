const mongoose = require('mongoose');

const AnamneseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  // Informações pessoais
  height: Number, // em cm
  weight: Number, // em kg
  age: Number,
  gender: {
    type: String,
    enum: ['masculino', 'feminino', 'outro', 'prefiro não informar']
  },
  
  // Histórico médico
  medicalHistory: String,
  injuries: {
    type: [String],
    default: []
  },
  surgeries: String,
  medications: {
    type: [String],
    default: []
  },
  
  // Informações sobre atividade física
  fitnessLevel: {
    type: String,
    enum: ['iniciante', 'intermediário', 'avançado'],
    default: 'iniciante'
  },
  activityFrequency: Number, // vezes por semana
  sessionDuration: Number, // duração preferida em minutos
  
  // Objetivos e preferências
  goals: [String],
  preferredExercises: [String],
  avoidedExercises: [String],
  
  // Hábitos e estilo de vida
  sleepHours: Number,
  stressLevel: {
    type: String,
    enum: ['baixo', 'médio', 'alto']
  },
  occupation: String,
  dietaryRestrictions: [String],
  
  // Campos de controle
  isComplete: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar o campo lastUpdated antes de salvar
AnamneseSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = Date.now();
  }
  next();
});

// Middleware para atualizar o campo lastUpdated antes de atualizar
AnamneseSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.lastUpdated = Date.now();
  this.setUpdate(data);
  next();
});

// Criar índices para melhorar a performance
AnamneseSchema.index({ userId: 1 });
AnamneseSchema.index({ isComplete: 1 });

const Anamnese = mongoose.model('Anamnese', AnamneseSchema);

module.exports = Anamnese;
