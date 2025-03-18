// Script para remover clientes após confirmação de migração bem-sucedida
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Client = require('../models/clientModel');
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

// Função para verificar e remover clientes
async function removeClients() {
  try {
    console.log('\n=== REMOÇÃO DE CLIENTES APÓS MIGRAÇÃO ===\n');
    
    // 1. Verificar se todos os clientes foram migrados para usuários
    const clients = await Client.find();
    console.log(`Encontrados ${clients.length} clientes para verificação`);
    
    let allMigrated = true;
    let migratedCount = 0;
    let notMigratedCount = 0;
    let notMigratedEmails = [];
    
    // Verificar cada cliente
    for (const client of clients) {
      const userExists = await User.findOne({ email: client.email });
      
      if (userExists) {
        migratedCount++;
        console.log(`Cliente ${client.email} foi migrado com sucesso para a collection users`);
      } else {
        notMigratedCount++;
        notMigratedEmails.push(client.email);
        allMigrated = false;
        console.log(`ALERTA: Cliente ${client.email} NÃO foi migrado para a collection users`);
      }
    }
    
    console.log(`\nResumo da verificação:`);
    console.log(`- Total de clientes: ${clients.length}`);
    console.log(`- Clientes migrados: ${migratedCount}`);
    console.log(`- Clientes não migrados: ${notMigratedCount}`);
    
    if (!allMigrated) {
      console.log('\nALERTA: Nem todos os clientes foram migrados para a collection users.');
      console.log('Os seguintes emails não foram migrados:');
      notMigratedEmails.forEach(email => console.log(`- ${email}`));
      console.log('\nOperação de remoção CANCELADA por segurança.');
      return;
    }
    
    // 2. Se todos os clientes foram migrados, perguntar se deseja prosseguir com a remoção
    console.log('\nTodos os clientes foram migrados com sucesso para a collection users.');
    console.log('Prosseguindo com a remoção da collection clients...');
    
    // 3. Remover todos os clientes
    const deleteResult = await Client.deleteMany({});
    console.log(`\nRemoção concluída: ${deleteResult.deletedCount} clientes removidos.`);
    
    // 4. Verificar se a remoção foi bem-sucedida
    const remainingClients = await Client.countDocuments();
    if (remainingClients === 0) {
      console.log('\nSUCESSO: Todos os clientes foram removidos da collection clients.');
    } else {
      console.log(`\nALERTA: Ainda existem ${remainingClients} clientes na collection clients.`);
    }
    
  } catch (error) {
    console.error('Erro durante a remoção:', error);
  }
}

// Função principal
async function main() {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Remover clientes
    await removeClients();
    
    // Desconectar do MongoDB
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB');
    
  } catch (error) {
    console.error('Erro na execução do script:', error);
  }
}

// Executar script
main();
