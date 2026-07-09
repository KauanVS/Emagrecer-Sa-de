import { Response } from 'express';
import prisma from '../config/db.ts';
import { logAudit } from '../services/loggingService.ts';

/**
 * Retorna todos os usuários cadastrados com paginação e filtro de busca
 */
export async function getUsers(req: any, res: Response) {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar.' });
    }

    const { search } = req.query;
    const filter: any = {};

    if (search) {
      filter.OR = [
        { nome: { contains: String(search) } },
        { email: { contains: String(search) } }
      ];
    }

    const users = await prisma.user.findMany({
      where: filter,
      include: {
        loginLogs: {
          orderBy: { createdAt: 'desc' },
          take: 3
        },
        devices: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(users);
  } catch (error: any) {
    console.error('Erro ao buscar usuários (admin):', error);
    return res.status(500).json({ error: 'Erro interno ao buscar usuários.' });
  }
}

/**
 * Bloqueia ou desbloqueia o acesso de um usuário específico
 */
export async function toggleAccess(req: any, res: Response) {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }

    const targetUserId = parseInt(req.params.id);
    const { accessGranted } = req.body;

    if (isNaN(targetUserId)) {
      return res.status(400).json({ error: 'ID do usuário inválido.' });
    }

    if (targetUserId === req.user.userId) {
      return res.status(400).json({ error: 'Você não pode bloquear seu próprio acesso administrativo.' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { accessGranted: Boolean(accessGranted) }
    });

    // Registra a alteração de acesso no log de auditoria
    await logAudit(
      req.user.userId,
      'ADMIN_TOGGLE_ACCESS',
      `Administrador alterou acesso do usuário ID ${targetUserId} (${targetUser.email}) para: ${accessGranted ? 'PERMITIDO' : 'BLOQUEADO'}`
    );

    return res.json({
      message: `Acesso do usuário ${updatedUser.email} foi ${updatedUser.accessGranted ? 'liberado' : 'bloqueado'} com sucesso!`,
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Erro ao alterar acesso do usuário:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar acesso.' });
  }
}

/**
 * Retorna todos os logs de auditoria do sistema
 */
export async function getAuditLogs(req: any, res: Response) {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return res.json(logs);
  } catch (error: any) {
    console.error('Erro ao buscar logs de auditoria:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar logs.' });
  }
}
