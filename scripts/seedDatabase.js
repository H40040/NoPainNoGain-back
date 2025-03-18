const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Importar modelos
const Admin = require('../models/adminModel');
const Client = require('../models/clientModel');
const Exercise = require('../models/exerciseModel');
const Workout = require('../models/workoutModel');
const MuscleGroup = require('../models/muscleGroupModel');
const Equipment = require('../models/equipmentModel');
const SubscriptionPlan = require('../models/subscriptionPlanModel');
const Achievement = require('../models/achievementModel');

// Configurar variáveis de ambiente
dotenv.config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conexão com MongoDB estabelecida com sucesso'))
.catch(err => {
  console.error('Erro ao conectar com MongoDB:', err);
  process.exit(1);
});

// Dados iniciais para grupos musculares
const muscleGroupsData = [
  {
    name: 'Peito',
    description: 'Músculos peitorais, incluindo peitoral maior e menor',
    bodyRegion: 'superior',
    recommendedFrequency: 2,
    recoveryTime: 48
  },
  {
    name: 'Costas',
    description: 'Músculos das costas, incluindo latíssimo do dorso, trapézio e romboides',
    bodyRegion: 'superior',
    recommendedFrequency: 2,
    recoveryTime: 48
  },
  {
    name: 'Ombros',
    description: 'Músculos dos ombros, incluindo deltóide anterior, lateral e posterior',
    bodyRegion: 'superior',
    recommendedFrequency: 2,
    recoveryTime: 48
  },
  {
    name: 'Bíceps',
    description: 'Músculos da parte frontal do braço',
    bodyRegion: 'superior',
    recommendedFrequency: 2,
    recoveryTime: 48
  },
  {
    name: 'Tríceps',
    description: 'Músculos da parte posterior do braço',
    bodyRegion: 'superior',
    recommendedFrequency: 2,
    recoveryTime: 48
  },
  {
    name: 'Quadríceps',
    description: 'Músculos da parte frontal da coxa',
    bodyRegion: 'inferior',
    recommendedFrequency: 2,
    recoveryTime: 72
  },
  {
    name: 'Isquiotibiais',
    description: 'Músculos da parte posterior da coxa',
    bodyRegion: 'inferior',
    recommendedFrequency: 2,
    recoveryTime: 72
  },
  {
    name: 'Glúteos',
    description: 'Músculos dos glúteos',
    bodyRegion: 'inferior',
    recommendedFrequency: 2,
    recoveryTime: 48
  },
  {
    name: 'Panturrilhas',
    description: 'Músculos da parte posterior da perna',
    bodyRegion: 'inferior',
    recommendedFrequency: 3,
    recoveryTime: 24
  },
  {
    name: 'Abdômen',
    description: 'Músculos abdominais',
    bodyRegion: 'core',
    recommendedFrequency: 3,
    recoveryTime: 24
  },
  {
    name: 'Lombar',
    description: 'Músculos da região lombar',
    bodyRegion: 'core',
    recommendedFrequency: 2,
    recoveryTime: 48
  }
];

// Dados iniciais para equipamentos
const equipmentsData = [
  {
    name: 'Halteres',
    description: 'Pesos livres para exercícios variados',
    category: 'peso livre',
    muscleGroups: ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Glúteos']
  },
  {
    name: 'Barra',
    description: 'Barra para exercícios com pesos',
    category: 'peso livre',
    muscleGroups: ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Glúteos']
  },
  {
    name: 'Máquina Smith',
    description: 'Máquina com barra guiada',
    category: 'máquina',
    muscleGroups: ['Peito', 'Costas', 'Ombros', 'Quadríceps', 'Glúteos']
  },
  {
    name: 'Leg Press',
    description: 'Máquina para exercícios de pernas',
    category: 'máquina',
    muscleGroups: ['Quadríceps', 'Glúteos', 'Isquiotibiais']
  },
  {
    name: 'Esteira',
    description: 'Equipamento para exercícios cardiovasculares',
    category: 'cardio',
    muscleGroups: ['Quadríceps', 'Isquiotibiais', 'Panturrilhas']
  },
  {
    name: 'Bicicleta Ergométrica',
    description: 'Equipamento para exercícios cardiovasculares',
    category: 'cardio',
    muscleGroups: ['Quadríceps', 'Isquiotibiais', 'Panturrilhas']
  },
  {
    name: 'Elíptico',
    description: 'Equipamento para exercícios cardiovasculares',
    category: 'cardio',
    muscleGroups: ['Quadríceps', 'Isquiotibiais', 'Panturrilhas', 'Glúteos']
  },
  {
    name: 'TRX',
    description: 'Fitas de suspensão para exercícios com o peso corporal',
    category: 'acessório',
    muscleGroups: ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Quadríceps', 'Glúteos']
  },
  {
    name: 'Banco Reto',
    description: 'Banco para exercícios variados',
    category: 'acessório',
    muscleGroups: ['Peito', 'Ombros', 'Tríceps', 'Abdômen']
  },
  {
    name: 'Banco Inclinado',
    description: 'Banco inclinado para exercícios variados',
    category: 'acessório',
    muscleGroups: ['Peito', 'Ombros', 'Tríceps']
  },
  {
    name: 'Banco Declinado',
    description: 'Banco declinado para exercícios variados',
    category: 'acessório',
    muscleGroups: ['Peito', 'Abdômen']
  },
  {
    name: 'Corda',
    description: 'Acessório para exercícios de tríceps',
    category: 'acessório',
    muscleGroups: ['Tríceps']
  },
  {
    name: 'Bola Suíça',
    description: 'Bola para exercícios de estabilidade',
    category: 'acessório',
    muscleGroups: ['Abdômen', 'Lombar', 'Glúteos']
  },
  {
    name: 'Kettlebell',
    description: 'Peso com alça para exercícios funcionais',
    category: 'peso livre',
    muscleGroups: ['Costas', 'Ombros', 'Quadríceps', 'Glúteos', 'Abdômen']
  },
  {
    name: 'Anilhas',
    description: 'Pesos para barras e máquinas',
    category: 'peso livre',
    muscleGroups: ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Glúteos']
  }
];

// Dados iniciais para exercícios
const exercisesData = [
  {
    name: 'Supino Reto',
    description: 'Exercício para peito com barra',
    muscleGroup: 'Peito',
    difficulty: 'intermediário',
    category: 'força',
    equipment: ['Barra', 'Banco Reto', 'Anilhas'],
    sets: 4,
    reps: '8-12',
    rest: 90
  },
  {
    name: 'Agachamento',
    description: 'Exercício para pernas com barra',
    muscleGroup: 'Quadríceps',
    difficulty: 'intermediário',
    category: 'força',
    equipment: ['Barra', 'Anilhas'],
    sets: 4,
    reps: '8-12',
    rest: 120
  },
  {
    name: 'Levantamento Terra',
    description: 'Exercício para costas e pernas com barra',
    muscleGroup: 'Costas',
    difficulty: 'avançado',
    category: 'força',
    equipment: ['Barra', 'Anilhas'],
    sets: 4,
    reps: '6-10',
    rest: 120
  },
  {
    name: 'Rosca Direta',
    description: 'Exercício para bíceps com barra',
    muscleGroup: 'Bíceps',
    difficulty: 'iniciante',
    category: 'força',
    equipment: ['Barra', 'Anilhas'],
    sets: 3,
    reps: '10-15',
    rest: 60
  },
  {
    name: 'Tríceps Corda',
    description: 'Exercício para tríceps com corda',
    muscleGroup: 'Tríceps',
    difficulty: 'iniciante',
    category: 'força',
    equipment: ['Corda'],
    sets: 3,
    reps: '10-15',
    rest: 60
  },
  {
    name: 'Leg Press 45°',
    description: 'Exercício para pernas na máquina',
    muscleGroup: 'Quadríceps',
    difficulty: 'intermediário',
    category: 'força',
    equipment: ['Leg Press'],
    sets: 4,
    reps: '10-12',
    rest: 90
  },
  {
    name: 'Esteira',
    description: 'Exercício cardiovascular',
    muscleGroup: 'Quadríceps',
    difficulty: 'iniciante',
    category: 'cardio',
    equipment: ['Esteira'],
    sets: 1,
    reps: '20-30 min',
    rest: 0
  },
  {
    name: 'Abdominal',
    description: 'Exercício para abdômen',
    muscleGroup: 'Abdômen',
    difficulty: 'iniciante',
    category: 'força',
    equipment: [],
    sets: 3,
    reps: '15-20',
    rest: 60
  },
  {
    name: 'Flexão de Braço',
    description: 'Exercício para peito e tríceps',
    muscleGroup: 'Peito',
    difficulty: 'iniciante',
    category: 'força',
    equipment: [],
    sets: 3,
    reps: '10-15',
    rest: 60
  },
  {
    name: 'Remada Curvada',
    description: 'Exercício para costas com barra',
    muscleGroup: 'Costas',
    difficulty: 'intermediário',
    category: 'força',
    equipment: ['Barra', 'Anilhas'],
    sets: 4,
    reps: '8-12',
    rest: 90
  }
];

// Dados iniciais para planos de assinatura
const subscriptionPlansData = [
  {
    name: 'Plano Básico',
    description: 'Acesso básico ao aplicativo com recursos limitados',
    price: 29.90,
    interval: 'mensal',
    features: [
      'Acesso a treinos pré-definidos',
      'Registro de treinos realizados',
      'Estatísticas básicas'
    ],
    maxWorkouts: 5,
    maxAIGenerations: 1,
    trialDays: 7
  },
  {
    name: 'Plano Premium',
    description: 'Acesso completo a todos os recursos do aplicativo',
    price: 49.90,
    interval: 'mensal',
    features: [
      'Acesso a todos os treinos',
      'Geração ilimitada de treinos com IA',
      'Estatísticas avançadas',
      'Suporte prioritário',
      'Sem anúncios'
    ],
    maxWorkouts: -1,
    maxAIGenerations: -1,
    trialDays: 14
  },
  {
    name: 'Plano Anual',
    description: 'Acesso completo com desconto para pagamento anual',
    price: 399.90,
    interval: 'anual',
    features: [
      'Todos os recursos do Plano Premium',
      'Desconto de 33% em relação ao pagamento mensal',
      'Consulta nutricional gratuita'
    ],
    maxWorkouts: -1,
    maxAIGenerations: -1,
    trialDays: 30
  }
];

// Dados iniciais para conquistas
const achievementsData = [
  {
    name: 'Primeiro Treino',
    description: 'Completou seu primeiro treino',
    category: 'treino',
    type: 'único',
    requirement: 1,
    points: 10,
    badgeImageUrl: '/images/badges/first-workout.png'
  },
  {
    name: 'Mestre dos Treinos',
    description: 'Completou 100 treinos',
    category: 'treino',
    type: 'contagem',
    requirement: 100,
    points: 100,
    levels: [
      { level: 1, requirement: 10, reward: 'pontos', rewardValue: 10 },
      { level: 2, requirement: 25, reward: 'pontos', rewardValue: 25 },
      { level: 3, requirement: 50, reward: 'pontos', rewardValue: 50 },
      { level: 4, requirement: 100, reward: 'pontos', rewardValue: 100 }
    ],
    badgeImageUrl: '/images/badges/workout-master.png'
  },
  {
    name: 'Assiduidade',
    description: 'Treinou 7 dias consecutivos',
    category: 'assiduidade',
    type: 'sequência',
    requirement: 7,
    points: 50,
    levels: [
      { level: 1, requirement: 3, reward: 'pontos', rewardValue: 10 },
      { level: 2, requirement: 7, reward: 'pontos', rewardValue: 50 },
      { level: 3, requirement: 14, reward: 'pontos', rewardValue: 100 },
      { level: 4, requirement: 30, reward: 'pontos', rewardValue: 200 }
    ],
    badgeImageUrl: '/images/badges/streak.png'
  },
  {
    name: 'Explorador',
    description: 'Experimentou 10 exercícios diferentes',
    category: 'progresso',
    type: 'contagem',
    requirement: 10,
    points: 30,
    badgeImageUrl: '/images/badges/explorer.png'
  },
  {
    name: 'Perfil Completo',
    description: 'Completou todas as informações do perfil',
    category: 'social',
    type: 'único',
    requirement: 1,
    points: 20,
    badgeImageUrl: '/images/badges/profile.png'
  }
];

// Função para limpar e popular o banco de dados
const seedDatabase = async () => {
  try {
    // Limpar coleções existentes
    await Promise.all([
      MuscleGroup.deleteMany({}),
      Equipment.deleteMany({}),
      Exercise.deleteMany({}),
      SubscriptionPlan.deleteMany({}),
      Achievement.deleteMany({})
    ]);
    
    console.log('Coleções limpas com sucesso');

    // Popular coleções com dados iniciais
    await MuscleGroup.insertMany(muscleGroupsData);
    console.log('Grupos musculares inseridos com sucesso');
    
    await Equipment.insertMany(equipmentsData);
    console.log('Equipamentos inseridos com sucesso');
    
    await Exercise.insertMany(exercisesData);
    console.log('Exercícios inseridos com sucesso');
    
    await SubscriptionPlan.insertMany(subscriptionPlansData);
    console.log('Planos de assinatura inseridos com sucesso');
    
    await Achievement.insertMany(achievementsData);
    console.log('Conquistas inseridas com sucesso');

    // Verificar se já existe um admin, se não, criar um
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        username: 'admin',
        password: hashedPassword
      });
      console.log('Administrador padrão criado com sucesso');
    }

    console.log('Banco de dados populado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
    process.exit(1);
  }
};

// Executar a função de seed
seedDatabase();
