import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Flame, Droplet, Dumbbell, Apple, Info } from 'lucide-react';
import { CaloricCalculation } from '../types';
import { calculateCaloricDetails } from '../utils';

export default function CalorieTool() {
  const [inputs, setInputs] = useState<CaloricCalculation>(() => {
    const saved = localStorage.getItem('emagrecer_saude_calories_inputs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      gender: 'female',
      age: 30,
      weight: 70,
      height: 165,
      activityLevel: 'moderate',
      goal: 'healthy_loss',
    };
  });

  const [results, setResults] = useState(() => calculateCaloricDetails(inputs));

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = calculateCaloricDetails(inputs);
    setResults(res);
    localStorage.setItem('emagrecer_saude_calories_inputs', JSON.stringify(inputs));
    localStorage.setItem('emagrecer_saude_calories_results', JSON.stringify(res));
  };

  const handleInputChange = (key: keyof CaloricCalculation, value: any) => {
    const updated = { ...inputs, [key]: value };
    setInputs(updated);
    const res = calculateCaloricDetails(updated);
    setResults(res);
    localStorage.setItem('emagrecer_saude_calories_inputs', JSON.stringify(updated));
    localStorage.setItem('emagrecer_saude_calories_results', JSON.stringify(res));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-brand-forest"
      id="calorie-tool-container"
    >
      {/* Input Form */}
      <div className="lg:col-span-5 bg-white border border-brand-emerald/10 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-brand-emerald/10 text-brand-emerald rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans text-xl font-extrabold text-brand-forest">Calculadora de Metabolismo</h3>
            <p className="text-xs text-brand-forest/65">Baseado nas diretrizes científicas do livro</p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-5">
          {/* Gênero */}
          <div>
            <label className="block text-sm font-bold text-brand-forest/80 mb-2">Gênero Biológico</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('gender', 'female')}
                className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                  inputs.gender === 'female'
                    ? 'border-brand-emerald bg-brand-emerald/15 text-brand-forest font-bold shadow-sm'
                    : 'border-brand-emerald/10 text-brand-forest/60 hover:bg-brand-cream/40'
                }`}
              >
                Feminino
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('gender', 'male')}
                className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                  inputs.gender === 'male'
                    ? 'border-brand-emerald bg-brand-emerald/15 text-brand-forest font-bold shadow-sm'
                    : 'border-brand-emerald/10 text-brand-forest/60 hover:bg-brand-cream/40'
                }`}
              >
                Masculino
              </button>
            </div>
          </div>

          {/* Idade */}
          <div>
            <div className="flex justify-between text-sm font-bold text-brand-forest/80 mb-1">
              <span>Idade</span>
              <span className="font-mono text-brand-emerald font-extrabold">{inputs.age} anos</span>
            </div>
            <input
              type="range"
              min="15"
              max="80"
              value={inputs.age}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
              className="w-full accent-brand-emerald h-1.5 bg-brand-cream rounded-lg cursor-pointer"
            />
          </div>

          {/* Peso */}
          <div>
            <div className="flex justify-between text-sm font-bold text-brand-forest/80 mb-1">
              <span>Peso Atual</span>
              <span className="font-mono text-brand-emerald font-extrabold">{inputs.weight} kg</span>
            </div>
            <input
              type="range"
              min="40"
              max="160"
              value={inputs.weight}
              onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
              className="w-full accent-brand-emerald h-1.5 bg-brand-cream rounded-lg cursor-pointer"
            />
          </div>

          {/* Altura */}
          <div>
            <div className="flex justify-between text-sm font-bold text-brand-forest/80 mb-1">
              <span>Altura</span>
              <span className="font-mono text-brand-emerald font-extrabold">{inputs.height} cm</span>
            </div>
            <input
              type="range"
              min="130"
              max="210"
              value={inputs.height}
              onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
              className="w-full accent-brand-emerald h-1.5 bg-brand-cream rounded-lg cursor-pointer"
            />
          </div>

          {/* Atividade */}
          <div>
            <label className="block text-sm font-bold text-brand-forest/80 mb-1.5">Nível de Atividade</label>
            <select
              value={inputs.activityLevel}
              onChange={(e) => handleInputChange('activityLevel', e.target.value)}
              className="w-full bg-white border border-brand-emerald/10 rounded-xl p-2.5 text-sm outline-none focus:border-brand-emerald transition-all cursor-pointer text-brand-forest font-medium"
            >
              <option value="sedentary">Sedentário (Pouco ou nenhum exercício)</option>
              <option value="light">Atividade Leve (Exercício 1-3 dias/semana)</option>
              <option value="moderate">Atividade Moderada (Exercício 3-5 dias/semana)</option>
              <option value="active">Muito Ativo (Exercício diário intenso)</option>
              <option value="very_active">Atleta (Exercício pesado 2x ao dia)</option>
            </select>
          </div>

          {/* Meta */}
          <div>
            <label className="block text-sm font-bold text-brand-forest/80 mb-1.5">Objetivo de Peso</label>
            <select
              value={inputs.goal}
              onChange={(e) => handleInputChange('goal', e.target.value)}
              className="w-full bg-white border border-brand-emerald/10 rounded-xl p-2.5 text-sm outline-none focus:border-brand-emerald transition-all cursor-pointer text-brand-forest font-medium"
            >
              <option value="healthy_loss">Emagrecimento Saudável (-450 kcal/dia)</option>
              <option value="moderate_loss">Emagrecimento Suave (-250 kcal/dia)</option>
              <option value="maintenance">Manter o Peso Atual (Equilíbrio)</option>
            </select>
          </div>
        </form>

        <div className="mt-5 p-3.5 bg-brand-emerald/5 rounded-xl border border-brand-emerald/10 flex gap-2.5">
          <Info className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
          <p className="text-[11px] text-brand-forest/70 leading-relaxed">
            *Estes cálculos usam a fórmula revisada de Harris-Benedict recomendada na **Parte 3** do livro. Os valores indicam metas ideais diárias.
          </p>
        </div>
      </div>

      {/* Results View */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-white border border-brand-emerald/10 rounded-2xl p-6 shadow-sm flex-1">
          <h3 className="font-sans text-lg font-extrabold mb-5 flex items-center gap-2 text-brand-forest">
            <Flame className="w-5 h-5 text-brand-sunset" />
            Suas Necessidades de Energia
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-brand-cream/50 rounded-xl border border-brand-emerald/10 text-center">
              <span className="text-xs text-brand-forest/60 uppercase tracking-wider font-semibold">TMB (Basal)</span>
              <div className="text-2xl font-sans font-black text-brand-forest mt-1">{results.tmb}</div>
              <span className="text-[10px] text-brand-forest/50">kcal para sobreviver</span>
            </div>
            <div className="p-4 bg-brand-cream/50 rounded-xl border border-brand-emerald/10 text-center">
              <span className="text-xs text-brand-forest/60 uppercase tracking-wider font-semibold">Gasto Diário (VET)</span>
              <div className="text-2xl font-sans font-black text-brand-forest mt-1">{results.vet}</div>
              <span className="text-[10px] text-brand-forest/50">kcal gastas no total</span>
            </div>
            <div className="p-4 bg-brand-emerald/10 border border-brand-emerald/20 rounded-xl text-center">
              <span className="text-xs text-brand-emerald uppercase tracking-wider font-bold block">Meta Calórica</span>
              <div className="text-2xl font-sans font-black text-brand-forest mt-1">{results.targetCalories}</div>
              <span className="text-[10px] text-brand-emerald font-extrabold block">kcal diárias para o objetivo</span>
            </div>
          </div>

          <div className="border-t border-brand-emerald/10 pt-6">
            <h4 className="font-sans font-black text-brand-forest mb-4 flex items-center gap-2 text-sm">
              <Apple className="w-4 h-4 text-brand-emerald" />
              Sugestão de Distribuição de Macronutrientes (Parte 3)
            </h4>

            <div className="space-y-4">
              {/* Proteína */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-brand-forest/80 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald inline-block"></span>
                    Proteína (Alta Saciedade)
                  </span>
                  <span className="text-brand-emerald font-mono font-bold">
                    {results.proteinGrams}g <span className="text-[10px]">({results.proteinPercent}%)</span>
                  </span>
                </div>
                <div className="w-full bg-brand-cream h-2.5 rounded-full overflow-hidden">
                  <div className="bg-brand-emerald h-full rounded-full" style={{ width: `${results.proteinPercent}%` }}></div>
                </div>
              </div>

              {/* Carboidrato */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-brand-forest/80 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-sunset inline-block"></span>
                    Carboidrato (Energia Limpa)
                  </span>
                  <span className="text-brand-sunset font-mono font-bold">
                    {results.carbGrams}g <span className="text-[10px]">({results.carbPercent}%)</span>
                  </span>
                </div>
                <div className="w-full bg-brand-cream h-2.5 rounded-full overflow-hidden">
                  <div className="bg-brand-sunset h-full rounded-full" style={{ width: `${results.carbPercent}%` }}></div>
                </div>
              </div>

              {/* Gordura */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-brand-forest/80 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-ocean inline-block"></span>
                    Gorduras Boas (Regulação Hormonal)
                  </span>
                  <span className="text-brand-ocean font-mono font-bold">
                    {results.fatGrams}g <span className="text-[10px]">({results.fatPercent}%)</span>
                  </span>
                </div>
                <div className="w-full bg-brand-cream h-2.5 rounded-full overflow-hidden">
                  <div className="bg-brand-ocean h-full rounded-full" style={{ width: `${results.fatPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Water Target Card */}
        <div className="bg-brand-ocean/10 border border-brand-ocean/20 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-brand-ocean/20 text-brand-ocean rounded-xl shrink-0">
              <Droplet className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-sans font-extrabold text-brand-forest text-sm">Meta de Hidratação Diária</h4>
              <p className="text-xs text-brand-forest/75 font-medium">Essencial para apoiar a lipólise (queima de gordura)</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-sans font-black text-brand-ocean">{(results.waterMl / 1000).toFixed(2)}L</div>
            <div className="text-[10px] text-brand-ocean font-bold">ou {Math.round(results.waterMl / 250)} copos de 250ml</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
