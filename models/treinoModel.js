const mongoose = require("mongoose");

const TreinoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  nome: {
    type: String,
    index: true
  },
  idade: Number,
  peso: Number,
  altura: Number,
  historico: String,
  queixas: String,
  habitos: String,
  medicamentos: String,
  objetivos: {
    type: String,
    index: true
  },
  frequencia: Number,
  duracao: Number,
  nivel: {
    type: String,
    enum: ['iniciante', 'intermediário', 'avançado'],
    default: 'iniciante',
    index: true
  },
  preferencias: String,
  treinoGerado: String,
  isActive: {
    type: Boolean,
    default: true,
    index: true
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
TreinoSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
TreinoSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  this.setUpdate(data);
  next();
});

// Criar índices compostos para melhorar a performance
TreinoSchema.index({ userId: 1, isActive: 1 });
TreinoSchema.index({ nivel: 1, createdAt: -1 });
TreinoSchema.index({ userId: 1, createdAt: -1 });

const Treino = mongoose.model('Treino', TreinoSchema);

module.exports = Treino;
