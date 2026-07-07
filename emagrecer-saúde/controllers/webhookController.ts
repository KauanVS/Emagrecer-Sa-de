import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/db.ts';
import { logAudit } from '../services/loggingService.ts';

const KIWIFY_WEBHOOK_SECRET = process.env.KIWIFY_WEBHOOK_SECRET || 'segredo_kiwify_teste_123';

/**
 * Controller para tratar Webhooks recebidos da Kiwify.
 */
export async function handleKiwifyWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['x-kiwify-signature'] as string;
    const payload = req.body;

    // Log de depuração do payload recebido
    console.log('[KIWIFY WEBHOOK] Recebido:', JSON.stringify(payload, null, 2));

    // 1. Validação de Assinatura (Segurança de alto nível)
    if (signature && process.env.NODE_ENV === 'production') {
      const hmac = crypto.createHmac('sha256', KIWIFY_WEBHOOK_SECRET);
      const calculatedSignature = hmac.update(JSON.stringify(payload)).digest('hex');

      if (signature !== calculatedSignature) {
        console.error('[KIWIFY WEBHOOK] Assinatura inválida detectada.');
        return res.status(401).json({ error: 'Assinatura inválida.' });
      }
    }

    const { order_status, customer, subscription } = payload;

    if (!customer || !customer.email) {
      return res.status(400).json({ error: 'Dados do cliente incompletos no payload do webhook.' });
    }

    const email = customer.email.toLowerCase().trim();
    const nome = customer.name || 'Cliente Kiwify';

    // Determina a ação com base no status da ordem ou da assinatura
    // Kiwify Order Statuses: paid (pago), refunded (reembolsado), chargedback, processing, pending etc.
    // Kiwify Subscription Statuses: active, canceled, expired, overdue
    let accessGranted = false;
    let actionType = 'UNKNOWN';

    if (order_status === 'paid' || order_status === 'approved') {
      accessGranted = true;
      actionType = 'APPROVED_PURCHASE';
    } else if (order_status === 'refunded' || order_status === 'chargedback') {
      accessGranted = false;
      actionType = 'REFUNDED_PURCHASE';
    } else if (subscription) {
      const subStatus = subscription.status;
      if (subStatus === 'active') {
        accessGranted = true;
        actionType = 'SUBSCRIPTION_ACTIVE';
      } else if (subStatus === 'canceled') {
        accessGranted = false;
        actionType = 'SUBSCRIPTION_CANCELED';
      } else if (subStatus === 'expired' || subStatus === 'overdue') {
        accessGranted = false;
        actionType = 'SUBSCRIPTION_EXPIRED';
      }
    }

    if (actionType === 'UNKNOWN') {
      // Se não for um status que altera permissão direta, apenas logamos
      console.log(`[KIWIFY WEBHOOK] Ignorando status desconhecido: ${order_status}`);
      return res.json({ status: 'ignored', message: 'Status não altera acessos.' });
    }

    // Busca usuário existente
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      if (accessGranted) {
        // Cria novo usuário aprovado sem senha (primeiro acesso)
        user = await prisma.user.create({
          data: {
            nome,
            email,
            accessGranted: true,
          },
        });
        await logAudit(
          user.id,
          'KIWIFY_WEBHOOK_USER_CREATED',
          `Usuário criado automaticamente após aprovação de compra na Kiwify.`
        );
        console.log(`[KIWIFY WEBHOOK] Novo usuário criado: ${email}. Acesso Liberado.`);
      } else {
        // Se a compra foi recusada/reembolsada mas o usuário nem existia, apenas informamos
        console.log(`[KIWIFY WEBHOOK] Cancelamento recebido para usuário inexistente: ${email}`);
        return res.json({ status: 'ignored', message: 'Usuário inexistente para bloqueio.' });
      }
    } else {
      // Usuário existe, atualiza permissão
      user = await prisma.user.update({
        where: { id: user.id },
        data: { accessGranted },
      });

      await logAudit(
        user.id,
        `KIWIFY_WEBHOOK_${actionType}`,
        `Permissão de acesso atualizada via Webhook Kiwify para: ${accessGranted ? 'ATIVADO' : 'BLOQUEADO'}`
      );
      console.log(`[KIWIFY WEBHOOK] Usuário ${email} atualizado: accessGranted = ${accessGranted}`);
    }

    return res.json({ 
      status: 'success', 
      userId: user.id, 
      accessGranted,
      action: actionType
    });
  } catch (error: any) {
    console.error('[KIWIFY WEBHOOK] Erro ao processar:', error);
    return res.status(500).json({ error: 'Erro interno ao processar webhook.' });
  }
}
