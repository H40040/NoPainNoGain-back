// Script de migração de clients para users
const mongoose = require('mongoose');
const Client = require('../models/clientModel');
const User = require('../models/userModel');
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

// Função para migrar clientes para usuários
async function migrateClientsToUsers() {
  try {
    // Buscar todos os clientes
    const clients = await Client.find({});
    console.log(`Encontrados ${clients.length} clientes para migração`);
    
    // Contador de estatísticas
    let stats = {
      created: 0,
      updated: 0,
      skipped: 0,
      workoutsUpdated: 0,
      executionsUpdated: 0,
      errors: 0
    };
    
    // Para cada cliente, criar um usuário correspondente
    for (const client of clients) {
      try {
        // Verificar se já existe um usuário com o mesmo email
        const existingUser = await User.findOne({ email: client.email });
        
        if (existingUser) {
          console.log(`Usuário com email ${client.email} já existe, atualizando...`);
          
          // Atualizar campos do usuário existente
          existingUser.name = client.name;
          existingUser.profileImage = client.profileImage;
          existingUser.birthDate = client.birthDate;
          existingUser.gender = client.gender;
          existingUser.isActive = client.isActive;
          existingUser.lastLogin = client.lastLogin;
          existingUser.role = client.role;
          existingUser.createdAt = client.createdAt;
          existingUser.updatedAt = client.updatedAt;
          
          // Salvar usuário atualizado
          await existingUser.save();
          console.log(`Usuário ${existingUser.email} atualizado com sucesso`);
          stats.updated++;
          
          // Atualizar referências em workouts e execuções
          const refsUpdated = await updateWorkoutReferences(client._id, existingUser._id);
          stats.workoutsUpdated += refsUpdated.workouts;
          stats.executionsUpdated += refsUpdated.executions;
        } else {
          // Criar novo usuário
          const clientData = client.toObject();
          delete clientData._id; // Remover ID para gerar um novo
          
          const newUser = new User(clientData);
          await newUser.save();
          console.log(`Usuário ${newUser.email} criado com sucesso`);
          stats.created++;
          
          // Atualizar referências em workouts e execuções
          const refsUpdated = await updateWorkoutReferences(client._id, newUser._id);
          stats.workoutsUpdated += refsUpdated.workouts;
          stats.executionsUpdated += refsUpdated.executions;
        }
      } catch (error) {
        console.error(`Erro ao migrar cliente ${client.email}:`, error);
        stats.errors++;
      }
    }
    
    console.log('\nMigração concluída com sucesso');
    console.log('Estatísticas:');
    console.log(`- Usuários criados: ${stats.created}`);
    console.log(`- Usuários atualizados: ${stats.updated}`);
    console.log(`- Usuários ignorados: ${stats.skipped}`);
    console.log(`- Workouts atualizados: ${stats.workoutsUpdated}`);
    console.log(`- Execuções atualizadas: ${stats.executionsUpdated}`);
    console.log(`- Erros: ${stats.errors}`);
    
  } catch (error) {
    console.error('Erro durante a migração:', error);
  }
}

// Função para atualizar referências em workouts e execuções
async function updateWorkoutReferences(oldId, newId) {
  try {
    // Atualizar referências em workouts
    const workoutsResult = await Workout.updateMany(
      { userId: oldId },
      { $set: { userId: newId } }
    );
    
    // Atualizar referências em execuções de workout
    const executionsResult = await WorkoutExecution.updateMany(
      { userId: oldId },
      { $set: { userId: newId } }
    );
    
    console.log(`Referências atualizadas: ${workoutsResult.modifiedCount} workouts, ${executionsResult.modifiedCount} execuções`);
    
    return {
      workouts: workoutsResult.modifiedCount,
      executions: executionsResult.modifiedCount
    };
  } catch (error) {
    console.error('Erro ao atualizar referências:', error);
    return { workouts: 0, executions: 0 };
  }
}

// Função principal
async function main() {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Verificar se há clientes para migrar
    const clientCount = await Client.countDocuments();
    if (clientCount === 0) {
      console.log('Nenhum cliente encontrado para migração');
      await mongoose.disconnect();
      return;
    }
    
    // Executar migração
    await migrateClientsToUsers();
    
    // Desconectar do MongoDB
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
    
  } catch (error) {
    console.error('Erro na execução do script:', error);
  }
}

// Executar script
main();
