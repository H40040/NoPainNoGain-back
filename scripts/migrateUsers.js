/**
 * Script de migração para consolidar as coleções users e clients
 * Este script migra dados da coleção users para a coleção clients
 * e depois renomeia a coleção clients para users
 */

const mongoose = require('mongoose');

// URL de conexão do MongoDB - ajuste conforme necessário
const MONGODB_URI = 'mongodb://localhost:27017/nopainnogain';

// Função principal de migração
async function migrateData() {
  try {
    console.log('Iniciando migração de dados...');
    
    // Conectar ao MongoDB
    console.log(`Conectando ao MongoDB em ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado com sucesso ao MongoDB');

    // Definir esquemas temporários para ambas as coleções
    const OldUserSchema = new mongoose.Schema({}, { strict: false });
    const ClientSchema = new mongoose.Schema({}, { strict: false });

    const OldUser = mongoose.model('User', OldUserSchema);
    const Client = mongoose.model('Client', ClientSchema);

    // Verificar se as coleções existem
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const hasUsersCollection = collectionNames.includes('users');
    const hasClientsCollection = collectionNames.includes('clients');
    
    console.log('Coleções encontradas:', collectionNames);
    console.log('Coleção users existe:', hasUsersCollection);
    console.log('Coleção clients existe:', hasClientsCollection);

    if (!hasUsersCollection) {
      console.log('Coleção users não encontrada. Nada para migrar.');
      if (hasClientsCollection) {
        console.log('Apenas a coleção clients existe. Renomeando para users...');
        await mongoose.connection.db.collection('clients').rename('users');
        console.log('Coleção clients renomeada para users com sucesso!');
      } else {
        console.log('Nenhuma das coleções existe. Nada para fazer.');
      }
      return;
    }

    if (!hasClientsCollection) {
      console.log('Coleção clients não encontrada. Renomeando users para clients...');
      await mongoose.connection.db.collection('users').rename('clients');
      console.log('Coleção users renomeada para clients com sucesso!');
      return;
    }

    // Buscar todos os usuários da coleção antiga
    const oldUsers = await OldUser.find({});
    console.log(`Encontrados ${oldUsers.length} usuários na coleção antiga`);

    // Contador para estatísticas
    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    // Para cada usuário, verificar se já existe na coleção de clientes
    for (const user of oldUsers) {
      try {
        const existingClient = await Client.findOne({ email: user.email });
        
        if (!existingClient) {
          // Criar novo cliente com os dados do usuário
          const newClient = new Client({
            name: user.name || 'Usuário',
            email: user.email,
            password: user.password, // Já está hasheado
            role: user.role || 'user',
            profileImage: user.profileImage || '',
            birthDate: user.birthDate || null,
            gender: user.gender || '',
            isActive: user.isActive !== undefined ? user.isActive : true,
            lastLogin: user.lastLogin || null,
            createdAt: user.createdAt || new Date(),
            updatedAt: user.updatedAt || new Date()
          });
          
          await newClient.save();
          console.log(`Migrado usuário: ${user.email}`);
          migrated++;
        } else {
          console.log(`Usuário já existe como cliente: ${user.email}`);
          skipped++;
        }
      } catch (error) {
        console.error(`Erro ao migrar usuário ${user.email}:`, error);
        errors++;
      }
    }
    
    console.log('\nResumo da migração:');
    console.log(`- Total de usuários: ${oldUsers.length}`);
    console.log(`- Usuários migrados: ${migrated}`);
    console.log(`- Usuários ignorados (já existentes): ${skipped}`);
    console.log(`- Erros: ${errors}`);

    // Renomear a coleção clients para users
    if (migrated > 0 || skipped > 0) {
      console.log('\nRenomeando coleção clients para users...');
      
      // Primeiro, renomear a coleção users original para users_old
      console.log('Renomeando users original para users_old...');
      await mongoose.connection.db.collection('users').rename('users_old');
      console.log('Coleção users renomeada para users_old com sucesso!');
      
      // Agora, renomear clients para users
      await mongoose.connection.db.collection('clients').rename('users');
      console.log('Coleção clients renomeada para users com sucesso!');
      
      // Remover a coleção users antiga
      console.log('Removendo coleção users_old...');
      await mongoose.connection.db.collection('users_old').drop();
      console.log('Coleção users_old removida com sucesso!');
    } else {
      console.log('\nNenhum usuário foi migrado. Não é necessário renomear coleções.');
    }
    
    console.log('\nMigração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    // Fechar conexão com o MongoDB
    await mongoose.disconnect();
    console.log('Conexão com o MongoDB fechada');
  }
}

// Executar a migração
migrateData();
