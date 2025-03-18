const { exec } = require('child_process');
const path = require('path');

console.log('Iniciando configuração do banco de dados...');
console.log('Este script executará a migração e o seed do banco de dados sequencialmente.');

// Função para executar um script Node.js
const runScript = (scriptPath) => {
  return new Promise((resolve, reject) => {
    console.log(`\nExecutando script: ${path.basename(scriptPath)}`);
    console.log('--------------------------------------------------');
    
    const process = exec(`node ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao executar ${path.basename(scriptPath)}:`, error);
        return reject(error);
      }
      
      if (stderr) {
        console.error(`Stderr de ${path.basename(scriptPath)}:`, stderr);
      }
      
      resolve(stdout);
    });
    
    // Mostrar output em tempo real
    process.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });
    
    process.stderr.on('data', (data) => {
      console.error(data.toString().trim());
    });
  });
};

// Caminho para os scripts
const migrateScript = path.join(__dirname, 'migrateDatabase.js');
const seedScript = path.join(__dirname, 'seedDatabase.js');

// Executar scripts sequencialmente
(async () => {
  try {
    // Primeiro executar a migração
    console.log('\n=== ETAPA 1: MIGRAÇÃO DO BANCO DE DADOS ===');
    await runScript(migrateScript);
    
    // Depois executar o seed
    console.log('\n=== ETAPA 2: POPULAÇÃO DO BANCO DE DADOS ===');
    await runScript(seedScript);
    
    console.log('\n=== CONFIGURAÇÃO DO BANCO DE DADOS CONCLUÍDA COM SUCESSO ===');
    console.log('O banco de dados foi migrado e populado com dados iniciais.');
    console.log('Você pode agora iniciar o servidor normalmente.');
  } catch (error) {
    console.error('\n=== ERRO NA CONFIGURAÇÃO DO BANCO DE DADOS ===');
    console.error('Ocorreu um erro durante a configuração do banco de dados.');
    console.error('Verifique os logs acima para mais detalhes.');
    process.exit(1);
  }
})();
