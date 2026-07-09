import prisma from '../config/db.ts';

/**
 * Registra um log de login com IP e User Agent.
 */
export async function logLogin(userId: number, ip: string, userAgent?: string) {
  try {
    return await prisma.loginLog.create({
      data: {
        userId,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Falha ao salvar log de login:', error);
  }
}

/**
 * Registra uma ação de auditoria realizada por um usuário ou pelo sistema.
 */
export async function logAudit(userId: number | null, action: string, details?: string) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  } catch (error) {
    console.error('Falha ao salvar log de auditoria:', error);
  }
}
