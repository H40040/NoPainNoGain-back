const mongoose = require('mongoose');

const MedicalInfoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  conditions: [String], // condições médicas
  medications: [String], // medicamentos em uso
  allergies: [String], // alergias
  injuries: [String], // lesões
  surgeries: [String], // cirurgias
  notes: String, // observações adicionais
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
MedicalInfoSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Middleware para atualizar o campo updatedAt antes de atualizar
MedicalInfoSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const data = this.getUpdate();
  data.updatedAt = Date.now();
  this.setUpdate(data);
  next();
});

// Criar índice para melhorar a performance
MedicalInfoSchema.index({ userId: 1 });

const MedicalInfo = mongoose.model('MedicalInfo', MedicalInfoSchema);

module.exports = MedicalInfo;
