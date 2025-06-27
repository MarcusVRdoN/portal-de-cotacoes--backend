const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Preparando deploy com Prisma...\n');

// 1. Limpar artefatos antigos
console.log('🧹 Limpando artefatos antigos...');

const dirsToClean = ['.serverless', '.build', '.esbuild'];

dirsToClean.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// 2. Gerar Prisma Client
console.log('\n📦 Gerando Prisma Client...');

execSync('npx prisma generate --schema=./src/libs/prisma/schema.prisma', {
  stdio: 'inherit'
});

// 3. Verificar se o Prisma foi gerado corretamente
const prismaClientPath = path.join('node_modules', '.prisma', 'client');

if (!fs.existsSync(prismaClientPath)) {
  console.error('❌ Erro: Prisma Client não foi gerado corretamente!');
  process.exit(1);
}

// 4. Criar link simbólico se necessário
const prismaDefaultPath = path.join(prismaClientPath, 'default.js');
const prismaIndexPath = path.join(prismaClientPath, 'index.js');

if (!fs.existsSync(prismaDefaultPath) && fs.existsSync(prismaIndexPath)) {
  console.log('\n🔗 Criando link simbólico para default.js...');

  fs.copyFileSync(prismaIndexPath, prismaDefaultPath);

  // Também copiar os arquivos .d.ts
  const indexDtsPath = path.join(prismaClientPath, 'index.d.ts');
  const defaultDtsPath = path.join(prismaClientPath, 'default.d.ts');

  if (fs.existsSync(indexDtsPath)) {
    fs.copyFileSync(indexDtsPath, defaultDtsPath);
  }
}

// 5. Verificar binário
const binaryPath = path.join(prismaClientPath, 'libquery_engine-rhel-openssl-3.0.x.so.node');

if (!fs.existsSync(binaryPath)) {
  console.error('❌ Erro: Binário do Prisma não encontrado!');
  console.log('Arquivos encontrados em .prisma/client:');
  console.log(fs.readdirSync(prismaClientPath));
  process.exit(1);
}

console.log('✅ Prisma Client preparado com sucesso!\n');

// 6. Executar deploy
console.log('🚀 Iniciando deploy com Serverless...\n');

execSync('npx sls deploy --verbose', { stdio: 'inherit' });

console.log('\n✅ Deploy concluído com sucesso!');