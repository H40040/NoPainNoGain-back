const mongoose = require('mongoose');

const UserActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: [
      'login', 'logout', 'registro', 'perfil_atualizado', 
      'treino_criado', 'treino_atualizado', 'treino_excluido', 
      'treino_executado', 'exercicio_adicionado', 'meta_criada',
      'meta_atualizada', 'meta_concluida', 'assinatura_iniciada',
      'assinatura_renovada', 'assinatura_cancelada', 'anamnese_atualizada',
      'ai_geracao_treino', 'conquista_desbloqueada', 'feedback_enviado',
      'notificacao_lida', 'outro'
    ],
    required: true,
    index: true
  },
  ip: String,
  userAgent: String,
  deviceInfo: {
    type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'outro'],
      default: 'outro'
    },
    os: String,
    browser: String
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel',
    index: true
  },
  targetModel: {
    type: String,
    enum: [
      'User', 'Workout', 'Exercise', 'WorkoutExecution', 
      'UserGoal', 'UserSubscription', 'Anamnese', 
      'WorkoutGenerationHistory', 'UserAchievement', 'UserFeedback',
      null
    ],
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['sucesso', 'falha', 'pendente'],
    default: 'sucesso',
    index: true
  },
  errorMessage: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { 
  timestamps: false // Não precisamos de updatedAt para logs
});

// Criar índices compostos para melhorar a performance
UserActivityLogSchema.index({ userId: 1, action: 1 });
UserActivityLogSchema.index({ userId: 1, createdAt: -1 });
UserActivityLogSchema.index({ action: 1, createdAt: -1 });
UserActivityLogSchema.index({ status: 1, createdAt: -1 });

// Método estático para registrar atividade
UserActivityLogSchema.statics.logActivity = async function(data) {
  try {
    return await this.create(data);
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
    // Não lançamos o erro para evitar que falhas no log afetem o fluxo principal
    return null;
  }
};

const UserActivityLog = mongoose.model('UserActivityLog', UserActivityLogSchema);

module.exports = UserActivityLog;
