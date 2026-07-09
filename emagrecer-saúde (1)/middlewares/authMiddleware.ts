import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../services/tokenService.ts';
import { isDeviceActive } from '../services/deviceService.ts';
import prisma from '../config/db.ts';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Middleware para proteger rotas privadas.
 * Valida o JWT, verifica se o acesso está ativo (accessGranted = true),
 * e opcionalmente valida o limite de dispositivo.
 */
export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acesso não autorizado.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Acesso não autorizado.' });
    }

    // 1. Verifica e decodifica o token JWT
    let decoded: TokenPayload;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ error: 'Acesso não autorizado.' });
    }

    // 2. Busca o usuário no banco de dados para garantir o estado real de accessGranted
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'Acesso não autorizado.' });
    }

    if (!user.accessGranted) {
      return res.status(401).json({ error: 'Acesso não autorizado.' });
    }

    // 3. Validação opcional de limite de dispositivo (se um deviceId foi enviado no payload)
    if (decoded.deviceId) {
      const active = await isDeviceActive(user.id, decoded.deviceId);
      if (!active) {
        return res.status(401).json({ error: 'Sessão encerrada. Este e-mail está sendo usado em outro dispositivo.' });
      }
    }

    // Adiciona o usuário ao request para ser acessível nos controllers
    req.user = {
      userId: user.id,
      email: user.email,
      accessGranted: user.accessGranted,
      isAdmin: user.isAdmin,
      deviceId: decoded.deviceId,
    };

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(401).json({ error: 'Acesso não autorizado.' });
  }
}
