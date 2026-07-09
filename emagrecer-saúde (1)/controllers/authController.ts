import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.ts';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyToken, 
  TokenPayload 
} from '../services/tokenService.ts';
import { registerActiveDevice } from '../services/deviceService.ts';
import { logLogin, logAudit } from '../services/loggingService.ts';

/**
 * Registro de novos usuários de forma padrão (com acesso desativado por padrão)
 */
export async function register(req: Request, res: Response) {
  try {
    const { nome, email, password } = req.body;

    if (!nome || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos (nome, email, password) são obrigatórios.' });
    }

    const emailLower = email.toLowerCase().trim();

    // Verifica se já existe o e-mail
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Cria o usuário (acesso liberado por padrão)
    const user = await prisma.user.create({
      data: {
        nome,
        email: emailLower,
        passwordHash,
        accessGranted: true,
      },
    });

    await logAudit(user.id, 'USER_REGISTER', `Usuário registrado via formulário com acesso liberado.`);

    return res.status(201).json({ 
      message: 'Cadastro realizado com sucesso! Seu acesso já está liberado.',
      userId: user.id
    });
  } catch (error: any) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ error: 'Erro interno ao realizar cadastro.' });
  }
}

/**
 * Login com e-mail e senha
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password, deviceId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const emailLower = email.toLowerCase().trim();

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Se o usuário foi criado via Kiwify mas não definiu senha ainda
    if (!user.passwordHash) {
      return res.status(400).json({ 
        error: 'Sua conta foi criada, mas você precisa definir sua primeira senha primeiro.',
        needsPasswordSetup: true 
      });
    }

    // Valida senha
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Verifica se tem acesso concedido
    if (!user.accessGranted) {
      return res.status(403).json({ error: 'Seu acesso está bloqueado. Entre em contato com o suporte.' });
    }

    // Gera um ID de dispositivo único se não enviado
    const activeDeviceId = deviceId || `dev_${Math.random().toString(36).substr(2, 9)}`;

    // Registra este dispositivo como um dos ativos (limite de 2 dispositivos simultâneos)
    await registerActiveDevice(user.id, activeDeviceId);

    // Cria o payload do token
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      accessGranted: user.accessGranted,
      isAdmin: user.isAdmin,
      deviceId: activeDeviceId
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Registra no log de login e de auditoria
    const ip = req.ip || req.headers['x-forwarded-for'] as string || '127.0.0.1';
    const userAgent = req.headers['user-agent'];
    await logLogin(user.id, ip, userAgent);
    await logAudit(user.id, 'USER_LOGIN', `Login efetuado com sucesso. IP: ${ip}`);

    return res.json({
      message: 'Login bem-sucedido!',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        accessGranted: user.accessGranted,
        isAdmin: user.isAdmin,
      },
      accessToken,
      refreshToken,
      deviceId: activeDeviceId
    });
  } catch (error: any) {
    if (error.message === 'LIMIT_REACHED') {
      return res.status(403).json({ 
        error: 'Limite de dispositivos atingido. Esta conta já está sendo acessada por 2 dispositivos simultaneamente. Por favor, saia de uma das sessões ou aguarde alguém deslogar.' 
      });
    }
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
}

/**
 * Primeiro acesso: Define a senha para usuários criados sem senha via Kiwify
 */
export async function createPassword(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const emailLower = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado. Certifique-se de que sua compra foi aprovada na Kiwify.' });
    }

    if (user.passwordHash) {
      return res.status(400).json({ error: 'Você já possui uma senha definida. Use a recuperação de senha se necessário.' });
    }

    // Criptografa a nova senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Atualiza o usuário
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await logAudit(user.id, 'PASSWORD_CREATED', 'Primeira senha definida com sucesso após aprovação Kiwify.');

    return res.json({ message: 'Senha cadastrada com sucesso! Agora você já pode fazer login normalmente.' });
  } catch (error: any) {
    console.error('Erro ao definir senha:', error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar senha.' });
  }
}

/**
 * Solicitação de recuperação de senha (retorna um token simulado / de auditoria)
 */
export async function recoverPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório.' });
    }

    const emailLower = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      // Por segurança, retorna mensagem genérica para evitar enumeração de e-mails
      return res.json({ message: 'Se o e-mail estiver cadastrado, as instruções foram enviadas.' });
    }

    // Gera um token de recuperação de senha temporário (válido por 1 hora)
    const resetToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      accessGranted: user.accessGranted,
      isAdmin: user.isAdmin,
      deviceId: 'reset_flow'
    });

    const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Em produção, isso seria enviado via SMTP (Nodemailer/SendGrid).
    // Para simplificar e manter real, registramos no log de auditoria e printamos no console.
    await logAudit(user.id, 'PASSWORD_RECOVERY_REQUESTED', `Recuperação solicitada. Token gerado.`);
    console.log(`[RECUPERAÇÃO DE SENHA] Link de reset para ${user.email}: ${resetLink}`);

    return res.json({ 
      message: 'Se o e-mail estiver cadastrado, as instruções foram enviadas.',
      // Retornamos em desenvolvimento para facilitar o teste local
      resetLink: process.env.NODE_ENV !== 'production' ? resetLink : undefined 
    });
  } catch (error: any) {
    console.error('Erro na recuperação de senha:', error);
    return res.status(500).json({ error: 'Erro interno ao processar recuperação.' });
  }
}

/**
 * Redefine a senha de fato utilizando o token enviado por e-mail
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
    }

    // Verifica token
    let decoded: TokenPayload;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Criptografa nova senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Atualiza a senha no banco
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await logAudit(user.id, 'PASSWORD_RESET', 'Senha redefinida com sucesso utilizando token de recuperação.');

    return res.json({ message: 'Senha redefinida com sucesso! Você já pode fazer login.' });
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    return res.status(500).json({ error: 'Erro interno ao redefinir senha.' });
  }
}

/**
 * Renovação de tokens de acesso usando o Refresh Token
 */
export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh Token é obrigatório.' });
    }

    // Valida token
    let decoded: any;
    try {
      decoded = verifyToken(refreshToken);
    } catch (err) {
      return res.status(401).json({ error: 'Token de renovação expirado ou inválido.' });
    }

    if (!decoded.isRefreshToken) {
      return res.status(401).json({ error: 'Token inválido.' });
    }

    // Busca usuário atualizado
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.accessGranted) {
      return res.status(401).json({ error: 'Usuário não existe ou perdeu permissão de acesso.' });
    }

    // Opcional: valida dispositivo
    if (decoded.deviceId) {
      const active = await prisma.userDevice.findUnique({ where: { deviceId: decoded.deviceId } });
      if (!active) {
        return res.status(401).json({ error: 'Dispositivo desconectado ou sessão inválida.' });
      }
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      accessGranted: user.accessGranted,
      isAdmin: user.isAdmin,
      deviceId: decoded.deviceId
    };

    const newAccessToken = generateAccessToken(payload);

    return res.json({
      accessToken: newAccessToken
    });
  } catch (error: any) {
    console.error('Erro na renovação do token:', error);
    return res.status(500).json({ error: 'Erro interno na renovação do token.' });
  }
}

/**
 * Logout
 */
export async function logout(req: Request, res: Response) {
  try {
    const { deviceId } = req.body;

    if (deviceId) {
      // Remove o dispositivo registrado do banco
      await prisma.userDevice.deleteMany({
        where: { deviceId },
      });
    }

    return res.json({ message: 'Sessão encerrada com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao deslogar:', error);
    return res.status(500).json({ error: 'Erro interno ao deslogar.' });
  }
}

/**
 * Retorna dados do usuário autenticado no momento
 */
export async function me(req: any, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        nome: true,
        email: true,
        accessGranted: true,
        isAdmin: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json(user);
  } catch (error: any) {
    console.error('Erro ao buscar dados do usuário atual:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar usuário.' });
  }
}

/**
 * Login com Google (Sincronizado com os dados criados via Kiwify ou permitindo registro)
 */
export async function loginGoogle(req: Request, res: Response) {
  try {
    const { email, nome, googleUid, deviceId } = req.body;

    if (!email || !nome) {
      return res.status(400).json({ error: 'Dados do Google insuficientes.' });
    }

    const emailLower = email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      // Cria o usuário com acesso liberado por padrão
      user = await prisma.user.create({
        data: {
          nome,
          email: emailLower,
          accessGranted: true,
        },
      });
      await logAudit(user.id, 'GOOGLE_SIGNUP', 'Cadastro via Google bem-sucedido com acesso liberado.');
    }

    if (!user.accessGranted) {
      return res.status(403).json({ error: 'Seu acesso está bloqueado. Entre em contato com o suporte.' });
    }

    // Login aprovado
    const activeDeviceId = deviceId || `google_${Math.random().toString(36).substr(2, 9)}`;
    await registerActiveDevice(user.id, activeDeviceId);

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      accessGranted: user.accessGranted,
      isAdmin: user.isAdmin,
      deviceId: activeDeviceId
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const ip = req.ip || req.headers['x-forwarded-for'] as string || '127.0.0.1';
    await logLogin(user.id, ip, 'Google Auth');
    await logAudit(user.id, 'USER_LOGIN_GOOGLE', `Login via Google bem-sucedido. IP: ${ip}`);

    return res.json({
      message: 'Login com Google bem-sucedido!',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        accessGranted: user.accessGranted,
        isAdmin: user.isAdmin,
      },
      accessToken,
      refreshToken,
      deviceId: activeDeviceId
    });
  } catch (error: any) {
    if (error.message === 'LIMIT_REACHED') {
      return res.status(403).json({ 
        error: 'Limite de dispositivos atingido. Esta conta já está sendo acessada por 2 dispositivos simultaneamente. Por favor, saia de uma das sessões ou aguarde alguém deslogar.' 
      });
    }
    console.error('Erro no login com Google:', error);
    return res.status(500).json({ error: 'Erro interno no login com Google.' });
  }
}

