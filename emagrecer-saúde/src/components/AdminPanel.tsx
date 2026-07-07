import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ShieldAlert, ShieldCheck, RefreshCw, Eye, UserX, UserCheck, History, AlertCircle } from 'lucide-react';

interface AdminPanelProps {
  token: string;
}

interface User {
  id: number;
  nome: string;
  email: string;
  accessGranted: boolean;
  isAdmin: boolean;
  createdAt: string;
  loginLogs?: { id: number; ip: string; createdAt: string }[];
  devices?: { id: number; deviceId: string; lastActive: string }[];
}

interface AuditLog {
  id: number;
  action: string;
  details: string | null;
  createdAt: string;
  user?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}

export default function AdminPanel({ token }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Falha ao buscar usuários do painel administrativo.');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/audit-logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Falha ao carregar logs de auditoria.');
      }
      const data = await response.json();
      setAuditLogs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserAccess = async (userId: number, currentAccess: boolean) => {
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accessGranted: !currentAccess })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar acesso do usuário.');
      }

      setSuccess(data.message);
      
      // Atualiza lista local
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, accessGranted: !currentAccess } : user
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchAuditLogs();
    }
  }, [activeTab]);

  return (
    <div className="bg-white border border-brand-emerald/10 shadow-lg rounded-3xl p-6 sm:p-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-emerald/10 pb-6 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-forest">Painel de Administração</h2>
          <p className="text-xs text-brand-forest/60 font-medium mt-0.5">
            Gerenciamento de clientes, acessos Kiwify e logs de auditoria de segurança
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-brand-cream p-1 rounded-xl self-start sm:self-center shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-brand-emerald text-white shadow' : 'text-brand-forest/60'
            }`}
          >
            Clientes
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'logs' ? 'bg-brand-emerald text-white shadow' : 'text-brand-forest/60'
            }`}
          >
            Logs de Auditoria
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-emerald shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* TAB 1: CLIENTS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-forest/40" />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                className="w-full bg-brand-cream/40 border border-brand-emerald/10 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:border-brand-emerald text-brand-forest"
              />
            </div>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="bg-brand-emerald hover:bg-brand-emerald/90 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto border border-neutral-100 rounded-2xl shadow-inner bg-brand-cream/20">
            {users.length === 0 ? (
              <div className="p-12 text-center text-sm text-brand-forest/40">
                Nenhum usuário cadastrado encontrado.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-emerald/10 bg-brand-cream/50 text-brand-forest/70 font-bold">
                    <th className="p-4">Cliente</th>
                    <th className="p-4">E-mail</th>
                    <th className="p-4">Data Cadastro</th>
                    <th className="p-4">Dispositivos</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white transition-all text-brand-forest/90 font-medium">
                      <td className="p-4">
                        <div className="font-bold flex items-center gap-1.5">
                          {user.nome}
                          {user.isAdmin && (
                            <span className="text-[8px] bg-red-100 text-red-700 border border-red-200 font-extrabold px-1 rounded-md uppercase">Admin</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono">{user.email}</td>
                      <td className="p-4 text-neutral-400">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td className="p-4">
                        <span className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500 font-bold">
                          {user.devices?.length || 0}/1
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.accessGranted 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {user.accessGranted ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" /> Ativo
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3.5 h-3.5" /> Bloqueado
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleUserAccess(user.id, user.accessGranted)}
                          className={`inline-flex items-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer ${
                            user.accessGranted
                              ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {user.accessGranted ? (
                            <>
                              <UserX className="w-3.5 h-3.5" /> Bloquear
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" /> Liberar
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm text-brand-forest flex items-center gap-1.5">
              <History className="w-4 h-4 text-brand-emerald" /> Registros de Auditoria Recentes
            </h3>
            <button
              onClick={fetchAuditLogs}
              disabled={loading}
              className="text-xs font-bold text-brand-emerald hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Recarregar
            </button>
          </div>

          <div className="overflow-y-auto max-h-[450px] border border-neutral-100 rounded-2xl shadow-inner bg-brand-cream/20 font-mono text-[10px] sm:text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-12 text-center text-sm text-brand-forest/40 font-sans">
                Nenhum log de auditoria encontrado.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 sm:p-4 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-brand-emerald/10 text-brand-emerald font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
                          {log.action}
                        </span>
                        <span className="text-neutral-400 text-[10px]">
                          {new Date(log.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-neutral-600 font-sans mt-1">{log.details}</p>
                    </div>
                    {log.user && (
                      <div className="text-right shrink-0 bg-neutral-100 p-1.5 rounded-lg border border-neutral-200">
                        <span className="font-sans block font-bold text-brand-forest text-[10px] leading-tight">{log.user.nome}</span>
                        <span className="block text-[9px] text-neutral-400 font-mono leading-none mt-0.5">{log.user.email}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
