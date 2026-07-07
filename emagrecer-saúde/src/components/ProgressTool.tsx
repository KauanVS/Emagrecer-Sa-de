import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sparkles, Trash2, Calendar, Smile, Plus, ClipboardList } from 'lucide-react';
import { ProgressLog } from '../types';

const INITIAL_MOCK_LOGS: ProgressLog[] = [
  { id: '1', date: '2026-05-15', weight: 82.0, waist: 96, mood: 'neutral', notes: 'Iniciei a reeducação hoje. Sinto-me motivado, mas um pouco ansioso.' },
  { id: '2', date: '2026-05-22', weight: 81.2, waist: 95, mood: 'good', notes: 'Primeira semana concluída. Bati a meta de água e caminhei 3 vezes!' },
  { id: '3', date: '2026-05-29', weight: 80.5, waist: 93, mood: 'excellent', notes: 'Sinto as roupas mais folgadas na cintura. Energia excelente para os treinos.' },
  { id: '4', date: '2026-06-05', weight: 80.1, waist: 93, mood: 'neutral', notes: 'Peso estabilizou um pouco, mas sei que faz parte da adaptação metabólica.' },
  { id: '5', date: '2026-06-12', weight: 79.4, waist: 91, mood: 'good', notes: 'Voltou a cair. Rompi a barreira dos 80kg! Treino de pernas foi intenso.' },
  { id: '6', date: '2026-06-19', weight: 78.6, waist: 89, mood: 'excellent', notes: 'Autoestima lá em cima. Consigo correr 10 minutos seguidos sem cansaço.' },
];

export default function ProgressTool() {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [weightInput, setWeightInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [moodInput, setMoodInput] = useState<'excellent' | 'good' | 'neutral' | 'struggling'>('good');
  const [notesInput, setNotesInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().substring(0, 10));

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('emagrecer_saude_logs');
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        setLogs(INITIAL_MOCK_LOGS);
      }
    } else {
      setLogs(INITIAL_MOCK_LOGS);
      localStorage.setItem('emagrecer_saude_logs', JSON.stringify(INITIAL_MOCK_LOGS));
    }
  }, []);

  const saveLogsToStorage = (updated: ProgressLog[]) => {
    setLogs(updated);
    localStorage.setItem('emagrecer_saude_logs', JSON.stringify(updated));
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    const waist = parseInt(waistInput);

    if (isNaN(w) || isNaN(waist)) {
      alert('Por favor, digite números válidos para peso e medidas.');
      return;
    }

    const newLog: ProgressLog = {
      id: Date.now().toString(),
      date: dateInput,
      weight: w,
      waist: waist,
      mood: moodInput,
      notes: notesInput,
    };

    // Keep logs sorted chronologically
    const updated = [...logs, newLog].sort((a, b) => a.date.localeCompare(b.date));
    saveLogsToStorage(updated);

    // Reset inputs
    setWeightInput('');
    setWaistInput('');
    setNotesInput('');
  };

  const handleDeleteLog = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este registro do diário?')) {
      const filtered = logs.filter((l) => l.id !== id);
      saveLogsToStorage(filtered);
    }
  };

  const getMoodEmoji = (mood: ProgressLog['mood']) => {
    switch (mood) {
      case 'excellent': return '🤩';
      case 'good': return '😊';
      case 'neutral': return '😐';
      case 'struggling': return '🥺';
    }
  };

  // Prepare chart data format
  const chartData = logs.map((log) => ({
    name: new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    peso: log.weight,
    cintura: log.waist,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-brand-forest animate-fade-in"
      id="progress-tool-container"
    >
      {/* Form Log Submitter */}
      <div className="lg:col-span-5 bg-white border border-brand-emerald/10 rounded-2xl p-6 shadow-sm">
        <h3 className="font-sans text-lg font-bold mb-4 flex items-center gap-2 text-brand-forest">
          <Plus className="w-5 h-5 text-brand-emerald" />
          Novo Registro Diário
        </h3>

        <form onSubmit={handleAddLog} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Peso */}
            <div>
              <label className="block text-xs font-bold text-brand-forest/70 mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ex: 72.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full bg-white border border-brand-emerald/10 rounded-xl p-2.5 text-sm outline-none focus:border-brand-emerald transition-all font-semibold"
                required
              />
            </div>
            {/* Cintura */}
            <div>
              <label className="block text-xs font-bold text-brand-forest/70 mb-1">Cintura (cm)</label>
              <input
                type="number"
                placeholder="Ex: 84"
                value={waistInput}
                onChange={(e) => setWaistInput(e.target.value)}
                className="w-full bg-white border border-brand-emerald/10 rounded-xl p-2.5 text-sm outline-none focus:border-brand-emerald transition-all font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Data */}
            <div>
              <label className="block text-xs font-bold text-brand-forest/70 mb-1">Data</label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full bg-white border border-brand-emerald/10 rounded-xl p-2.5 text-xs outline-none focus:border-brand-emerald font-mono font-bold"
                required
              />
            </div>
            {/* Humor */}
            <div>
              <label className="block text-xs font-bold text-brand-forest/70 mb-1">Humor/Disposição</label>
              <select
                value={moodInput}
                onChange={(e) => setMoodInput(e.target.value as any)}
                className="w-full bg-white border border-brand-emerald/10 rounded-xl p-2.5 text-sm outline-none focus:border-brand-emerald cursor-pointer font-bold"
              >
                <option value="excellent">🤩 Excelente</option>
                <option value="good">😊 Bom</option>
                <option value="neutral">😐 Neutro</option>
                <option value="struggling">🥺 Difícil</option>
              </select>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold text-brand-forest/70 mb-1">Notas / Como foi o dia?</label>
            <textarea
              rows={3}
              placeholder="Treinei hoje? Tomei água? Sentiu fome emocional?"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className="w-full bg-white border border-brand-emerald/10 rounded-xl p-2.5 text-xs outline-none focus:border-brand-emerald transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-brand-emerald hover:bg-brand-emerald/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            Adicionar Registro
          </button>
        </form>
      </div>

      {/* Graphs View */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-white border border-brand-emerald/10 rounded-2xl p-5 shadow-sm flex-1">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-sans text-lg font-bold text-brand-forest">Gráfico de Evolução</h3>
              <p className="text-xs text-brand-forest/60">Curvas de perda de peso e circunferência abdominal</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-brand-emerald">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald"></span>
                Peso (kg)
              </span>
              <span className="flex items-center gap-1.5 font-bold text-brand-sunset">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-sunset"></span>
                Cintura (cm)
              </span>
            </div>
          </div>

          <div className="w-full h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f6ee" />
                <XAxis dataKey="name" stroke="#a3a3a3" fontSize={10} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#a3a3a3" fontSize={10} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="peso" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="cintura" stroke="#FF8C42" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* History Log List */}
      <div className="lg:col-span-12 bg-white border border-brand-emerald/10 rounded-2xl p-6 shadow-sm">
        <h3 className="font-sans text-lg font-bold mb-4 flex items-center gap-2 text-brand-forest">
          <Calendar className="w-5 h-5 text-brand-sunset" />
          Histórico do Diário de Medidas
        </h3>

        {logs.length === 0 ? (
          <p className="text-sm text-brand-forest/60 text-center py-6">Nenhum registro encontrado. Crie um acima!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-emerald/10 bg-brand-cream/50 text-brand-forest/75 font-bold uppercase tracking-wider">
                  <th className="p-3">Data</th>
                  <th className="p-3">Peso</th>
                  <th className="p-3">Cintura</th>
                  <th className="p-3 text-center">Humor</th>
                  <th className="p-3">Notas</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-emerald/5">
                {logs.slice().reverse().map((log) => (
                  <tr key={log.id} className="hover:bg-brand-cream/30 transition-colors text-brand-forest">
                    <td className="p-3 font-mono text-brand-forest/80">
                      {new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 font-bold text-brand-forest">{log.weight.toFixed(1)} kg</td>
                    <td className="p-3 font-semibold text-brand-forest/90">{log.waist} cm</td>
                    <td className="p-3 text-center text-lg">{getMoodEmoji(log.mood)}</td>
                    <td className="p-3 text-brand-forest/60 italic max-w-sm truncate" title={log.notes}>
                      {log.notes || <span className="text-neutral-350">Sem observações.</span>}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
