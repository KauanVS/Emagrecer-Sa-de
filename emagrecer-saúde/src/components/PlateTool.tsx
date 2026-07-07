import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Apple, Check, Info, Sparkles, RefreshCw } from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  category: 'vegetal' | 'protein' | 'carb';
  benefit: string;
}

const FOOD_DATABASE: FoodItem[] = [
  // Vegetais (50%)
  { id: 'alface', name: 'Alface & Rúcula', caloriesPer100g: 15, category: 'vegetal', benefit: 'Rico em água e fibras, quase zero calorias' },
  { id: 'brocolis', name: 'Brócolis Vapor', caloriesPer100g: 35, category: 'vegetal', benefit: 'Excelente fonte de fitoquímicos e saciedade' },
  { id: 'cenoura', name: 'Cenoura Ralada', caloriesPer100g: 40, category: 'vegetal', benefit: 'Beta-caroteno e fibras crocantes insolúveis' },
  { id: 'tomate', name: 'Tomate fatiado', caloriesPer100g: 18, category: 'vegetal', benefit: 'Fonte importante de licopeno e antioxidantes' },
  { id: 'abobrinha', name: 'Abobrinha Refogada', caloriesPer100g: 20, category: 'vegetal', benefit: 'Hidratação e alta digestibilidade' },
  { id: 'couve_flor', name: 'Couve-Flor Vapor', caloriesPer100g: 25, category: 'vegetal', benefit: 'Baixo teor de carboidratos e rica em vitamina C' },
  { id: 'espinafre', name: 'Espinafre Refogado', caloriesPer100g: 23, category: 'vegetal', benefit: 'Excelente fonte de ferro e magnésio para energia' },
  { id: 'pepino', name: 'Pepino Japonês', caloriesPer100g: 15, category: 'vegetal', benefit: 'Altíssima hidratação e excelente ação diurética' },

  // Proteínas (25%)
  { id: 'frango', name: 'Peito de Frango Grelhado', caloriesPer100g: 165, category: 'protein', benefit: 'Proteína ultra magra com alto poder térmico' },
  { id: 'patinho', name: 'Patinho Moído', caloriesPer100g: 180, category: 'protein', benefit: 'Rico em ferro e vitamina B12' },
  { id: 'tilapia', name: 'Filé de Tilápia', caloriesPer100g: 110, category: 'protein', benefit: 'De digestão rápida e gorduras baixíssimas' },
  { id: 'ovos', name: 'Omelete (2 ovos)', caloriesPer100g: 140, category: 'protein', benefit: 'Colina e excelente equilíbrio de aminoácidos' },
  { id: 'atum', name: 'Atum Sólido ao Natural', caloriesPer100g: 116, category: 'protein', benefit: 'Prático, rico em ômega-3 e alto teor proteico' },
  { id: 'tofu', name: 'Tofu Grelhado', caloriesPer100g: 76, category: 'protein', benefit: 'Proteína 100% vegetal com todos aminoácidos essenciais' },
  { id: 'lombo', name: 'Lombo Suíno Grelhado', caloriesPer100g: 145, category: 'protein', benefit: 'Corte de carne suína super magro e rico em tiamina' },

  // Carboidratos/Leguminosas (25%)
  { id: 'arroz_integral', name: 'Arroz Integral', caloriesPer100g: 110, category: 'carb', benefit: 'Carboidrato complexo de absorção lenta' },
  { id: 'feijao', name: 'Feijão Carioca', caloriesPer100g: 76, category: 'carb', benefit: 'Fibras solúveis e lisina para os músculos' },
  { id: 'batata_doce', name: 'Batata-Doce Cozida', caloriesPer100g: 86, category: 'carb', benefit: 'Baixo índice glicêmico e energia estável' },
  { id: 'mandioca', name: 'Mandioca Cozida', caloriesPer100g: 125, category: 'carb', benefit: 'Energia densa ideal para pós-treino' },
  { id: 'quinoa', name: 'Quinoa Cozida', caloriesPer100g: 120, category: 'carb', benefit: 'Grão integral de alto valor biológico e fibras' },
  { id: 'abobora', name: 'Abóbora Cabotiá Cozida', caloriesPer100g: 48, category: 'carb', benefit: 'Excelente carbo de baixa densidade calórica e saciante' },
  { id: 'pasta_integral', name: 'Macarrão Integral Cozido', caloriesPer100g: 124, category: 'carb', benefit: 'Fibras preservadas que evitam picos de insulina' },
];

export default function PlateTool() {
  const [selectedVeg, setSelectedVeg] = useState<FoodItem | null>(null);
  const [selectedProtein, setSelectedProtein] = useState<FoodItem | null>(null);
  const [selectedCarb, setSelectedCarb] = useState<FoodItem | null>(null);

  const [vegWeight, setVegWeight] = useState(150); // g
  const [proteinWeight, setProteinWeight] = useState(120); // g
  const [carbWeight, setCarbWeight] = useState(100); // g

  const totalCalories = Math.round(
    ((selectedVeg?.caloriesPer100g || 0) * vegWeight) / 100 +
    ((selectedProtein?.caloriesPer100g || 0) * proteinWeight) / 100 +
    ((selectedCarb?.caloriesPer100g || 0) * carbWeight) / 100
  );

  useEffect(() => {
    const state = {
      selectedVeg,
      selectedProtein,
      selectedCarb,
      vegWeight,
      proteinWeight,
      carbWeight,
      totalCalories
    };
    localStorage.setItem('emagrecer_saude_plate_state', JSON.stringify(state));
  }, [selectedVeg, selectedProtein, selectedCarb, vegWeight, proteinWeight, carbWeight, totalCalories]);

  const handleReset = () => {
    setSelectedVeg(null);
    setSelectedProtein(null);
    setSelectedCarb(null);
  };

  const vegetais = FOOD_DATABASE.filter((f) => f.category === 'vegetal');
  const proteinas = FOOD_DATABASE.filter((f) => f.category === 'protein');
  const carboidratos = FOOD_DATABASE.filter((f) => f.category === 'carb');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-brand-forest"
      id="plate-tool-container"
    >
      {/* Visual Plate Renderer */}
      <div className="lg:col-span-6 flex flex-col items-center bg-white border border-brand-emerald/10 rounded-2xl p-6 shadow-sm">
        <div className="w-full flex justify-between items-center mb-6">
          <div>
            <h3 className="font-sans text-lg font-bold text-brand-forest">Simulador de Prato Saudável</h3>
            <p className="text-xs text-brand-forest/60">Toque nos alimentos nas colunas para montar seu prato</p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-brand-forest/70 hover:text-brand-emerald transition-colors border border-brand-emerald/10 rounded-lg px-2.5 py-1.5 cursor-pointer bg-brand-cream/50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reiniciar
          </button>
        </div>

        {/* The Graphical Plate */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-[14px] border-brand-cream/70 bg-white shadow-inner flex items-center justify-center overflow-hidden my-4">
          {/* Inner gold/gray accent circle */}
          <div className="absolute inset-2 rounded-full border border-brand-emerald/10 flex">
            
            {/* Left Half (50%): Vegetables & Greens */}
            <div 
              className={`w-1/2 h-full border-r border-dashed border-brand-emerald/20 flex flex-col items-center justify-center p-4 transition-all duration-300 ${
                selectedVeg ? 'bg-brand-emerald/10 text-brand-forest' : 'bg-brand-cream/30 text-brand-forest/40'
              }`}
            >
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider font-extrabold mb-1 block opacity-60">Fibras & Vitaminas</div>
                <div className="text-xs font-bold font-sans leading-tight">
                  {selectedVeg ? selectedVeg.name : 'Selecione Saladas'}
                </div>
                {selectedVeg && (
                  <div className="text-[10px] font-mono mt-1 font-bold text-brand-emerald bg-white border border-brand-emerald/15 rounded px-1.5 py-0.5 inline-block">
                    {vegWeight}g
                  </div>
                )}
                {!selectedVeg && <div className="text-[11px] opacity-75 mt-1 block">50% do prato</div>}
              </div>
            </div>

            {/* Right Half (Divided into two 25% quadrants) */}
            <div className="w-1/2 h-full flex flex-col">
              {/* Top Right Quadrant (25%): Protein */}
              <div 
                className={`h-1/2 border-b border-dashed border-brand-emerald/20 flex items-center justify-center p-3 text-center transition-all duration-300 ${
                  selectedProtein ? 'bg-brand-sunset/10 text-brand-forest' : 'bg-brand-cream/20 text-brand-forest/40'
                }`}
              >
                <div>
                  <div className="text-[9px] uppercase tracking-wider font-extrabold mb-0.5 opacity-60">Proteína Magra</div>
                  <div className="text-xs font-bold font-sans leading-tight">
                    {selectedProtein ? selectedProtein.name : 'Selecione Carne'}
                  </div>
                  {selectedProtein && (
                    <div className="text-[10px] font-mono mt-1 font-bold text-brand-sunset bg-white border border-brand-sunset/15 rounded px-1.5 py-0.5 inline-block">
                      {proteinWeight}g
                    </div>
                  )}
                  {!selectedProtein && <div className="text-[11px] opacity-75 mt-0.5 block">25% do prato</div>}
                </div>
              </div>

              {/* Bottom Right Quadrant (25%): Carbohydrate */}
              <div 
                className={`h-1/2 flex items-center justify-center p-3 text-center transition-all duration-300 ${
                  selectedCarb ? 'bg-brand-ocean/10 text-brand-forest' : 'bg-brand-cream/10 text-brand-forest/40'
                }`}
              >
                <div>
                  <div className="text-[9px] uppercase tracking-wider font-extrabold mb-0.5 opacity-60">Carbo Complexo</div>
                  <div className="text-xs font-bold font-sans leading-tight">
                    {selectedCarb ? selectedCarb.name : 'Selecione Grãos'}
                  </div>
                  {selectedCarb && (
                    <div className="text-[10px] font-mono mt-1 font-bold text-brand-ocean bg-white border border-brand-ocean/15 rounded px-1.5 py-0.5 inline-block">
                      {carbWeight}g
                    </div>
                  )}
                  {!selectedCarb && <div className="text-[11px] opacity-75 mt-0.5 block">25% do prato</div>}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Nutritional Summary Panel */}
        <div className="w-full mt-6 p-4 bg-brand-cream border border-brand-emerald/10 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs text-brand-forest/60 uppercase tracking-wider font-extrabold block">Estimativa Calórica Total</span>
              <span className="text-[11px] text-brand-forest/50 block leading-tight">Baseado nos pesos indicados</span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-sans font-black text-brand-forest">{totalCalories}</span>
              <span className="text-xs font-extrabold text-brand-emerald ml-1">kcal</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {(selectedVeg || selectedProtein || selectedCarb) ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-brand-emerald/10 space-y-2.5 text-xs text-brand-forest/80"
              >
                {selectedVeg && (
                  <p className="flex gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-brand-emerald shrink-0 mt-0.5" />
                    <span><strong>Vegetal:</strong> {selectedVeg.benefit}</span>
                  </p>
                )}
                {selectedProtein && (
                  <p className="flex gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-brand-sunset shrink-0 mt-0.5" />
                    <span><strong>Proteína:</strong> {selectedProtein.benefit}</span>
                  </p>
                )}
                {selectedCarb && (
                  <p className="flex gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-brand-ocean shrink-0 mt-0.5" />
                    <span><strong>Carboidrato:</strong> {selectedCarb.benefit}</span>
                  </p>
                )}
              </motion.div>
            ) : (
              <div className="mt-4 pt-4 border-t border-brand-emerald/10 flex items-start gap-2 text-xs text-brand-forest/60">
                <Info className="w-4 h-4 text-brand-forest/40 shrink-0 mt-0.5" />
                <p>Nenhum alimento selecionado ainda. Comece a preencher o prato clicando nas opções ao lado!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Selector Panels */}
      <div className="lg:col-span-6 flex flex-col gap-5">
        
        {/* Vegetais (50%) */}
        <div className="bg-white border border-brand-emerald/10 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-sans font-extrabold text-brand-forest text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald"></span>
              1. Vegetais & Saladas (50%)
            </h4>
            {selectedVeg && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-brand-forest/60 font-bold">Peso:</span>
                <input 
                  type="number" 
                  value={vegWeight} 
                  onChange={(e) => setVegWeight(Math.max(20, parseInt(e.target.value) || 0))}
                  className="w-14 text-center text-xs font-mono font-bold border border-brand-emerald/15 rounded px-1 py-0.5 bg-brand-cream/60 text-brand-forest outline-none focus:border-brand-emerald"
                />
                <span className="text-[10px] text-brand-forest/50">g</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {vegetais.map((food) => (
              <button
                key={food.id}
                onClick={() => setSelectedVeg(food)}
                className={`p-2.5 rounded-xl text-left text-xs border transition-all cursor-pointer flex items-center justify-between ${
                  selectedVeg?.id === food.id
                    ? 'border-brand-emerald bg-brand-emerald/10 text-brand-forest font-bold'
                    : 'border-brand-emerald/10 text-brand-forest/70 hover:bg-brand-cream/50'
                }`}
              >
                <span>{food.name}</span>
                {selectedVeg?.id === food.id && <Check className="w-3.5 h-3.5 text-brand-emerald shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Proteínas (25%) */}
        <div className="bg-white border border-brand-emerald/10 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-sans font-extrabold text-brand-forest text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-sunset"></span>
              2. Proteínas Magras (25%)
            </h4>
            {selectedProtein && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-brand-forest/60 font-bold">Peso:</span>
                <input 
                  type="number" 
                  value={proteinWeight} 
                  onChange={(e) => setProteinWeight(Math.max(20, parseInt(e.target.value) || 0))}
                  className="w-14 text-center text-xs font-mono font-bold border border-brand-sunset/15 rounded px-1 py-0.5 bg-brand-cream/60 text-brand-forest outline-none focus:border-brand-sunset"
                />
                <span className="text-[10px] text-brand-forest/50">g</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {proteinas.map((food) => (
              <button
                key={food.id}
                onClick={() => setSelectedProtein(food)}
                className={`p-2.5 rounded-xl text-left text-xs border transition-all cursor-pointer flex items-center justify-between ${
                  selectedProtein?.id === food.id
                    ? 'border-brand-sunset bg-brand-sunset/10 text-brand-forest font-bold'
                    : 'border-brand-emerald/10 text-brand-forest/70 hover:bg-brand-cream/50'
                }`}
              >
                <span>{food.name}</span>
                {selectedProtein?.id === food.id && <Check className="w-3.5 h-3.5 text-brand-sunset shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Carboidratos (25%) */}
        <div className="bg-white border border-brand-emerald/10 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-sans font-extrabold text-brand-forest text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-ocean"></span>
              3. Carboidratos Complexos (25%)
            </h4>
            {selectedCarb && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-brand-forest/60 font-bold">Peso:</span>
                <input 
                  type="number" 
                  value={carbWeight} 
                  onChange={(e) => setCarbWeight(Math.max(20, parseInt(e.target.value) || 0))}
                  className="w-14 text-center text-xs font-mono font-bold border border-brand-ocean/15 rounded px-1 py-0.5 bg-brand-cream/60 text-brand-forest outline-none focus:border-brand-ocean"
                />
                <span className="text-[10px] text-brand-forest/50">g</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {carboidratos.map((food) => (
              <button
                key={food.id}
                onClick={() => setSelectedCarb(food)}
                className={`p-2.5 rounded-xl text-left text-xs border transition-all cursor-pointer flex items-center justify-between ${
                  selectedCarb?.id === food.id
                    ? 'border-brand-ocean bg-brand-ocean/10 text-brand-forest font-bold'
                    : 'border-brand-emerald/10 text-brand-forest/70 hover:bg-brand-cream/50'
                }`}
              >
                <span>{food.name}</span>
                {selectedCarb?.id === food.id && <Check className="w-3.5 h-3.5 text-brand-ocean shrink-0" />}
              </button>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
