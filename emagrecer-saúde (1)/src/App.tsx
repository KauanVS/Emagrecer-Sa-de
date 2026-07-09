import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Calculator, 
  Apple, 
  Dumbbell, 
  BarChart3, 
  AlertTriangle, 
  Cloud, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon 
} from 'lucide-react';
import BookReader from './components/BookReader';
import CalorieTool from './components/CalorieTool';
import PlateTool from './components/PlateTool';
import WorkoutTool from './components/WorkoutTool';
import ProgressTool from './components/ProgressTool';
import GoogleSyncTool from './components/GoogleSyncTool';
import AuthScreen from './components/AuthScreen';
import AdminPanel from './components/AdminPanel';
import LandingPage from './components/LandingPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'reader' | 'calories' | 'plate' | 'workouts' | 'progress' | 'sync' | 'admin'>('reader');
  const [showAuth, setShowAuth] = useState(false);
  
  // Auth States
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // 1. Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('emagrecer_saude_token');
      const storedRefreshToken = localStorage.getItem('emagrecer_saude_refresh_token');
      
      if (!storedToken) {
        setAuthChecking(false);
        return;
      }

      try {
        // Tenta buscar o perfil do usuário usando o token atual
        const response = await fetch('/api/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(storedToken);
        } else if (response.status === 401 && storedRefreshToken) {
          // Token pode estar expirado. Tenta renovar com o Refresh Token.
          const refreshRes = await fetch('/api/refresh-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: storedRefreshToken })
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            localStorage.setItem('emagrecer_saude_token', refreshData.accessToken);
            
            // Refaz o fetch do usuário com o novo token
            const retryProfile = await fetch('/api/me', {
              headers: {
                'Authorization': `Bearer ${refreshData.accessToken}`
              }
            });

            if (retryProfile.ok) {
              const retryUserData = await retryProfile.json();
              setUser(retryUserData);
              setToken(refreshData.accessToken);
            } else {
              handleLogout();
            }
          } else {
            handleLogout();
          }
        } else {
          handleLogout();
        }
      } catch (err) {
        console.error('Erro de rede na autenticação inicial:', err);
      } finally {
        setAuthChecking(false);
      }
    };

    // Garante um Device ID único no localStorage caso não exista para controle de 1 dispositivo
    if (!localStorage.getItem('emagrecer_saude_device_id')) {
      const randomId = `dev_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('emagrecer_saude_device_id', randomId);
    }

    checkAuth();
  }, []);

  // Handler para login bem-sucedido
  const handleLoginSuccess = (userData: any, accessToken: string, refreshToken: string, deviceId: string) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('emagrecer_saude_token', accessToken);
    localStorage.setItem('emagrecer_saude_refresh_token', refreshToken);
    localStorage.setItem('emagrecer_saude_device_id', deviceId);
  };

  // Handler para logout
  const handleLogout = async () => {
    const deviceId = localStorage.getItem('emagrecer_saude_device_id');
    try {
      if (token) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId })
        });
      }
    } catch (e) {
      console.error('Erro de rede ao efetuar logout:', e);
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem('emagrecer_saude_token');
    localStorage.removeItem('emagrecer_saude_refresh_token');
    setActiveTab('reader');
    setShowAuth(false);
  };

  // Loading Screen
  if (authChecking) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center font-sans">
        <div className="p-3 bg-brand-emerald text-white rounded-2xl shadow-md font-black text-xl mb-4 animate-bounce">
          ES
        </div>
        <p className="text-sm font-bold text-brand-forest/70">Carregando portal do aluno...</p>
      </div>
    );
  }

  // Auth Guard
  if (!user || !token) {
    if (showAuth) {
      return (
        <AuthScreen 
          onLoginSuccess={handleLoginSuccess} 
          onBackToLanding={() => setShowAuth(false)} 
        />
      );
    }
    return (
      <LandingPage onGoToAuth={() => setShowAuth(true)} />
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-forest font-sans flex flex-col selection:bg-brand-emerald/20 selection:text-brand-forest">
      
      {/* Top Banner Warning (Health Disclaimer - critical for safety!) */}
      <div className="bg-amber-50 border-b border-brand-emerald/10 py-2 px-3 text-center print:hidden flex items-center justify-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-brand-sunset shrink-0" />
        <span className="text-[10px] sm:text-xs text-brand-forest font-semibold leading-tight">
          <strong>Aviso importante:</strong> Este guia interativo tem caráter educativo. Consulte sempre um médico ou nutricionista.
        </span>
      </div>

      {/* Main Header Container */}
      <header className="bg-white border-b border-brand-emerald/10 sticky top-0 z-30 print:hidden shadow-sm" id="app-chrome-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-emerald text-white rounded-xl shadow-md shrink-0 font-bold text-sm">
              ES
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="font-sans text-lg sm:text-2xl font-black tracking-tight text-brand-forest leading-none">
                  Emagrecer Saúde
                </h1>
                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-brand-sunset text-white px-1.5 py-0.5 rounded border border-brand-sunset leading-none">
                  Premium
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-brand-forest/70 font-medium mt-0.5 max-w-sm sm:max-w-md leading-tight">
                O guia completo e prático para perder peso com saúde, equilíbrio e consistência
              </p>
            </div>
          </div>

          {/* User info and Logout section */}
          <div className="flex items-center gap-3 bg-brand-cream border border-brand-emerald/10 px-3 py-1.5 rounded-xl md:self-center self-start shrink-0">
            <div className="text-left flex items-center gap-2">
              <div className="p-1.5 bg-brand-emerald/10 rounded-lg text-brand-emerald">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] text-brand-emerald font-bold uppercase block tracking-wider leading-none">Aluno Conectado</span>
                <span className="text-[10px] sm:text-xs font-bold text-brand-forest mt-0.5 block leading-none">
                  {user.nome}
                </span>
              </div>
            </div>
            <div className="border-l border-brand-emerald/10 pl-2">
              <button 
                onClick={handleLogout}
                className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all cursor-pointer flex items-center justify-center"
                title="Sair da Conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-brand-emerald/10 sticky top-[77px] z-25 print:hidden" id="app-chrome-tabs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar">
            
            {/* Tab: Leitura do Livro */}
            <button
              onClick={() => setActiveTab('reader')}
              className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'reader'
                  ? 'bg-brand-emerald text-white shadow-sm'
                  : 'text-brand-forest/70 hover:text-brand-forest hover:bg-brand-cream'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Livro Completo
            </button>

            {/* Tab: Calculadora de Calorias */}
            <button
              onClick={() => setActiveTab('calories')}
              className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'calories'
                  ? 'bg-brand-emerald text-white shadow-sm'
                  : 'text-brand-forest/70 hover:text-brand-forest hover:bg-brand-cream'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Calculadora TMB/VET
            </button>

            {/* Tab: Montador de Prato */}
            <button
              onClick={() => setActiveTab('plate')}
              className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'plate'
                  ? 'bg-brand-emerald text-white shadow-sm'
                  : 'text-brand-forest/70 hover:text-brand-forest hover:bg-brand-cream'
              }`}
            >
              <Apple className="w-4 h-4" />
              Montar Prato Saudável
            </button>

            {/* Tab: Fichas de Treino */}
            <button
              onClick={() => setActiveTab('workouts')}
              className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'workouts'
                  ? 'bg-brand-emerald text-white shadow-sm'
                  : 'text-brand-forest/70 hover:text-brand-forest hover:bg-brand-cream'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              Fichas de Treino
            </button>

            {/* Tab: Diário de Progresso */}
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'progress'
                  ? 'bg-brand-emerald text-white shadow-sm'
                  : 'text-brand-forest/70 hover:text-brand-forest hover:bg-brand-cream'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Diário de Medidas
            </button>

            {/* Tab: Google Sync */}
            <button
              onClick={() => setActiveTab('sync')}
              className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'sync'
                  ? 'bg-brand-emerald text-white shadow-sm'
                  : 'text-brand-forest/70 hover:text-brand-forest hover:bg-brand-cream'
              }`}
            >
              <Cloud className="w-4 h-4" />
              Conexão Google
            </button>

            {/* Admin Panel Tab (Visible only to Administrators) */}
            {user.isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-brand-sunset text-white shadow-sm'
                    : 'text-brand-sunset/80 hover:text-brand-sunset hover:bg-brand-cream'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Painel Admin
              </button>
            )}

          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            {activeTab === 'reader' && <BookReader />}
            {activeTab === 'calories' && <CalorieTool />}
            {activeTab === 'plate' && <PlateTool />}
            {activeTab === 'workouts' && <WorkoutTool />}
            {activeTab === 'progress' && <ProgressTool />}
            {activeTab === 'sync' && <GoogleSyncTool />}
            {activeTab === 'admin' && user.isAdmin && <AdminPanel token={token} />}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Footer (disclaimer and copyright) */}
      <footer className="bg-white border-t border-neutral-200 py-6 mt-12 text-center text-xs text-neutral-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-serif italic font-semibold text-neutral-600">
            "Sua saúde é o seu maior patrimônio. Cuide dela com carinho, equilíbrio e consistência."
          </p>
          <p>© 2026 Emagrecer Saúde. Todos os direitos reservados. Feito com amor e rigor científico.</p>
        </div>
      </footer>

    </div>
  );
}
