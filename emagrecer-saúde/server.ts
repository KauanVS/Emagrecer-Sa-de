import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import apiRouter from './routes/api.ts';
import prisma from './config/db.ts';
import bcrypt from 'bcryptjs';

// Carrega as variáveis de ambiente do .env
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Configuração de segurança com Helmet (CSPs desabilitadas para garantir funcionamento do iFrame do Vite e do preview)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Habilita Cross-Origin Resource Sharing
app.use(cors());

// Parser para corpo JSON (importante para webhooks e requisições POST)
app.use(express.json());

// Log de requisições simples para depuração
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Registrar rotas de API
app.use('/api', apiRouter);

/**
 * Garante que as contas de administrador estejam prontas e configura o SQLite se necessário
 */
async function initializeDatabase() {
  try {
    // Detecta se o banco de dados é SQLite ou PostgreSQL
    const databaseUrl = process.env.DATABASE_URL || '';
    const isSqlite = databaseUrl.startsWith('file:') || databaseUrl.includes('.db');
    
    if (isSqlite) {
      // Configura o SQLite em modo WAL para evitar erros de banco travado (database locked)
      await prisma.$queryRawUnsafe('PRAGMA journal_mode=WAL;');
      console.log('[BANCO] Modo WAL do SQLite ativado com sucesso.');
    } else {
      console.log('[BANCO] Banco de dados PostgreSQL detectado. Ignorando PRAGMA WAL.');
    }
  } catch (err) {
    console.warn('[BANCO] Aviso ao configurar modo do banco de dados:', err);
  }

  try {
    // 2. Garante os dois administradores no banco
    const adminsToSeed = [
      { email: 'noctivusoct@gmail.com', nome: 'Admin Noctivus' },
      { email: 'kauansouza.vasc@gmail.com', nome: 'Admin Kauan' }
    ];

    const rawPassword = '29042003KaUaN@@';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    for (const adminData of adminsToSeed) {
      const existingUser = await prisma.user.findUnique({
        where: { email: adminData.email }
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            nome: adminData.nome,
            email: adminData.email,
            passwordHash,
            accessGranted: true,
            isAdmin: true
          }
        });
        console.log(`[BANCO] Admin cadastrado com sucesso: ${adminData.email}`);
      } else {
        // Se já existe, atualiza para garantir que seja admin e tenha acesso e a senha correta configurada
        await prisma.user.update({
          where: { email: adminData.email },
          data: {
            isAdmin: true,
            accessGranted: true,
            passwordHash // garante a senha atualizada
          }
        });
        console.log(`[BANCO] Admin verificado/atualizado: ${adminData.email}`);
      }
    }
  } catch (err) {
    console.error('[BANCO] Erro ao sincronizar administradores:', err);
  }
}

// Inicialização do servidor integrado com Vite
async function startServer() {
  // Inicializa o banco de dados antes de tudo
  await initializeDatabase();

  if (process.env.NODE_ENV !== 'production') {
    // Configura o middleware do Vite para modo de desenvolvimento
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Modo de desenvolvimento: Middleware do Vite carregado.');
  } else {
    // Serve os arquivos estáticos compilados em produção
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Modo de produção: Servindo arquivos estáticos de dist/.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVIDOR] Executando em http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Falha ao iniciar o servidor:', error);
});
