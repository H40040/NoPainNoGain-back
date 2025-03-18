// Script para verificar a migração de clients para users
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Client = require('../models/clientModel');
const Workout = require('../models/workoutModel');
const WorkoutExecution = require('../models/workoutExecutionModel');
require('dotenv').config();

// Função para conectar ao MongoDB
const connectDB = async () => {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conectado ao MongoDB com sucesso');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

// Função para verificar a migração
async function verifyMigration() {
  try {
    console.log('\n=== VERIFICAÇÃO DE MIGRAÇÃO ===\n');
    
    // 1. Verificar clientes e usuários
    const clientCount = await Client.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log(`Clientes encontrados: ${clientCount}`);
    console.log(`Usuários encontrados: ${userCount}`);
    
    if (clientCount > 0) {
      console.log('\nALERTA: Ainda existem clientes na collection "clients".');
      console.log('Recomendação: Execute o script de migração novamente se necessário.');
      
      // Listar emails dos clientes para verificação
      const clients = await Client.find().select('email');
      console.log('\nEmails dos clientes:');
      clients.forEach(client => console.log(`- ${client.email}`));
    } else {
      console.log('\nSUCESSO: Não há mais clientes na collection "clients".');
    }
    
    // 2. Verificar referências em workouts
    const workoutsWithClientRef = await Workout.find().where('userId').exists(true);
    let incorrectRefs = 0;
    
    console.log('\n=== VERIFICAÇÃO DE REFERÊNCIAS EM WORKOUTS ===\n');
    console.log(`Total de workouts: ${workoutsWithClientRef.length}`);
    
    for (const workout of workoutsWithClientRef) {
      // Verificar se o userId existe na collection users
      const userExists = await User.findById(workout.userId);
      if (!userExists) {
        incorrectRefs++;
        console.log(`ERRO: Workout ${workout._id} referencia um usuário inexistente (${workout.userId})`);
      }
    }
    
    if (incorrectRefs === 0) {
      console.log('SUCESSO: Todas as referências de workouts estão corretas.');
    } else {
      console.log(`ALERTA: Encontradas ${incorrectRefs} referências incorretas em workouts.`);
    }
    
    // 3. Verificar referências em execuções de workout
    const executionsWithClientRef = await WorkoutExecution.find().where('userId').exists(true);
    incorrectRefs = 0;
    
    console.log('\n=== VERIFICAÇÃO DE REFERÊNCIAS EM EXECUÇÕES DE WORKOUT ===\n');
    console.log(`Total de execuções: ${executionsWithClientRef.length}`);
    
    for (const execution of executionsWithClientRef) {
      // Verificar se o userId existe na collection users
      const userExists = await User.findById(execution.userId);
      if (!userExists) {
        incorrectRefs++;
        console.log(`ERRO: Execução ${execution._id} referencia um usuário inexistente (${execution.userId})`);
      }
    }
    
    if (incorrectRefs === 0) {
      console.log('SUCESSO: Todas as referências de execuções estão corretas.');
    } else {
      console.log(`ALERTA: Encontradas ${incorrectRefs} referências incorretas em execuções.`);
    }
    
    // 4. Verificar modelo de dados
    console.log('\n=== VERIFICAÇÃO DE MODELO DE DADOS ===\n');
    
    // Verificar se o modelo Workout está usando a referência correta
    const workoutSchema = Workout.schema.obj.userId;
    console.log(`Referência no modelo Workout: ${workoutSchema.ref}`);
    if (workoutSchema.ref === 'User') {
      console.log('SUCESSO: Modelo Workout está usando a referência correta (User).');
    } else {
      console.log(`ERRO: Modelo Workout está usando a referência incorreta (${workoutSchema.ref}). Deveria ser 'User'.`);
    }
    
    // Verificar se o modelo WorkoutExecution está usando a referência correta
    const executionSchema = WorkoutExecution.schema.obj.userId;
    console.log(`Referência no modelo WorkoutExecution: ${executionSchema.ref}`);
    if (executionSchema.ref === 'User') {
      console.log('SUCESSO: Modelo WorkoutExecution está usando a referência correta (User).');
    } else {
      console.log(`ERRO: Modelo WorkoutExecution está usando a referência incorreta (${executionSchema.ref}). Deveria ser 'User'.`);
    }
    
    console.log('\n=== RESUMO DA VERIFICAÇÃO ===\n');
    console.log(`- Clientes: ${clientCount}`);
    console.log(`- Usuários: ${userCount}`);
    console.log(`- Workouts: ${workoutsWithClientRef.length}`);
    console.log(`- Execuções: ${executionsWithClientRef.length}`);
    
    if (clientCount === 0 && 
        workoutSchema.ref === 'User' && 
        executionSchema.ref === 'User' && 
        incorrectRefs === 0) {
      console.log('\nMIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    } else {
      console.log('\nMIGRAÇÃO INCOMPLETA. Verifique os alertas acima.');
    }
    
  } catch (error) {
    console.error('Erro durante a verificação:', error);
  }
}

// Função principal
async function main() {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Verificar migração
    await verifyMigration();
    
    // Desconectar do MongoDB
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB');
    
  } catch (error) {
    console.error('Erro na execução do script:', error);
  }
}

// Executar script
main();
