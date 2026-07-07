import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, User as UserIcon, Key, ArrowLeft, AlertCircle, CheckCircle2, Cloud } from 'lucide-react';
import { googleSignIn } from '../firebaseAuth.ts';

interface AuthScreenProps {
  onLoginSuccess: (user: any, token: string, refreshToken: string, deviceId: string) => void;
  onBackToLanding?: () => void;
}

type FormMode = 'login' | 'register' | 'create-password' | 'recover-password' | 'reset-password';

export default function AuthScreen({ onLoginSuccess, onBackToLanding }: AuthScreenProps) {
  const [mode, setMode] = useState<FormMode>('login');
  
  // Form fields
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState(''); // for reset password
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const changeMode = (newMode: FormMode) => {
    setMode(newMode);
    resetMessages();
  };

  const safeParseJSON = async (res: Response) => {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    // Se for HTML, mostra um erro mais claro de comunicação ou indisponibilidade
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      throw new Error('Servidor temporariamente indisponível ou em manutenção (Erro 500/502/HTML).');
    }
    throw new Error(text.substring(0, 150) || 'Resposta inválida do servidor.');
  };

  // 1. LOGIN COM E-MAIL E SENHA
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('E-mail e senha são obrigatórios.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          deviceId: localStorage.getItem('emagrecer_saude_device_id') || undefined
        })
      });

      const data = await safeParseJSON(response);

      if (!response.ok) {
        if (data.needsPasswordSetup) {
          setError('Sua compra foi aprovada! Por favor, use a opção "Primeiro Acesso" abaixo para definir sua senha.');
          setMode('create-password');
          return;
        }
        throw new Error(data.error || 'Erro ao realizar login.');
      }

      onLoginSuccess(data.user, data.accessToken, data.refreshToken, data.deviceId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. CADASTRO DE NOVO USUÁRIO (Pendente de liberação Kiwify)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !password) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password })
      });

      const data = await safeParseJSON(response);

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar cadastro.');
      }

      setSuccess(data.message || 'Cadastro efetuado! Liberação pendente.');
      // Limpa campos
      setNome('');
      setPassword('');
      setMode('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. PRIMEIRO ACESSO (Definição de senha pós-compra Kiwify)
  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const response = await fetch('/api/create-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await safeParseJSON(response);

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar senha.');
      }

      setSuccess(data.message || 'Senha cadastrada com sucesso! Faça login abaixo.');
      setMode('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. SOLICITAR RECUPERAÇÃO DE SENHA
  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('E-mail é obrigatório.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const response = await fetch('/api/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await safeParseJSON(response);

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao solicitar recuperação.');
      }

      setSuccess(data.message || 'Instruções enviadas para o seu e-mail.');
      if (data.resetLink) {
        console.log('[RESET LINK LOCAL]:', data.resetLink);
        setSuccess(`[DEV MODE] Token simulado copiado no console. Link de reset: ${data.resetLink}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. EFETUAR RESET DE SENHA COM TOKEN
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !password) {
      setError('Token e nova senha são obrigatórios.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });

      const data = await safeParseJSON(response);

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha.');
      }

      setSuccess(data.message || 'Senha redefinida com sucesso! Faça login.');
      setMode('login');
      setToken('');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. LOGIN COM GOOGLE (Integração com Firebase client-side + backend JWT validation)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    resetMessages();

    try {
      const result = await googleSignIn();
      if (!result) {
        throw new Error('Login com Google cancelado ou falhou.');
      }

      const { user, accessToken: googleAccessToken } = result;

      // Envia os dados do usuário Google para sincronizar com nosso backend
      const response = await fetch('/api/login-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          nome: user.displayName || 'Cliente Google',
          googleUid: user.uid,
          deviceId: localStorage.getItem('emagrecer_saude_device_id') || undefined
        })
      });

      const data = await safeParseJSON(response);

      if (!response.ok) {
        throw new Error(data.error || 'Seu e-mail Google não está autorizado ou ocorreu um erro.');
      }

      onLoginSuccess(data.user, data.accessToken, data.refreshToken, data.deviceId);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao fazer login com Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center font-sans relative">
      
      {/* Back to landing button */}
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="absolute top-6 left-6 inline-flex items-center gap-1.5 py-2 px-3.5 bg-white border border-brand-emerald/15 hover:bg-brand-cream text-brand-forest font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-brand-emerald" />
          Voltar para o Site
        </button>
      )}
      
      {/* Header Info */}
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-brand-emerald text-white rounded-2xl shadow-lg font-black text-xl mb-3">
          ES
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-brand-forest tracking-tight">
          Emagrecer Saúde <span className="text-brand-sunset text-xs uppercase px-1.5 py-0.5 font-bold bg-brand-sunset/10 rounded ml-1">Premium</span>
        </h1>
        <p className="text-xs sm:text-sm text-brand-forest/70 font-medium mt-1 max-w-sm sm:max-w-md mx-auto">
          Portal Exclusivo para Alunos e Compradores da Kiwify
        </p>
      </div>

      {/* Main card */}
      <motion.div 
        layout
        className="bg-white border border-brand-emerald/10 shadow-xl rounded-3xl p-6 sm:p-8 w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {/* 1. Alerts */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-brand-emerald" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* 2. Form Rendering according to mode */}
          {mode === 'login' && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-xl font-extrabold text-brand-forest mb-4">Acesse sua conta</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-forest/70 mb-1">E-MAIL</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-brand-forest/40" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full bg-brand-cream/50 border border-brand-emerald/10 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:border-brand-emerald"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-brand-forest/70">SENHA</label>
                    <button 
                      type="button"
                      onClick={() => changeMode('recover-password')}
                      className="text-[10px] font-bold text-brand-emerald hover:underline cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-brand-forest/40" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha secreta"
                      className="w-full bg-brand-cream/50 border border-brand-emerald/10 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:border-brand-emerald"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Carregando...' : 'Entrar'}
                </button>
              </form>

              {/* Separator */}
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-brand-emerald/10"></div>
                <span className="flex-shrink mx-4 text-[10px] text-brand-forest/40 font-bold">OU</span>
                <div className="flex-grow border-t border-brand-emerald/10"></div>
              </div>

              {/* Google login Button */}
              <button 
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Cloud className="w-4 h-4 text-sky-500" />
                Acessar com Google
              </button>

              {/* Bottom helpers */}
              <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col gap-2.5 text-center text-xs">
                <p className="text-neutral-500">
                  Comprou pela Kiwify e é seu primeiro acesso?
                </p>
                <button 
                  onClick={() => changeMode('create-password')}
                  className="text-brand-emerald font-extrabold hover:underline cursor-pointer self-center text-xs flex items-center gap-1"
                >
                  <Key className="w-3.5 h-3.5" /> Ativar Minha Conta (Primeiro Acesso)
                </button>
                <div className="text-neutral-400 text-[10px] mt-2">
                  Não possui acesso? <button onClick={() => changeMode('register')} className="text-brand-sunset font-bold hover:underline cursor-pointer">Crie uma conta temporária</button>
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'register' && (
            <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => changeMode('login')} className="p-1 hover:bg-brand-cream rounded-lg cursor-pointer">
                  <ArrowLeft className="w-4 h-4 text-brand-forest" />
                </button>
                <h2 className="text-xl font-extrabold text-brand-forest">Cadastrar conta</h2>
              </div>
              <p className="text-[10px] sm:text-xs text-brand-forest/60 mb-4 bg-brand-cream/50 p-2.5 rounded-xl border border-brand-emerald/5">
                Nota: Contas criadas manualmente estarão no modo de avaliação e exigirão ativação administrativa ou compra para liberar todo o conteúdo.
              </p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-forest/70 mb-1">NOME COMPLETO</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-brand-forest/40" />
                    <input 
                      type="text" 
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full bg-brand-cream/50 border border-brand-emerald/10 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:border-brand-emerald"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-forest/70 mb-1">E-MAIL</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-brand-forest/40" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full bg-brand-cream/50 border border-brand-emerald/10 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:border-brand-emerald"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-forest/70 mb-1">CRIAR SENHA</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-brand-forest/40" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-brand-cream/50 border border-brand-emerald/10 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:border-brand-emerald"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Conta'}
                </button>
              </form>
            </motion.div>
          )}

          {mode === 'create-password' && (
            <motion.div key="create-password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => changeMode('login')} className="p-1 hover:bg-brand-cream rounded-lg cursor-pointer">
                  <ArrowLeft className="w-4 h-4 text-brand-forest" />
                </button>
                <h2 className="text-xl font-extrabold text-brand-forest">Primeiro Acesso</h2>
              </div>
              <p className="text-[10px] sm:text-xs text-brand-forest/60 mb-4 bg-brand-cream/50 p-2.5 rounded-xl border border-brand-emerald/5">
                Se você já comprou o guia pela Kiwify, insira o mesmo e-mail usado na compra para definir sua primeira senha de login.
              </p>
              <form onSubmit={handleCreatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-forest/70 mb-1">E-MAIL DA COMPRA</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-brand-forest/40" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@compra.com"
                      className="w-full bg-brand-cream/50 border border-brand-emerald/10 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:border-brand-emerald"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-forest/70 mb-1">DEFINIR NOVA SENHA</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-brand-forest/40" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-brand-cream/50 border border-brand-emerald/10 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:border-brand-emerald"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-forest/70 mb-1">CONFIRMAR SENHA</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-brand-forest/40" />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-brand-cream/50 border border-brand-emerald/10 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:border-brand-emerald"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Cadastrando Senha...' : 'Criar Senha e Ativar'}
                </button>
              </form>
            </motion.div>
          )}

          {mode === 'recover-password' && (
            <motion.div key="recover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => changeMode('login')} className="p-1 hover:bg-brand-cream rounded-lg cursor-pointer">
                  <ArrowLeft className="w-4 h-4 text-brand-forest" />
                </button>
                <h2 className="text-xl font-extrabold text-brand-forest">Recuperar senha</h2>
              </div>
              <p className="text-[10px] sm:text-xs text-brand-forest/60 mb-4">
                Forneça o seu e-mail cadastrado. Um link de redefinição de senha será gerado para que você possa redefinir sua credencial.
              </p>
              <form onSubmit={handleRecoverPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-forest/70 mb-1">SEU E-MAIL</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-brand-forest/40" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full bg-brand-cream/50 border border-brand-emerald/10 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:border-brand-emerald"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Enviar Link de Recuperação'}
                </button>

                <div className="text-center mt-3">
                  <button 
                    type="button" 
                    onClick={() => changeMode('reset-password')}
                    className="text-xs font-bold text-brand-sunset hover:underline cursor-pointer"
                  >
                    Já possui um Token? Redefinir senha aqui
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {mode === 'reset-password' && (
            <motion.div key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => changeMode('login')} className="p-1 hover:bg-brand-cream rounded-lg cursor-pointer">
                  <ArrowLeft className="w-4 h-4 text-brand-forest" />
                </button>
                <h2 className="text-xl font-extrabold text-brand-forest">Redefinir Senha</h2>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-forest/70 mb-1">TOKEN DE RECUPERAÇÃO</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-brand-forest/40" />
                    <input 
                      type="text" 
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Cole o token JWT de reset aqui"
                      className="w-full bg-brand-cream/50 border border-brand-emerald/10 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:border-brand-emerald"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-forest/70 mb-1">NOVA SENHA</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-brand-forest/40" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nova senha com 6+ caracteres"
                      className="w-full bg-brand-cream/50 border border-brand-emerald/10 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:border-brand-emerald"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Redefinindo...' : 'Atualizar Minha Senha'}
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      {/* Safety Info */}
      <p className="text-[10px] text-brand-forest/50 mt-8 max-w-xs text-center leading-normal">
        Protegido por criptografia robusta. Limitado a um dispositivo ativo por acesso para proteção de pirataria.
      </p>
    </div>
  );
}
