import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

try {
  console.log('--- INICIANDO BUILD PARA O RENDER ---');

  // 1. Altera o provider do prisma para postgresql
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    console.log('Modificando prisma/schema.prisma para PostgreSQL...');
    let schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Substitui o provedor de sqlite por postgresql
    schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
    
    fs.writeFileSync(schemaPath, schema);
    console.log('Schema do Prisma atualizado para postgresql com sucesso.');
  } else {
    console.error('Arquivo do schema do Prisma não encontrado em:', schemaPath);
    process.exit(1);
  }

  // 2. Executa Prisma Generate
  console.log('Executando: npx prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // 3. Executa o build do Vite (Frontend)
  console.log('Executando: npx vite build...');
  execSync('npx vite build', { stdio: 'inherit' });

  // 4. Executa o build do esbuild (Backend)
  console.log('Executando: npx esbuild server.ts...');
  execSync('npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs', { stdio: 'inherit' });

  console.log('--- BUILD PARA O RENDER CONCLUÍDO COM SUCESSO ---');
} catch (error) {
  console.error('--- ERRO NO BUILD PARA O RENDER ---');
  console.error(error);
  process.exit(1);
}
