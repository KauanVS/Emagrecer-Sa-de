import prisma from '../config/db.ts';

/**
 * Registra ou atualiza o dispositivo ativo de um usuário para garantir o limite de até 2 dispositivos simultâneos por conta.
 */
export async function registerActiveDevice(userId: number, deviceId: string) {
  try {
    // 1. Limpa sessões inativas de mais de 12 horas para liberar espaço
    const inactiveThreshold = new Date(Date.now() - 12 * 60 * 60 * 1000);
    await prisma.userDevice.deleteMany({
      where: {
        lastActive: {
          lt: inactiveThreshold,
        },
      },
    });

    // 2. Remove qualquer registro anterior deste deviceId para QUALQUER usuário.
    // Isso evita com 100% de garantia erros de chave única (UNIQUE constraint) no SQLite
    // se o mesmo dispositivo for usado para fazer login em outra conta ou se houver colisão.
    await prisma.userDevice.deleteMany({
      where: { deviceId },
    });

    // 3. Conta quantos dispositivos ativos este usuário possui atualmente
    const activeDevicesCount = await prisma.userDevice.count({
      where: { userId },
    });

    // 4. Se já atingiu o limite de 2 dispositivos ativos e este dispositivo não estava registrado para o usuário, bloqueia o login
    if (activeDevicesCount >= 2) {
      const error = new Error('LIMIT_REACHED');
      (error as any).status = 403;
      throw error;
    }

    // 5. Cria o registro do novo dispositivo ativo
    return await prisma.userDevice.create({
      data: {
        userId,
        deviceId,
        lastActive: new Date(),
      },
    });
  } catch (error) {
    console.error('Erro ao registrar dispositivo ativo:', error);
    throw error;
  }
}

/**
 * Verifica se o dispositivo atual do usuário ainda é o dispositivo ativo autorizado.
 */
export async function isDeviceActive(userId: number, deviceId: string): Promise<boolean> {
  try {
    const activeDevice = await prisma.userDevice.findUnique({
      where: { deviceId },
    });

    if (!activeDevice || activeDevice.userId !== userId) {
      return false;
    }

    // Atualiza o horário de atividade
    await prisma.userDevice.update({
      where: { deviceId },
      data: { lastActive: new Date() },
    });

    return true;
  } catch (error) {
    console.error('Erro ao verificar atividade do dispositivo:', error);
    return false;
  }
}
