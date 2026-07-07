import { Request, Response, NextFunction } from 'express';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const ipCache = new Map<string, RateLimitInfo>();

/**
 * Middleware para limitar requisições de um mesmo IP para proteção de força bruta.
 * Configuração padrão: máximo de 5 tentativas a cada 1 minuto por IP.
 */
export function rateLimiter(maxRequests = 10, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
    const now = Date.now();

    const info = ipCache.get(ip);

    if (!info) {
      ipCache.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (now > info.resetTime) {
      // Janela de tempo expirou, reseta o contador
      info.count = 1;
      info.resetTime = now + windowMs;
      return next();
    }

    info.count += 1;

    if (info.count > maxRequests) {
      const remainingSeconds = Math.ceil((info.resetTime - now) / 1000);
      return res.status(429).json({
        error: `Muitas tentativas. Por favor, tente novamente em ${remainingSeconds} segundos.`,
      });
    }

    next();
  };
}
