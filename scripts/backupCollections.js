/**
 * Script para fazer backup das coleções do MongoDB
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// URL de conexão do MongoDB - ajuste conforme necessário
const MONGODB_URI = 'mongodb://localhost:27017/nopainnogain';

// Função para fazer backup de uma coleção
async function backupCollection(collectionName) {
  try {
    console.log(`Iniciando backup da coleção ${collectionName}...`);
    
    // Obter dados da coleção
    const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
    
    // Criar diretório de backup se não existir
    const backupDir = path.join(__dirname, '..', 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Salvar dados em um arquivo JSON
    const backupPath = path.join(backupDir, `${collectionName}_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
    
    console.log(`Backup da coleção ${collectionName} concluído: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error(`Erro ao fazer backup da coleção ${collectionName}:`, error);
    throw error;
  }
}

// Função principal
async function main() {
  try {
    console.log('Iniciando backup das coleções...');
    
    // Conectar ao MongoDB
    console.log(`Conectando ao MongoDB em ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado com sucesso ao MongoDB');
    
    // Verificar quais coleções existem
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Coleções encontradas:', collectionNames);
    
    // Fazer backup das coleções relevantes
    const backupFiles = [];
    
    if (collectionNames.includes('users')) {
      const usersBackup = await backupCollection('users');
      backupFiles.push(usersBackup);
    } else {
      console.log('Coleção "users" não encontrada');
    }
    
    if (collectionNames.includes('clients')) {
      const clientsBackup = await backupCollection('clients');
      backupFiles.push(clientsBackup);
    } else {
      console.log('Coleção "clients" não encontrada');
    }
    
    console.log('\nBackup concluído com sucesso!');
    console.log('Arquivos de backup:');
    backupFiles.forEach(file => console.log(`- ${file}`));
    
  } catch (error) {
    console.error('Erro durante o backup:', error);
  } finally {
    // Fechar conexão com o MongoDB
    await mongoose.disconnect();
    console.log('Conexão com o MongoDB fechada');
  }
}

// Executar a função principal
main();
