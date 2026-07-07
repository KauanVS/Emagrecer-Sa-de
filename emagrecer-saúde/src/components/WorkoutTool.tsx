import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Dumbbell, Home, Landmark, CheckCircle, Timer } from 'lucide-react';

interface Exercise {
  name: string;
  instructions: string;
  sets: number;
  repsOrTime: string;
  timerDuration?: number; // seconds
}

interface WorkoutRoutine {
  title: string;
  description: string;
  exercises: Exercise[];
}

const ROUTINES: Record<string, Record<string, WorkoutRoutine>> = {
  casa: {
    iniciante: {
      title: 'Rotina Corporal Iniciante (Casa)',
      description: 'Uma rotina focada em acordar a musculatura de forma segura.',
      exercises: [
        { name: 'Agachamento Livre na Cadeira', instructions: 'Agache devagar jogando os quadris para trás até tocar a cadeira e levante.', sets: 3, repsOrTime: '12-15 reps', timerDuration: 45 },
        { name: 'Flexão de Braço na Parede', instructions: 'Flexione os cotovelos contra a parede mantendo o abdômen firme.', sets: 3, repsOrTime: '10-12 reps', timerDuration: 45 },
        { name: 'Elevação Pélvica (Ponte)', instructions: 'Deitado, contraia os glúteos e eleve os quadris em direção ao teto.', sets: 3, repsOrTime: '15 reps', timerDuration: 45 },
        { name: 'Prancha Isométrica', instructions: 'Sustente o corpo alinhado apoiando apenas antebraços e pontas dos pés.', sets: 3, repsOrTime: '20-30 seg', timerDuration: 30 },
      ],
    },
    intermediario: {
      title: 'Rotina de Intensidade Intermediária (Casa)',
      description: 'Introdução de exercícios unilaterais e menor intervalo.',
      exercises: [
        { name: 'Afundo Alternado (Passada)', instructions: 'Dê um passo longo à frente e desça o quadril a 90 graus. Alterne pernas.', sets: 4, repsOrTime: '10 reps/perna', timerDuration: 45 },
        { name: 'Flexão de Joelhos no Chão', instructions: 'Apoie mãos e joelhos no chão e desça o tronco de forma controlada.', sets: 4, repsOrTime: '8-12 reps', timerDuration: 45 },
        { name: 'Agachamento Sumô', instructions: 'Afaste pés, aponte pontas dos pés para fora e agache profundamente.', sets: 4, repsOrTime: '15 reps', timerDuration: 45 },
        { name: 'Tríceps Banco (Cadeira)', instructions: 'Apoie mãos na borda traseira da cadeira, flexione cotovelos descendo o quadril.', sets: 4, repsOrTime: '12 reps', timerDuration: 45 },
        { name: 'Abdominal Remador', instructions: 'Deitado de costas, flexione joelhos e sente-se abraçando as pernas simultaneamente.', sets: 4, repsOrTime: '15 reps', timerDuration: 30 },
      ],
    },
    avancado: {
      title: 'Circuito Queima Total AMRAP (Casa)',
      description: 'Duração total de 20 minutos. Complete o circuito o máximo de vezes possível.',
      exercises: [
        { name: 'Burpees Completos', instructions: 'Agache, flexão no chão, levante-se explosivamente com um salto.', sets: 4, repsOrTime: '10 reps', timerDuration: 60 },
        { name: 'Agachamento com Salto', instructions: 'Agache livre e salte de forma explosiva amortecendo a queda.', sets: 4, repsOrTime: '15 reps', timerDuration: 45 },
        { name: 'Flexão de Braço Padrão', instructions: 'Prancha corporal completa e flexão tradicional de peitoral.', sets: 4, repsOrTime: '12 reps', timerDuration: 45 },
        { name: 'Agachamento Búlgaro', instructions: 'Pé apoiado atrás na cadeira, agache com a perna dianteira.', sets: 3, repsOrTime: '10 reps/perna', timerDuration: 45 },
        { name: 'Polichinelos Rápidos', instructions: 'Ritmo intenso para manter batimentos altos.', sets: 4, repsOrTime: '40 reps', timerDuration: 30 },
      ],
    },
  },
  academia: {
    iniciante: {
      title: 'Rotina de Adaptação Full Body (Academia)',
      description: 'Aprendizado dos movimentos básicos e ativação de força.',
      exercises: [
        { name: 'Leg Press 45°', instructions: 'Apoie pés na largura dos ombros, flexione joelhos até 90 graus e empurre.', sets: 3, repsOrTime: '12 reps', timerDuration: 60 },
        { name: 'Puxada Aberta Pulley Costas', instructions: 'Puxe a barra em direção ao peito, espremendo as escápulas.', sets: 3, repsOrTime: '12 reps', timerDuration: 60 },
        { name: 'Supino Vertical Máquina', instructions: 'Empurre os manípulos contraindo o peitoral, retorne devagar.', sets: 3, repsOrTime: '12 reps', timerDuration: 60 },
        { name: 'Cadeira Extensora', instructions: 'Estenda os joelhos sustentando 1 segundo na contração máxima.', sets: 3, repsOrTime: '15 reps', timerDuration: 60 },
      ],
    },
    intermediario: {
      title: 'Divisão Membros Superiores/Inferiores (Academia)',
      description: 'Foco na hipertrofia com pesos livres estruturados.',
      exercises: [
        { name: 'Agachamento Livre Barra', instructions: 'Mantenha a coluna reta e desça os quadris abaixo da linha dos joelhos.', sets: 4, repsOrTime: '10 reps', timerDuration: 90 },
        { name: 'Supino Reto com Halteres', instructions: 'Excelente para estabilização de ombro e peitoral.', sets: 4, repsOrTime: '10 reps', timerDuration: 75 },
        { name: 'Stiff com Halteres', instructions: 'Desça o tronco com pernas semiestendidas, sentindo os glúteos.', sets: 3, repsOrTime: '12 reps', timerDuration: 75 },
        { name: 'Remada Baixa Triângulo', instructions: 'Puxe o triângulo rente à barriga mantendo as costas eretas.', sets: 4, repsOrTime: '10 reps', timerDuration: 60 },
      ],
    },
    avancado: {
      title: 'Treino de Pernas de Alta Densidade (Academia)',
      description: 'Séries avançadas utilizando técnicas de esgotamento e falha.',
      exercises: [
        { name: 'Agachamento Livre Barra', instructions: 'Pirâmide progressiva com foco em profundidade.', sets: 4, repsOrTime: '8-10 reps', timerDuration: 120 },
        { name: 'Leg Press 45° (Drop Set)', instructions: 'Faça 12 repetições, reduza peso 30% e faça até a falha sem descanso.', sets: 4, repsOrTime: '12 + Drop', timerDuration: 90 },
        { name: 'Stiff com Barra Lento', instructions: 'Foco extremo na cadência da descida (excêntrica de 4 segundos).', sets: 4, repsOrTime: '10 reps', timerDuration: 75 },
        { name: 'Cadeira Extensora Isométrica', instructions: 'Estenda e segure 3 segundos no pico de contração em cada rep.', sets: 3, repsOrTime: '10 reps', timerDuration: 60 },
      ],
    },
  },
};

export default function WorkoutTool() {
  const [environment, setEnvironment] = useState<'casa' | 'academia'>('casa');
  const [level, setLevel] = useState<'iniciante' | 'intermediario' | 'avancado'>('iniciante');

  const [activeExerciseIdx, setActiveExerciseIdx] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});

  const selectedRoutine = ROUTINES[environment][level];

  useEffect(() => {
    // Reset completed exercises when changing routine
    setCompletedExercises({});
    setActiveExerciseIdx(null);
    setTimerRunning(false);
    localStorage.setItem('emagrecer_saude_workout_env', environment);
    localStorage.setItem('emagrecer_saude_workout_level', level);
  }, [environment, level]);

  useEffect(() => {
    let timer: any;
    if (timerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      // Play a simple visual pulse, or we could add a beep sound
    }
    return () => clearInterval(timer);
  }, [timerRunning, timeLeft]);

  const handleStartTimer = (exerciseIdx: number, duration: number) => {
    setActiveExerciseIdx(exerciseIdx);
    setTimeLeft(duration);
    setTimerRunning(true);
  };

  const handleTogglePlay = () => {
    setTimerRunning(!timerRunning);
  };

  const handleResetTimer = () => {
    if (activeExerciseIdx !== null) {
      const duration = selectedRoutine.exercises[activeExerciseIdx].timerDuration || 45;
      setTimeLeft(duration);
      setTimerRunning(false);
    }
  };

  const handleToggleCompleted = (idx: number) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-brand-forest"
      id="workout-tool-container"
    >
      {/* Settings Selection */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        <div className="bg-white border border-brand-emerald/10 rounded-2xl p-5 shadow-sm">
          <h3 className="font-sans text-lg font-bold mb-4 flex items-center gap-2 text-brand-forest">
            <Timer className="w-5 h-5 text-brand-emerald" />
            Configurar Ficha
          </h3>

          {/* Ambiente */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-brand-forest/60 uppercase tracking-wider mb-2">Ambiente de Treino</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setEnvironment('casa')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  environment === 'casa'
                    ? 'border-brand-emerald bg-brand-emerald/10 text-brand-forest font-extrabold shadow-sm'
                    : 'border-brand-emerald/10 text-brand-forest/70 hover:bg-brand-cream/50'
                }`}
              >
                <Home className="w-4 h-4" />
                Em Casa
              </button>
              <button
                onClick={() => setEnvironment('academia')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  environment === 'academia'
                    ? 'border-brand-emerald bg-brand-emerald/10 text-brand-forest font-extrabold shadow-sm'
                    : 'border-brand-emerald/10 text-brand-forest/70 hover:bg-brand-cream/50'
                }`}
              >
                <Landmark className="w-4 h-4" />
                Na Academia
              </button>
            </div>
          </div>

          {/* Nível */}
          <div>
            <label className="block text-xs font-bold text-brand-forest/60 uppercase tracking-wider mb-2">Nível Técnico</label>
            <div className="space-y-2">
              {(['iniciante', 'intermediario', 'avancado'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs text-left font-bold border transition-all capitalize cursor-pointer flex items-center justify-between ${
                    level === lvl
                      ? 'border-brand-emerald bg-brand-emerald/10 text-brand-forest font-extrabold'
                      : 'border-brand-emerald/10 text-brand-forest/70 hover:bg-brand-cream/50'
                  }`}
                >
                  <span>{lvl === 'intermediario' ? 'Intermediário' : lvl === 'avancado' ? 'Avançado' : 'Iniciante'}</span>
                  {level === lvl && <div className="w-2.5 h-2.5 rounded-full bg-brand-emerald"></div>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Timer Console */}
        {activeExerciseIdx !== null && (
          <div className="bg-brand-forest text-brand-cream rounded-2xl p-6 shadow-md relative overflow-hidden">
            {/* Pulsing decorative circle during countdown */}
            {timerRunning && (
              <motion.div 
                animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-brand-emerald/20"
              />
            )}

            <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-cream/60 block">
              Cronômetro de Descanso/Ação
            </span>
            <div className="text-xs font-black text-brand-sunset mt-1 truncate">
              {selectedRoutine.exercises[activeExerciseIdx].name}
            </div>

            <div className="my-6 text-center">
              <span className="text-6xl font-mono font-black tracking-tight select-none">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="flex justify-center gap-3 relative z-10">
              <button
                onClick={handleTogglePlay}
                className="p-3 bg-brand-emerald hover:bg-brand-emerald/90 active:scale-95 text-white rounded-xl transition-all cursor-pointer"
              >
                {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={handleResetTimer}
                className="p-3 bg-brand-cream/10 hover:bg-brand-cream/20 text-brand-cream rounded-xl transition-colors cursor-pointer border border-brand-cream/10"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Routine Detail List */}
      <div className="lg:col-span-8 flex flex-col bg-white border border-brand-emerald/10 rounded-2xl p-6 shadow-sm">
        <div className="mb-5 border-b border-brand-emerald/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-cream/50 text-brand-emerald rounded-lg">
              <Dumbbell className="w-4 h-4" />
            </div>
            <h3 className="font-sans text-lg font-bold text-brand-forest">{selectedRoutine.title}</h3>
          </div>
          <p className="text-xs text-brand-forest/60 mt-1.5">{selectedRoutine.description}</p>
        </div>

        <div className="space-y-4 flex-1">
          {selectedRoutine.exercises.map((ex, idx) => {
            const isCompleted = !!completedExercises[idx];
            const isActive = activeExerciseIdx === idx;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                  isCompleted 
                    ? 'border-brand-emerald/5 bg-brand-cream/20 opacity-60' 
                    : isActive 
                      ? 'border-brand-emerald bg-brand-emerald/5 shadow-sm' 
                      : 'border-brand-emerald/10 bg-white hover:border-brand-emerald/20'
                }`}
              >
                <div className="flex gap-3 items-start flex-1">
                  <button
                    onClick={() => handleToggleCompleted(idx)}
                    className={`mt-0.5 p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
                      isCompleted 
                        ? 'text-brand-emerald bg-brand-emerald/10' 
                        : 'text-brand-forest/30 hover:text-brand-forest/60 bg-brand-cream/50'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <div>
                    <h4 className={`text-sm font-bold font-sans ${isCompleted ? 'line-through text-brand-forest/40' : 'text-brand-forest'}`}>
                      {ex.name}
                    </h4>
                    <p className="text-xs text-brand-forest/60 mt-1">{ex.instructions}</p>
                    <div className="flex gap-2.5 mt-2">
                      <span className="text-[10px] font-mono font-bold bg-brand-cream text-brand-forest/80 px-2 py-0.5 rounded-md border border-brand-emerald/5">
                        {ex.sets} Séries
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-brand-cream text-brand-forest/80 px-2 py-0.5 rounded-md border border-brand-emerald/5">
                        {ex.repsOrTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  {ex.timerDuration && (
                    <button
                      onClick={() => handleStartTimer(idx, ex.timerDuration!)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-brand-emerald text-white shadow-sm font-extrabold' 
                          : 'bg-brand-cream text-brand-forest hover:bg-brand-cream/80 border border-brand-emerald/10 font-bold'
                      }`}
                    >
                      <Timer className="w-3.5 h-3.5" />
                      Intervalo ({ex.timerDuration}s)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
