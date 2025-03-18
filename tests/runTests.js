// backend/tests/runTests.js
const { spawn } = require('child_process');
const path = require('path');

// Lista de scripts de teste
const testScripts = [
    'apiTest.js',
    'adminApiTest.js',
    'authTest.js'
];

// Função para executar um script de teste
const runTestScript = (scriptName) => {
    return new Promise((resolve, reject) => {
        console.log(`\n=== EXECUTANDO ${scriptName} ===\n`);
        
        const scriptPath = path.join(__dirname, scriptName);
        const process = spawn('node', [scriptPath], { stdio: 'inherit' });
        
        process.on('close', (code) => {
            if (code === 0) {
                console.log(`\n✅ ${scriptName} concluído com sucesso!\n`);
                resolve();
            } else {
                console.error(`\n❌ ${scriptName} falhou com código de saída ${code}\n`);
                resolve(); // Resolvemos mesmo em caso de falha para continuar com os próximos testes
            }
        });
        
        process.on('error', (error) => {
            console.error(`\n❌ Erro ao executar ${scriptName}: ${error.message}\n`);
            resolve(); // Resolvemos mesmo em caso de erro para continuar com os próximos testes
        });
    });
};

// Função principal para executar todos os testes sequencialmente
const runAllTests = async () => {
    console.log('\n=== INICIANDO EXECUÇÃO DE TODOS OS TESTES ===\n');
    
    // Verificar se as dependências estão instaladas
    try {
        require('axios');
    } catch (error) {
        console.error('Erro: O pacote axios não está instalado. Por favor, execute:');
        console.error('npm install axios');
        return;
    }
    
    // Executar cada script de teste sequencialmente
    for (const script of testScripts) {
        await runTestScript(script);
    }
    
    console.log('\n=== TODOS OS TESTES FORAM CONCLUÍDOS ===\n');
};

// Executar todos os testes
runAllTests().catch(error => {
    console.error('Erro ao executar os testes:', error);
});
