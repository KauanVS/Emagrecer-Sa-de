import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_jwt_padrao_super_segura';

export interface TokenPayload {
  userId: number;
  email: string;
  accessGranted: boolean;
  isAdmin: boolean;
  deviceId?: string;
}

/**
 * Gera um token de acesso JWT de curta duração.
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

/**
 * Gera um token de renovação (refresh token) de longa duração.
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign({ ...payload, isRefreshToken: true }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifica se um token é válido e retorna o payload decodificado.
 */
export function verifyToken(token: string): TokenPayload & { isRefreshToken?: boolean } {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    throw new Error('Token inválido ou expirado.');
  }
}
