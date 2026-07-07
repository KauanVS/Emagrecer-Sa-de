import { Router, Request, Response } from 'express';
import { 
  register, 
  login, 
  logout, 
  createPassword, 
  recoverPassword, 
  resetPassword, 
  refreshToken, 
  me, 
  loginGoogle
} from '../controllers/authController.ts';
import { handleKiwifyWebhook } from '../controllers/webhookController.ts';
import { getUsers, toggleAccess, getAuditLogs } from '../controllers/adminController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import { rateLimiter } from '../middlewares/rateLimiter.ts';
import prisma from '../config/db.ts';
import bcrypt from 'bcryptjs';

const router = Router();

// --- PUBLIC ROUTE: HEALTH CHECK ---
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// --- AUTHENTICATION ROUTES ---
router.post('/register', register);
router.post('/login', rateLimiter(10, 60 * 1000), login);
router.post('/logout', logout);
router.post('/create-password', createPassword);
router.post('/recover-password', rateLimiter(5, 60 * 1000), recoverPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/login-google', loginGoogle);

// --- PROTECTED USER ROUTES ---
router.get('/me', authMiddleware, me);

// --- KIWIFY WEBHOOK ROUTE (PROTECTED BY SECRET/HMAC SIGNATURE) ---
router.post('/webhook/kiwify', handleKiwifyWebhook);

// --- ADMIN ROUTES (PROTECTED BY AUTH MIDDLEWARE) ---
router.get('/admin/users', authMiddleware, getUsers);
router.post('/admin/users/:id/toggle-access', authMiddleware, toggleAccess);
router.get('/admin/audit-logs', authMiddleware, getAuditLogs);

// --- DEVELOPMENT ONLY SEED ROUTE (Creates default admins) ---
router.post('/admin/seed', async (req: Request, res: Response) => {
  try {
    const adminsToSeed = [
      { email: 'noctivusoct@gmail.com', nome: 'Admin Noctivus' },
      { email: 'kauansouza.vasc@gmail.com', nome: 'Admin Kauan' }
    ];

    const rawPassword = '29042003KaUaN@@';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const seeded: string[] = [];

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
        seeded.push(adminData.email);
      } else {
        await prisma.user.update({
          where: { email: adminData.email },
          data: {
            isAdmin: true,
            accessGranted: true,
            passwordHash
          }
        });
        seeded.push(`${adminData.email} (atualizado)`);
      }
    }

    return res.status(201).json({
      message: 'Administradores sincronizados com sucesso!',
      seeded
    });
  } catch (error: any) {
    console.error('Erro ao semear banco de dados:', error);
    return res.status(500).json({ error: 'Erro interno ao criar administrador.' });
  }
});

export default router;
