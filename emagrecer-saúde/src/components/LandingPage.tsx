import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Calculator, 
  Apple, 
  Dumbbell, 
  BarChart3, 
  Cloud, 
  ShieldCheck, 
  Check, 
  X, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Star, 
  Award, 
  Users, 
  Zap, 
  Sparkles, 
  Lock, 
  Activity, 
  Heart, 
  ArrowRight, 
  ShieldAlert, 
  Flame, 
  TrendingUp, 
  ThumbsUp, 
  Brain, 
  UtensilsCrossed, 
  Clock, 
  Smile,
  LogIn
} from 'lucide-react';

interface LandingPageProps {
  onGoToAuth: (mode?: 'login' | 'register') => void;
}

export default function LandingPage({ onGoToAuth }: LandingPageProps) {
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Active feature tab in demonstration section
  const [activeDemoTab, setActiveDemoTab] = useState<'reader' | 'calories' | 'plate' | 'workouts' | 'progress'>('reader');

  // Interactive caloric calculation demo on Landing Page (delightful user experience)
  const [demoWeight, setDemoWeight] = useState<number>(75);
  const [demoHeight, setDemoHeight] = useState<number>(175);
  const [demoAge, setDemoAge] = useState<number>(30);
  const [demoGender, setDemoGender] = useState<'M' | 'F'>('M');
  const [demoResult, setDemoResult] = useState<number>(0);

  useEffect(() => {
    // Harris-Benedict revised
    let bmr = 0;
    if (demoGender === 'M') {
      bmr = 88.362 + (13.397 * demoWeight) + (4.799 * demoHeight) - (5.677 * demoAge);
    } else {
      bmr = 447.593 + (9.247 * demoWeight) + (3.098 * demoHeight) - (4.330 * demoAge);
    }
    setDemoResult(Math.round(bmr));
  }, [demoWeight, demoHeight, demoAge, demoGender]);

  // Statistics counters animation simulation
  const [stats, setStats] = useState({ users: 1250, plans: 3420, rating: 4.8, satisfaction: 98 });
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({ users: 1482, plans: 4129, rating: 4.9, satisfaction: 99 });
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const checkoutMensal = (import.meta as any).env.VITE_KIWIFY_CHECKOUT_MENSAL || 'https://pay.kiwify.com.br/mensal-placeholder';
  const checkoutVitalicio = (import.meta as any).env.VITE_KIWIFY_CHECKOUT_VITALICIO || 'https://pay.kiwify.com.br/vitalicio-placeholder';

  // Testimonials slide show list (10 items)
  const testimonialsList = [
    {
      initials: 'MC',
      name: 'Mariana Costa',
      role: 'Arquiteta • Eliminou 6kg',
      text: '"As calculadoras de calorias mudaram totalmente minha visão de emagrecimento. Eu comia pouco achando que estava arrasando, mas descobri que faltava proteína no meu prato. Já se foram 6kg!"'
    },
    {
      initials: 'RS',
      name: 'Rodrigo Silva',
      role: 'Engenheiro de Software • Eliminou 9kg',
      text: '"Excelente material. O e-book interativo é fantástico e o montador de prato visual é muito útil. Além disso, a integração com o Google Agenda me ajuda a lembrar do treino diário."'
    },
    {
      initials: 'AP',
      name: 'Ana Paula Lima',
      role: 'Professora • Eliminou 5kg',
      text: '"O plano vitalício é muito barato pelo que entrega. Já fiz consultorias caras que não tinham a praticidade deste portal. As fichas de treino são ótimas e bem estruturadas."'
    },
    {
      initials: 'CE',
      name: 'Carlos Eduardo',
      role: 'Administrador • Eliminou 12kg',
      text: '"O que mais gostei foi a parte das calorias diárias. O site calcula tudo automático e o acompanhamento de peso em gráfico me deu muito mais ânimo para continuar firme."'
    },
    {
      initials: 'BS',
      name: 'Beatriz Santos',
      role: 'Nutricionista • Aprovou o Método',
      text: '"Indico para vários clientes como ferramenta de apoio. É muito didático, sem radicalismo. O montador de prato ensina de verdade como equilibrar macronutrientes sem neura."'
    },
    {
      initials: 'FM',
      name: 'Felipe Mendes',
      role: 'Designer Gráfico • Eliminou 15kg',
      text: '"O visual do portal é muito limpo e as ferramentas são fáceis de usar pelo celular. Consegui montar minha rotina de treinos e reeducação alimentar em poucos minutos."'
    },
    {
      initials: 'JR',
      name: 'Juliana Rocha',
      role: 'Médica • Eliminou 8kg',
      text: '"Pela primeira vez consegui manter a constância. O e-book explica a ciência de forma simples, e o diário de calorias me ajuda a manter a disciplina mesmo na rotina corrida de plantão."'
    },
    {
      initials: 'GH',
      name: 'Gustavo Henrique',
      role: 'Microempresário • Eliminou 10kg',
      text: '"Tentei várias dietas da moda e sempre voltava ao peso antigo. Com o guia aprendi sobre déficit calórico real. Ferramenta indispensável e o acesso vitalício vale cada centavo."'
    },
    {
      initials: 'CR',
      name: 'Camila Ribeiro',
      role: 'Estudante • Eliminou 7kg',
      text: '"O montador de pratos me salvou! Eu achava que comer saudável era caro ou sem graça, mas aprendi a combinar alimentos normais do dia a dia. Já perdi 7kg sem sofrer."'
    },
    {
      initials: 'LO',
      name: 'Lucas Oliveira',
      role: 'Advogado • Eliminou 14kg',
      text: '"Impressionante a qualidade do portal. A sincronização automática do treino com o Google Calendar é excelente para a minha rotina cheia. Recomendo de olhos fechados!"'
    }
  ];

  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [visibleTestimonials, setVisibleTestimonials] = useState(3);
  const [isTestimonialPaused, setIsTestimonialPaused] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleTestimonials(1);
      } else if (window.innerWidth < 1024) {
        setVisibleTestimonials(2);
      } else {
        setVisibleTestimonials(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isTestimonialPaused) return;
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => {
        const maxIndex = testimonialsList.length - visibleTestimonials;
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isTestimonialPaused, visibleTestimonials, testimonialsList.length]);

  // Benefits list (8 items as requested)
  const benefits = [
    {
      icon: <BookOpen className="w-6 h-6 text-brand-emerald" />,
      title: 'E-Book Interativo Completo',
      desc: 'Leitura otimizada por capítulos com progresso automático. Todo o conhecimento científico sem enrolação.'
    },
    {
      icon: <Calculator className="w-6 h-6 text-brand-emerald" />,
      title: 'Calculadora de Déficit Calórico',
      desc: 'Descubra exatamente sua Taxa Metabólica Basal e seu Valor Energético Total em segundos com precisão médica.'
    },
    {
      icon: <Apple className="w-6 h-6 text-brand-emerald" />,
      title: 'Montador de Prato Saudável',
      desc: 'Crie refeições perfeitamente balanceadas de forma visual, controlando porções e calorias exatas de cada ingrediente.'
    },
    {
      icon: <Dumbbell className="w-6 h-6 text-brand-emerald" />,
      title: 'Fichas de Treino Inteligentes',
      desc: 'Acesse planos de treinamento focados em queima de gordura e ganho de massa magra, adaptados para casa ou academia.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-brand-emerald" />,
      title: 'Diário de Medidas e Progresso',
      desc: 'Acompanhe suas fotos, peso e circunferências corporais. Gráficos dinâmicos que mostram sua evolução real.'
    },
    {
      icon: <Cloud className="w-6 h-6 text-brand-emerald" />,
      title: 'Sincronização com Google Agenda',
      desc: 'Agende seus treinos, horários de refeição e ingestão de água diretamente na sua conta Google para nunca mais esquecer.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-emerald" />,
      title: 'Acesso em 1 Único Dispositivo',
      desc: 'Segurança absoluta. O sistema gerencia sua sessão em dispositivo único, prevenindo vazamentos e pirataria.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-brand-emerald" />,
      title: 'Método Cientificamente Comprovado',
      desc: 'Sem dietas restritivas malucas. Foco em consistência, reeducação alimentar e saúde metabólica sustentável.'
    }
  ];

  // Steps for "Como Funciona"
  const steps = [
    {
      num: '01',
      title: 'Escolha seu Plano',
      desc: 'Selecione a assinatura mensal flexível ou o plano vitalício com super desconto e livre de mensalidades.'
    },
    {
      num: '02',
      title: 'Pagamento 100% Seguro',
      desc: 'Conclua sua inscrição via Kiwify através de Pix, Cartão de Crédito ou Boleto com liberação imediata.'
    },
    {
      num: '03',
      title: 'Acesse o Portal na Hora',
      desc: 'Crie sua senha e use todas as ferramentas inteligentes imediatamente em seu celular, tablet ou computador.'
    }
  ];

  // FAQ Items (10 items as requested)
  const faqItems = [
    {
      q: 'O que é o Emagrecer Saúde Premium?',
      a: 'É um ecossistema digital completo baseado em evidências científicas que reúne um livro digital interativo rico em informações e ferramentas práticas como calculadoras de calorias, montador de pratos inteligente, diário de medidas, fichas de treino guiadas e sincronização automática com o Google.'
    },
    {
      q: 'Como recebo o acesso ao aplicativo?',
      a: 'Assim que o pagamento for confirmado pela Kiwify, você receberá um e-mail com as instruções para definir sua senha. O acesso ao portal é instantâneo.'
    },
    {
      q: 'Como funciona o controle de dispositivo único?',
      a: 'Para garantir a segurança de seus dados e evitar compartilhamento indevido, o portal permite apenas um login ativo por vez no dispositivo que você escolher. Você pode desconectar o anterior e conectar em um novo se precisar.'
    },
    {
      q: 'A calculadora de calorias é confiável?',
      a: 'Sim. Utilizamos as equações científicas revisadas de Harris-Benedict e Mifflin-St Jeor, as mais recomendadas por nutricionistas e médicos de todo o mundo para estimar suas necessidades energéticas de forma personalizada.'
    },
    {
      q: 'Tenho suporte caso tenha dúvidas?',
      a: 'Com certeza! Tanto o plano mensal quanto o vitalício dão acesso ao nosso suporte. No plano Vitalício, você conta com suporte prioritário exclusivo direto na área do aluno.'
    },
    {
      q: 'O pagamento é recorrente no plano mensal?',
      a: 'Sim. No plano mensal, o valor de R$39,90 é cobrado automaticamente a cada mês. Você pode cancelar quando quiser, sem taxas extras ou contratos de fidelidade.'
    },
    {
      q: 'O plano vitalício realmente não tem mensalidades?',
      a: 'Exatamente. No plano Vitalício, você faz um pagamento único de R$97,00 e tem acesso para sempre ao portal, incluindo todas as atualizações de recursos, novas fichas de treino e novos capítulos que lançarmos.'
    },
    {
      q: 'Existe garantia de reembolso?',
      a: 'Sim, nós oferecemos uma garantia incondicional de 7 dias protegida por lei. Se você entrar no portal e achar que as ferramentas e o livro não são para você, basta solicitar o reembolso na Kiwify que devolveremos 100% do seu dinheiro.'
    },
    {
      q: 'Preciso instalar algum aplicativo no celular?',
      a: 'Não! O Emagrecer Saúde é um Web App moderno (PWA) totalmente responsivo. Você pode acessá-lo por qualquer navegador de celular, tablet ou computador e até mesmo adicioná-lo à tela inicial do seu celular como se fosse um aplicativo nativo.'
    },
    {
      q: 'Posso usar o aplicativo se tiver alguma restrição de saúde?',
      a: 'Nossas ferramentas servem para guiar e educar sobre nutrição saudável e exercícios. No entanto, se você tiver condições crônicas de saúde, gestação ou distúrbios alimentares, é fundamental que consulte seu médico ou nutricionista antes de iniciar mudanças drásticas.'
    }
  ];

  // Interactive mockups data representation
  const demoScreens = {
    reader: {
      title: 'Livro Interativo Inteligente',
      badge: 'Capítulos Práticos',
      desc: 'Aprenda os segredos do déficit calórico saudável, fitoquímicos aceleradores e como vencer o efeito platô sem sofrimento.',
      content: (
        <div className="bg-brand-cream/80 rounded-2xl p-5 border border-brand-emerald/10 font-sans text-left space-y-4 shadow-inner">
          <div className="flex justify-between items-center border-b border-brand-emerald/10 pb-3">
            <span className="text-xs font-bold text-brand-emerald uppercase tracking-wider">Capítulo 3: O Poder do Déficit</span>
            <span className="text-[10px] bg-brand-emerald/10 text-brand-emerald font-extrabold px-2 py-0.5 rounded-full">Pág 24 de 120</span>
          </div>
          <h4 className="font-serif italic font-bold text-lg text-brand-forest">"Por que dietas restritivas demais desaceleram seu metabolismo permanentemente"</h4>
          <p className="text-xs text-brand-forest/80 leading-relaxed">
            Quando você reduz drasticamente suas calorias, o corpo entra em estado de termogênese adaptativa. Ele diminui o gasto de energia basal para economizar combustível. O segredo é um déficit moderado aliado a proteínas...
          </p>
          <div className="pt-2 flex items-center justify-between">
            <div className="w-2/3 bg-neutral-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-brand-emerald h-full w-[20%]" />
            </div>
            <span className="text-[10px] font-bold text-brand-forest/60">20% Concluído</span>
          </div>
        </div>
      )
    },
    calories: {
      title: 'Calculadora Avançada TMB & VET',
      badge: 'Fórmula Padrão Ouro',
      desc: 'Descubra a quantidade ideal de calorias diárias baseadas no seu peso, altura, idade e nível de atividade física diária.',
      content: (
        <div className="bg-white rounded-2xl p-5 border border-brand-emerald/10 font-sans text-left space-y-4 shadow-md">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="text-[10px] font-black text-brand-forest uppercase block mb-1">Seu Peso (kg)</label>
              <input 
                type="range" 
                min="40" 
                max="150" 
                value={demoWeight} 
                onChange={(e) => setDemoWeight(Number(e.target.value))} 
                className="w-full accent-brand-emerald cursor-pointer"
              />
              <div className="text-xs font-bold text-brand-forest mt-1">{demoWeight} kg</div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black text-brand-forest uppercase block mb-1">Sua Altura (cm)</label>
              <input 
                type="range" 
                min="130" 
                max="220" 
                value={demoHeight} 
                onChange={(e) => setDemoHeight(Number(e.target.value))} 
                className="w-full accent-brand-emerald cursor-pointer"
              />
              <div className="text-xs font-bold text-brand-forest mt-1">{demoHeight} cm</div>
            </div>
          </div>
          <div className="bg-brand-cream/60 p-3.5 rounded-xl border border-brand-emerald/10 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-extrabold uppercase text-brand-forest/50">Sua Taxa Basal Estimada</span>
              <div className="text-lg font-black text-brand-emerald">{demoResult} kcal/dia</div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-extrabold uppercase text-brand-forest/50">Déficit Seguro</span>
              <div className="text-xs font-bold text-brand-sunset">{Math.round(demoResult - 450)} kcal</div>
            </div>
          </div>
          <p className="text-[10px] text-brand-forest/50 italic text-center">Interaja acima e veja o cálculo em tempo real!</p>
        </div>
      )
    },
    plate: {
      title: 'Montador Visual de Prato Saudável',
      badge: 'Nutrição na Prática',
      desc: 'Monte seu prato adicionando legumes, proteínas magras e carboidratos complexos, visualizando o impacto calórico instantâneo.',
      content: (
        <div className="bg-brand-cream/30 rounded-2xl p-5 border border-brand-emerald/10 font-sans text-left space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-brand-forest">Monte seu Prato (Meta: Almoço)</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-md">350 kcal</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 bg-white border border-brand-emerald/20 rounded-xl text-center shadow-sm">
              <div className="text-[10px] font-black text-brand-emerald">50% Salada</div>
              <p className="text-[9px] text-brand-forest/60 mt-0.5">Alface, Tomate e Pepino</p>
            </div>
            <div className="p-2.5 bg-white border border-brand-emerald/20 rounded-xl text-center shadow-sm">
              <div className="text-[10px] font-black text-brand-emerald">25% Proteína</div>
              <p className="text-[9px] text-brand-forest/60 mt-0.5">Frango Grelhado</p>
            </div>
            <div className="p-2.5 bg-white border border-brand-emerald/20 rounded-xl text-center shadow-sm">
              <div className="text-[10px] font-black text-brand-emerald">25% Carbo</div>
              <p className="text-[9px] text-brand-forest/60 mt-0.5">Arroz Integral</p>
            </div>
          </div>
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-2 rounded-lg text-[10px] font-semibold text-center">
            ✔ Combinação Perfeita! Fibras abundantes e saciedade estendida.
          </div>
        </div>
      )
    },
    workouts: {
      title: 'Fichas de Treino Interativas',
      badge: 'Hipertrofia & Termogênese',
      desc: 'Fichas de musculação divididas em treinos focados, com repetições, séries e dicas exclusivas para queimar gordura de forma eficiente.',
      content: (
        <div className="bg-white rounded-2xl p-5 border border-brand-emerald/10 font-sans text-left space-y-3 shadow-md">
          <div className="flex justify-between items-center">
            <h5 className="font-bold text-xs text-brand-forest">Treino A - Membros Inferiores (Foco Quadríceps)</h5>
            <span className="text-[9px] bg-brand-emerald text-white font-extrabold px-1.5 py-0.5 rounded">4 Exercícios</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] border-b border-neutral-100 pb-1.5">
              <div>
                <span className="font-bold block text-brand-forest">1. Agachamento Livre</span>
                <span className="text-neutral-400">Cadência controlada 3s descida</span>
              </div>
              <span className="font-mono font-bold text-brand-emerald">4 séries x 12 reps</span>
            </div>
            <div className="flex justify-between items-center text-[10px] border-b border-neutral-100 pb-1.5">
              <div>
                <span className="font-bold block text-brand-forest">2. Leg Press 45°</span>
                <span className="text-neutral-400">Amplitude máxima, joelhos alinhados</span>
              </div>
              <span className="font-mono font-bold text-brand-emerald">3 séries x 15 reps</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <div>
                <span className="font-bold block text-brand-forest">3. Cadeira Extensora</span>
                <span className="text-neutral-400">Ponto zero de pico de contração</span>
              </div>
              <span className="font-mono font-bold text-brand-emerald">4 séries x 10 reps</span>
            </div>
          </div>
        </div>
      )
    },
    progress: {
      title: 'Diário Gráfico de Medidas',
      badge: 'Visualização de Metas',
      desc: 'Insira seu peso atual, percentual de gordura e medidas para ver gráficos dinâmicos de sua evolução ao longo das semanas.',
      content: (
        <div className="bg-white rounded-2xl p-5 border border-brand-emerald/10 font-sans text-left space-y-4 shadow-md">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
            <span className="text-xs font-bold text-brand-forest">Evolução do Peso</span>
            <span className="text-[10px] text-brand-emerald font-extrabold">-4.2 kg no total</span>
          </div>
          <div className="h-28 flex items-end justify-between gap-1.5 px-4 pt-4">
            <div className="flex flex-col items-center gap-1.5 w-full">
              <div className="text-[8px] font-mono font-bold text-brand-forest/60">79.2kg</div>
              <div className="w-full bg-brand-emerald/20 hover:bg-brand-emerald/30 transition-all rounded-t-md h-24" />
              <div className="text-[8px] font-bold text-neutral-400">Sem 1</div>
            </div>
            <div className="flex flex-col items-center gap-1.5 w-full">
              <div className="text-[8px] font-mono font-bold text-brand-forest/60">78.0kg</div>
              <div className="w-full bg-brand-emerald/40 hover:bg-brand-emerald/50 transition-all rounded-t-md h-20" />
              <div className="text-[8px] font-bold text-neutral-400">Sem 2</div>
            </div>
            <div className="flex flex-col items-center gap-1.5 w-full">
              <div className="text-[8px] font-mono font-bold text-brand-forest/60">76.5kg</div>
              <div className="w-full bg-brand-emerald/75 hover:bg-brand-emerald/80 transition-all rounded-t-md h-14" />
              <div className="text-[8px] font-bold text-neutral-400">Sem 3</div>
            </div>
            <div className="flex flex-col items-center gap-1.5 w-full">
              <div className="text-[8px] font-mono font-bold text-brand-emerald font-black">75.0kg</div>
              <div className="w-full bg-brand-emerald rounded-t-md h-10 shadow" />
              <div className="text-[8px] font-black text-brand-emerald">Hoje</div>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="bg-brand-cream/20 text-brand-forest font-sans overflow-x-hidden selection:bg-brand-emerald/20">
      
      {/* 1. STICKY HEADER / NAV BAR */}
      <header className="bg-white/80 backdrop-blur-md border-b border-brand-emerald/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-emerald text-white rounded-xl shadow-md font-bold text-xs">
              ES
            </div>
            <div>
              <span className="font-sans text-lg font-black tracking-tight text-brand-forest block leading-none">
                Emagrecer Saúde
              </span>
              <span className="text-[9px] font-extrabold text-brand-emerald tracking-wide block uppercase mt-0.5">Portal Premium</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#beneficios" className="text-xs font-bold text-brand-forest/70 hover:text-brand-emerald transition-colors">Benefícios</a>
            <a href="#funcionamento" className="text-xs font-bold text-brand-forest/70 hover:text-brand-emerald transition-colors">Como Funciona</a>
            <a href="#recursos" className="text-xs font-bold text-brand-forest/70 hover:text-brand-emerald transition-colors">Recursos</a>
            <a href="#demonstracao" className="text-xs font-bold text-brand-forest/70 hover:text-brand-emerald transition-colors">Demonstração</a>
            <a href="#precos" className="text-xs font-bold text-brand-forest/70 hover:text-brand-emerald transition-colors">Planos</a>
            <a href="#faq" className="text-xs font-bold text-brand-forest/70 hover:text-brand-emerald transition-colors">Perguntas Frequentes</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onGoToAuth('login')}
              className="py-2 px-3.5 bg-brand-cream hover:bg-brand-cream/80 border border-brand-emerald/10 text-brand-forest font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-brand-emerald" />
              Portal do Aluno
            </button>
            <a 
              href="#precos" 
              className="hidden sm:inline-flex py-2 px-4 bg-brand-emerald hover:bg-brand-emerald/90 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
            >
              Assinar Agora
            </a>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-24 sm:pt-20 sm:pb-32 bg-gradient-to-b from-white via-brand-cream/10 to-transparent">
        
        {/* Ambient Blurred Background Accents */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-brand-emerald/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/10 w-80 h-80 bg-brand-sunset/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Trust indicator badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-emerald/10 text-brand-emerald text-[10px] font-extrabold uppercase tracking-wider rounded-full mb-6 border border-brand-emerald/20">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Vagas Limitadas com Preço Especial de Lançamento
          </div>

          {/* Persuasive Headlines */}
          <h1 className="text-3xl sm:text-6xl font-black text-brand-forest tracking-tight max-w-4xl mx-auto leading-tight">
            Emagreça com saúde, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-emerald-600">equilíbrio real</span> e sem fórmulas mágicas
          </h1>
          
          <p className="text-sm sm:text-xl text-brand-forest/70 font-medium max-w-2xl mx-auto mt-6 leading-relaxed">
            Tenha acesso ao portal definitivo com e-book interativo, calculadoras personalizadas de metabolismo, montador de pratos, fichas de treino profissionais e controle de medidas dinâmico.
          </p>

          {/* Two Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a 
              href="#precos" 
              className="w-full sm:w-auto py-4 px-8 bg-brand-emerald hover:bg-brand-emerald/95 text-white font-black text-sm rounded-2xl shadow-lg shadow-brand-emerald/20 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
            >
              Comprar Plano Vitalício (Destaque) <ArrowRight className="w-4 h-4" />
            </a>
            <a 
              href="#precos" 
              className="w-full sm:w-auto py-4 px-8 bg-white hover:bg-brand-cream/20 border-2 border-brand-emerald/20 text-brand-forest font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-brand-sunset" /> Assinar Mensal (R$39,90)
            </a>
          </div>

          {/* Trust and Social Proof under CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-neutral-500 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-emerald" />
              Garantia de Reembolso Incondicional por 7 dias
            </div>
            <div className="hidden sm:block text-neutral-300">|</div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-emerald" />
              Mais de {stats.users} alunos transformando suas rotinas
            </div>
            <div className="hidden sm:block text-neutral-300">|</div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-brand-sunset text-brand-sunset" />
              ))}
              <span className="ml-1 text-brand-forest font-bold">4.9/5</span>
            </div>
          </div>

          {/* Elegant Interactive Demonstration Showcase Mockup */}
          <div className="mt-16 sm:mt-24 max-w-4xl mx-auto bg-gradient-to-tr from-brand-emerald/20 to-brand-sunset/10 p-2 sm:p-4 rounded-[32px] border border-white/40 shadow-2xl relative">
            <div className="bg-white rounded-[24px] overflow-hidden border border-brand-emerald/10 shadow-lg p-4 sm:p-8">
              
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-[10px] sm:text-xs text-brand-forest/40 font-mono ml-2">portal.emagrecersaude.com</span>
                </div>
                <div className="text-[10px] sm:text-xs bg-brand-cream text-brand-emerald font-black px-3 py-1 rounded-full">
                  Área do Aluno Premium
                </div>
              </div>

              {/* Grid content showcasing features inside the mock app */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 text-left space-y-4">
                  <div className="p-3 bg-brand-cream/60 border border-brand-emerald/10 rounded-2xl flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-brand-emerald" />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-brand-forest/60 block">E-book Interativo</span>
                      <span className="text-xs font-black text-brand-forest">Leitura Dinâmica do Guia</span>
                    </div>
                  </div>
                  <div className="p-3 bg-brand-cream/60 border border-brand-emerald/10 rounded-2xl flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-brand-emerald" />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-brand-forest/60 block">Calculadora de Nutrientes</span>
                      <span className="text-xs font-black text-brand-forest">Cálculo Preciso TMB/VET</span>
                    </div>
                  </div>
                  <div className="p-3 bg-brand-cream/60 border border-brand-emerald/10 rounded-2xl flex items-center gap-2">
                    <Apple className="w-5 h-5 text-brand-emerald" />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-brand-forest/60 block">Montador de Prato</span>
                      <span className="text-xs font-black text-brand-forest">Divisões ideais das refeições</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-8 bg-brand-cream/20 p-4 sm:p-6 rounded-2xl border border-neutral-100 shadow-inner">
                  <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
                    <span className="text-[10px] bg-brand-emerald text-white font-extrabold px-2.5 py-1 rounded-lg">Prato Ideal</span>
                    <span className="text-[10px] bg-brand-cream border border-brand-emerald/15 text-brand-forest font-bold px-2.5 py-1 rounded-lg">Calculadora de Água</span>
                    <span className="text-[10px] bg-brand-cream border border-brand-emerald/15 text-brand-forest font-bold px-2.5 py-1 rounded-lg">Fichas de Treino</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm text-left border border-brand-emerald/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-brand-forest flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-brand-sunset" /> Minha Meta Calórica Diária
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">Meta: Perder Peso</span>
                    </div>
                    <div className="text-2xl font-black text-brand-forest tracking-tight">1.680 kcal <span className="text-xs text-brand-forest/50 font-semibold">/ dia</span></div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-brand-emerald to-emerald-500 h-full w-[70%]" />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-brand-forest/60">
                      <span>Ingerido hoje: 1.150 kcal</span>
                      <span>Restante: 530 kcal</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. BENEFITS SECTION (Cards Layout) */}
      <section id="beneficios" className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
            <span className="text-[10px] sm:text-xs bg-brand-emerald/10 text-brand-emerald font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
              Por que nos escolher
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-forest mt-4 tracking-tight">
              Tudo o que você precisa para alcançar seus objetivos em um só lugar
            </h2>
            <p className="text-sm sm:text-base text-brand-forest/70 font-medium mt-3">
              Esqueça tabelas de Excel bagunçadas, PDFs perdidos e métodos complicados. Nosso portal centraliza as melhores práticas cientificas de forma intuitiva.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {benefits.map((b, i) => (
              <div 
                key={i} 
                className="bg-brand-cream/20 hover:bg-white border border-brand-emerald/5 hover:border-brand-emerald/20 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl group"
              >
                <div className="p-3 bg-brand-emerald/10 rounded-2xl inline-block text-brand-emerald group-hover:bg-brand-emerald group-hover:text-white transition-all duration-300 mb-5">
                  {b.icon}
                </div>
                <h3 className="text-sm sm:text-base font-black text-brand-forest">{b.title}</h3>
                <p className="text-xs text-brand-forest/70 mt-2.5 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="funcionamento" className="py-20 sm:py-32 bg-brand-cream/30 border-y border-brand-emerald/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
            <span className="text-[10px] sm:text-xs bg-brand-emerald/10 text-brand-emerald font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
              Simples e Descomplicado
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-forest mt-4 tracking-tight">
              Seu novo estilo de vida saudável em apenas 3 passos rápidos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative">
            
            {/* Visual connector line in desktop */}
            <div className="hidden md:block absolute top-1/4 left-1/6 right-1/6 h-0.5 bg-brand-emerald/10 z-0" />

            {steps.map((s, idx) => (
              <div key={idx} className="bg-white border border-brand-emerald/5 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all relative z-10 text-center sm:text-left">
                <span className="text-4xl sm:text-5xl font-black text-brand-emerald/20 font-serif block mb-4">{s.num}</span>
                <h3 className="text-base sm:text-lg font-black text-brand-forest">{s.title}</h3>
                <p className="text-xs sm:text-sm text-brand-forest/70 mt-2.5 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <a 
              href="#precos" 
              className="inline-flex py-3.5 px-8 bg-brand-emerald hover:bg-brand-emerald/90 text-white font-extrabold text-xs rounded-xl shadow-md transition-all gap-1.5 cursor-pointer"
            >
              Quero Iniciar Agora <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </section>

      {/* 5. DEMONSTRATION & SCREEN PREVIEW SECTION */}
      <section id="demonstracao" className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-[10px] sm:text-xs bg-brand-emerald/10 text-brand-emerald font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
              Portal por dentro
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-forest mt-4 tracking-tight">
              Uma experiência premium completa e focada em resultados reais
            </h2>
            <p className="text-xs sm:text-sm text-brand-forest/60 mt-2">
              Clique nos botões abaixo para ver uma prévia interativa das ferramentas em tempo real.
            </p>
          </div>

          {/* Tab selector for features */}
          <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl mx-auto">
            <button
              onClick={() => setActiveDemoTab('reader')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDemoTab === 'reader' ? 'bg-brand-emerald text-white shadow-md' : 'bg-brand-cream/60 hover:bg-brand-cream text-brand-forest/80'
              }`}
            >
              <BookOpen className="w-4 h-4" /> E-Book
            </button>
            <button
              onClick={() => setActiveDemoTab('calories')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDemoTab === 'calories' ? 'bg-brand-emerald text-white shadow-md' : 'bg-brand-cream/60 hover:bg-brand-cream text-brand-forest/80'
              }`}
            >
              <Calculator className="w-4 h-4" /> Calculadora TMB
            </button>
            <button
              onClick={() => setActiveDemoTab('plate')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDemoTab === 'plate' ? 'bg-brand-emerald text-white shadow-md' : 'bg-brand-cream/60 hover:bg-brand-cream text-brand-forest/80'
              }`}
            >
              <Apple className="w-4 h-4" /> Montar Prato
            </button>
            <button
              onClick={() => setActiveDemoTab('workouts')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDemoTab === 'workouts' ? 'bg-brand-emerald text-white shadow-md' : 'bg-brand-cream/60 hover:bg-brand-cream text-brand-forest/80'
              }`}
            >
              <Dumbbell className="w-4 h-4" /> Fichas Treino
            </button>
            <button
              onClick={() => setActiveDemoTab('progress')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDemoTab === 'progress' ? 'bg-brand-emerald text-white shadow-md' : 'bg-brand-cream/60 hover:bg-brand-cream text-brand-forest/80'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Diário de Progresso
            </button>
          </div>

          {/* Interactive Responsive Device Mockups (Laptop, Tablet, Mobile) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-brand-cream/25 border border-brand-emerald/10 p-6 sm:p-12 rounded-[36px] shadow-sm">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] bg-brand-emerald/10 text-brand-emerald font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                {demoScreens[activeDemoTab].badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-brand-forest">{demoScreens[activeDemoTab].title}</h3>
              <p className="text-xs sm:text-sm text-brand-forest/70 leading-relaxed">{demoScreens[activeDemoTab].desc}</p>
              
              <div className="pt-4 border-t border-brand-emerald/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-forest">
                  <Check className="w-4 h-4 text-brand-emerald" /> Design Responsivo de Altíssima Performance
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-brand-forest">
                  <Check className="w-4 h-4 text-brand-emerald" /> Sem Anúncios e sem poluição visual
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex justify-center">
              {/* Device Frame */}
              <div className="w-full max-w-md bg-neutral-900 rounded-[32px] p-2.5 shadow-2xl border-4 border-neutral-800">
                <div className="bg-neutral-950 rounded-[24px] overflow-hidden aspect-[4/3] flex flex-col justify-between p-4 text-white relative">
                  
                  {/* Top notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-900 rounded-b-xl z-20" />

                  {/* Top Bar inside Screen */}
                  <div className="flex justify-between items-center text-[8px] opacity-75 font-mono mb-2 z-10 pt-1">
                    <span>12:30</span>
                    <span className="flex items-center gap-1">📶 🔋 100%</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-center text-brand-forest z-10">
                    {demoScreens[activeDemoTab].content}
                  </div>

                  {/* Under Screen Bar */}
                  <div className="h-1 bg-white/40 w-24 rounded-full mx-auto mt-2 shrink-0" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. EXTENSIVE FEATURES SECTION (Bento Grid Style) */}
      <section id="recursos" className="py-20 sm:py-32 bg-brand-cream/10 border-t border-brand-emerald/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
            <span className="text-[10px] sm:text-xs bg-brand-emerald/10 text-brand-emerald font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
              Recursos Premium
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-forest mt-4 tracking-tight">
              Tudo planejado por profissionais para acelerar seus resultados
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            <div className="bg-white border border-neutral-100 p-8 rounded-[32px] md:col-span-2 shadow-sm space-y-4">
              <div className="p-3 bg-brand-emerald/10 rounded-2xl inline-block text-brand-emerald mb-2">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-brand-forest">E-Book Digital de Reeducação Nutricional</h3>
              <p className="text-xs sm:text-sm text-brand-forest/70 leading-relaxed">
                Descubra por que contar calorias ou cortar arroz não é a solução definitiva. Aprenda como funciona a termogênese dos alimentos, o papel das fibras alimentares solúveis na sinalização da saciedade hipotalâmica, e como manter seu metabolismo sempre ativo.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[10px] bg-brand-cream px-2.5 py-1 rounded-lg font-bold text-brand-forest">Capítulo de Micronutrientes</span>
                <span className="text-[10px] bg-brand-cream px-2.5 py-1 rounded-lg font-bold text-brand-forest">Combate à Inflamação Crônica</span>
                <span className="text-[10px] bg-brand-cream px-2.5 py-1 rounded-lg font-bold text-brand-forest">Quebrando Efeito Platô</span>
              </div>
            </div>

            <div className="bg-white border border-neutral-100 p-8 rounded-[32px] shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="p-3 bg-brand-emerald/10 rounded-2xl inline-block text-brand-emerald mb-4">
                  <Calculator className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-brand-forest">Cálculo Preciso de Déficit</h3>
                <p className="text-xs text-brand-forest/70 leading-relaxed">
                  A ferramenta estima seu consumo ideal baseando-se no seu metabolismo basal diário. Nada de palpites. Descubra sua taxa exata!
                </p>
              </div>
              <div className="bg-brand-cream p-3 rounded-2xl text-[11px] font-bold text-brand-emerald">
                ⭐ Inclui estimativa de gasto calórico de exercícios diários.
              </div>
            </div>

            <div className="bg-white border border-neutral-100 p-8 rounded-[32px] shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="p-3 bg-brand-emerald/10 rounded-2xl inline-block text-brand-emerald mb-4">
                  <Apple className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-brand-forest">Montador de Refeições</h3>
                <p className="text-xs text-brand-forest/70 leading-relaxed">
                  Divida seu prato nas proporções recomendadas por especialistas: 50% Vegetais e Legumes, 25% Proteínas Magras, e 25% Carboidratos de absorção lenta.
                </p>
              </div>
              <div className="bg-amber-50 text-brand-sunset border border-amber-100 p-3 rounded-2xl text-[11px] font-bold">
                🍎 Evita picos de insulina após o almoço e o cansaço do pós-refeição.
              </div>
            </div>

            <div className="bg-white border border-neutral-100 p-8 rounded-[32px] md:col-span-2 shadow-sm space-y-4">
              <div className="p-3 bg-brand-emerald/10 rounded-2xl inline-block text-brand-emerald mb-2">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-brand-forest">Fichas de Treino Completas (Casa ou Academia)</h3>
              <p className="text-xs sm:text-sm text-brand-forest/70 leading-relaxed">
                Planos de treino periodizados para queima máxima de calorias e fortalecimento muscular. Desde iniciantes a avançados. Cada ficha possui instruções de execução para garantir que você realize os movimentos com segurança absoluta e eficiência ideal.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[10px] bg-brand-cream px-2.5 py-1 rounded-lg font-bold text-brand-forest">Divisão Push/Pull/Legs</span>
                <span className="text-[10px] bg-brand-cream px-2.5 py-1 rounded-lg font-bold text-brand-forest">Cardio Estruturado</span>
                <span className="text-[10px] bg-brand-cream px-2.5 py-1 rounded-lg font-bold text-brand-forest">Core Abs e Fortalecimento</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. DETAILED PRICING PLANS SECTION */}
      <section id="precos" className="py-20 sm:py-32 bg-white relative">
        
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-brand-emerald/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <span className="text-[10px] sm:text-xs bg-brand-emerald/10 text-brand-emerald font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
              Planos Exclusivos
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-forest mt-4 tracking-tight">
              Acesso completo com valores extremamente acessíveis
            </h2>
            <p className="text-sm text-brand-forest/60 mt-3">
              Escolha o melhor plano para o seu bolso. Cancele o mensal quando quiser ou garanta economia máxima com o vitalício.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* PLAN 1: MENSAL */}
            <div className="bg-white border border-brand-emerald/10 rounded-[32px] p-8 sm:p-10 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between relative">
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-sunset/10 text-brand-sunset font-extrabold text-[10px] uppercase rounded-full mb-4">
                  🔥 Oferta de Lançamento
                </span>
                <h3 className="text-xl font-black text-brand-forest">Plano Mensal Flexível</h3>
                <p className="text-xs text-brand-forest/60 mt-2">Acesso recorrente mensal perfeito para quem quer testar e ver os resultados.</p>
                
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-xs text-brand-forest/50 line-through">R$ 59,90</span>
                  <span className="text-3xl sm:text-4xl font-black text-brand-forest">R$ 39,90</span>
                  <span className="text-xs text-brand-forest/60 font-semibold">/ mês</span>
                </div>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-2.5 text-xs text-brand-forest/80 font-medium">
                    <Check className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                    Acesso completo ao aplicativo e ferramentas
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-brand-forest/80 font-medium">
                    <Check className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                    Todas as atualizações incluídas no período
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-brand-forest/80 font-medium">
                    <Check className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                    Suporte padrão por e-mail e chat
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-brand-forest/80 font-medium">
                    <Check className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                    Cancelamento rápido quando desejar
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-brand-forest/80 font-medium">
                    <Check className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                    Sem contrato de fidelidade ou multas
                  </li>
                </ul>
              </div>

              <div className="mt-10">
                <a 
                  href={checkoutMensal} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full text-center block py-4 bg-brand-forest hover:bg-brand-forest/90 text-white font-extrabold text-xs rounded-2xl tracking-wider transition-all shadow-md uppercase cursor-pointer"
                >
                  ASSINAR AGORA (MENSAL)
                </a>
                <span className="block text-center text-[9px] text-brand-forest/40 mt-3 font-semibold">
                  Cobrança recorrente mensal. Cancele a qualquer momento na Kiwify.
                </span>
              </div>
            </div>

            {/* PLAN 2: VITALÍCIO (DESTACADO) */}
            <div className="bg-brand-forest text-white border-2 border-brand-emerald/40 rounded-[32px] p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              
              {/* Highlight ribbon */}
              <div className="absolute top-0 right-0 bg-brand-emerald text-white text-[9px] font-black uppercase tracking-wider py-1.5 px-8 translate-x-[25px] translate-y-[25px] rotate-45">
                Destaque
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-emerald/20 text-brand-emerald font-extrabold text-[10px] uppercase rounded-full mb-4">
                  ⭐ Melhor Custo-Benefício (Super Economia)
                </span>
                <h3 className="text-xl font-black">Acesso Vitalício Definitivo</h3>
                <p className="text-xs text-white/75 mt-2">Pague uma única vez e tenha acesso livre para sempre, sem nenhuma mensalidade futura.</p>
                
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-xs text-white/50 line-through">R$ 197,00</span>
                  <span className="text-3xl sm:text-4xl font-black text-brand-emerald">R$ 97,00</span>
                  <span className="text-xs text-white/70 font-semibold">/ pagamento único</span>
                </div>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-2.5 text-xs text-white/95 font-medium">
                    <Check className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                    <strong>Acesso Vitalício Para Sempre</strong>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-white/90 font-medium">
                    <Check className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                    Todas as atualizações e novos módulos futuros inclusos
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-white/90 font-medium">
                    <Check className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                    <strong>Suporte prioritário VIP</strong> na Área do Aluno
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-white/90 font-medium">
                    <Check className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                    Sem mensalidades ou assinaturas extras ocultas
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-white/90 font-medium">
                    <Check className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                    Mais de 50% de economia a longo prazo
                  </li>
                </ul>
              </div>

              <div className="mt-10">
                <a 
                  href={checkoutVitalicio} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full text-center block py-4 bg-brand-emerald hover:bg-brand-emerald/90 text-white font-black text-xs rounded-2xl tracking-wider transition-all shadow-lg shadow-brand-emerald/20 uppercase cursor-pointer"
                >
                  COMPRAR AGORA (ACESSO VITALÍCIO)
                </a>
                <span className="block text-center text-[9px] text-white/40 mt-3 font-semibold">
                  Pagamento único de R$97. Pix ou parcelado no cartão. 7 dias de garantia.
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 8. COMPARISON TABLE */}
      <section className="py-20 sm:py-32 bg-brand-cream/15 border-t border-brand-emerald/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-3xl font-black text-brand-forest">Compare e veja por que o Vitalício é sua melhor opção</h2>
          </div>

          <div className="bg-white border border-brand-emerald/10 rounded-[28px] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-brand-cream/50 border-b border-brand-emerald/10 font-bold text-brand-forest">
                  <th className="p-4 sm:p-5">Funcionalidade / Benefício</th>
                  <th className="p-4 sm:p-5 text-center">Mensal (R$39,90)</th>
                  <th className="p-4 sm:p-5 text-center text-brand-emerald bg-brand-emerald/5">Vitalício (R$97,00)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-brand-forest/90 font-medium">
                <tr>
                  <td className="p-4">Acesso total às ferramentas de cálculo</td>
                  <td className="p-4 text-center text-brand-emerald font-bold">Sim</td>
                  <td className="p-4 text-center text-brand-emerald font-bold bg-brand-emerald/5">Sim</td>
                </tr>
                <tr>
                  <td className="p-4">Leitor dinâmico do e-book completo</td>
                  <td className="p-4 text-center text-brand-emerald font-bold">Sim</td>
                  <td className="p-4 text-center text-brand-emerald font-bold bg-brand-emerald/5">Sim</td>
                </tr>
                <tr>
                  <td className="p-4">Sem mensalidades futuras</td>
                  <td className="p-4 text-center text-red-500 font-bold">Não</td>
                  <td className="p-4 text-center text-brand-emerald font-bold bg-brand-emerald/5">Sim (Zero Taxas)</td>
                </tr>
                <tr>
                  <td className="p-4">Suporte ao Aluno</td>
                  <td className="p-4 text-center">Básico</td>
                  <td className="p-4 text-center text-brand-emerald font-bold bg-brand-emerald/5">Prioritário VIP</td>
                </tr>
                <tr>
                  <td className="p-4">Atualizações e novos conteúdos gratuitos</td>
                  <td className="p-4 text-center">Durante a assinatura</td>
                  <td className="p-4 text-center text-brand-emerald font-bold bg-brand-emerald/5">Para Sempre</td>
                </tr>
                <tr className="bg-brand-cream/10">
                  <td className="p-4 font-bold text-brand-forest">Custo em 12 meses</td>
                  <td className="p-4 text-center text-brand-forest font-bold">R$ 478,80</td>
                  <td className="p-4 text-center text-brand-emerald font-extrabold bg-brand-emerald/5">R$ 97,00 (Economia de 79%)</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* 9. STATS SECTION WITH ANIMATED FEEL */}
      <section className="py-16 sm:py-24 bg-brand-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-5xl font-black text-brand-emerald">+{stats.users}</div>
              <p className="text-[10px] sm:text-xs text-white/60 font-bold uppercase tracking-wider mt-2">Alunos Ativos</p>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-black text-brand-emerald">+{stats.plans}</div>
              <p className="text-[10px] sm:text-xs text-white/60 font-bold uppercase tracking-wider mt-2">Planos e Cálculos Gerados</p>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-black text-brand-emerald">{stats.rating} / 5</div>
              <p className="text-[10px] sm:text-xs text-white/60 font-bold uppercase tracking-wider mt-2">Avaliação Média</p>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-black text-brand-emerald">{stats.satisfaction}%</div>
              <p className="text-[10px] sm:text-xs text-white/60 font-bold uppercase tracking-wider mt-2">Satisfação Comprovada</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. PERSUASIVE TESTIMONIALS SECTION */}
      <section className="py-20 sm:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
            <span className="text-[10px] sm:text-xs bg-brand-emerald/10 text-brand-emerald font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
              Transformação Real
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-forest mt-4 tracking-tight">
              Veja os depoimentos de quem já mudou de vida com o portal
            </h2>
            <p className="text-xs sm:text-sm text-brand-forest/50 mt-3 font-medium">
              Toque ou passe o mouse para pausar a rotação automática.
            </p>
          </div>

          {/* Carousel Viewport Wrapper */}
          <div 
            className="relative px-2 sm:px-12"
            onMouseEnter={() => setIsTestimonialPaused(true)}
            onMouseLeave={() => setIsTestimonialPaused(false)}
            onTouchStart={() => setIsTestimonialPaused(true)}
            onTouchEnd={() => setIsTestimonialPaused(false)}
          >
            {/* Navigation Buttons - Hidden on very small screens, visible elsewhere */}
            <button
              onClick={() => {
                setTestimonialIndex((prev) => {
                  const maxIndex = testimonialsList.length - visibleTestimonials;
                  return prev === 0 ? maxIndex : prev - 1;
                });
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border border-brand-emerald/10 flex items-center justify-center text-brand-forest hover:bg-brand-cream hover:text-brand-emerald transition-all shadow-sm hover:shadow-md cursor-pointer select-none"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => {
                setTestimonialIndex((prev) => {
                  const maxIndex = testimonialsList.length - visibleTestimonials;
                  return prev >= maxIndex ? 0 : prev + 1;
                });
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border border-brand-emerald/10 flex items-center justify-center text-brand-forest hover:bg-brand-cream hover:text-brand-emerald transition-all shadow-sm hover:shadow-md cursor-pointer select-none"
              aria-label="Próximo depoimento"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Testimonials Track */}
            <div className="overflow-hidden py-4">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translate3d(-${testimonialIndex * (100 / visibleTestimonials)}%, 0, 0)`
                }}
              >
                {testimonialsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 px-2 sm:px-3"
                    style={{
                      width: `${100 / visibleTestimonials}%`
                    }}
                  >
                    <div className="h-full bg-brand-cream/20 border border-brand-emerald/5 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md hover:border-brand-emerald/10 transition-all">
                      <div className="space-y-4">
                        {/* Rating Stars */}
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-brand-sunset text-brand-sunset" />
                          ))}
                        </div>
                        {/* Quote Text */}
                        <p className="text-xs sm:text-sm text-brand-forest/80 leading-relaxed italic min-h-[100px] flex items-center">
                          {item.text}
                        </p>
                      </div>
                      {/* Author Info */}
                      <div className="pt-4 flex items-center gap-3 border-t border-brand-emerald/10 mt-4">
                        <div className="w-10 h-10 rounded-full bg-brand-emerald/20 flex items-center justify-center font-bold text-brand-emerald text-xs uppercase shrink-0">
                          {item.initials}
                        </div>
                        <div className="overflow-hidden">
                          <span className="block font-bold text-xs text-brand-forest truncate">{item.name}</span>
                          <span className="block text-[10px] text-neutral-400 truncate">{item.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-4 sm:mt-8">
              {[...Array(testimonialsList.length - visibleTestimonials + 1)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    testimonialIndex === i 
                      ? 'w-6 bg-brand-emerald' 
                      : 'w-2 bg-brand-emerald/20 hover:bg-brand-emerald/40'
                  }`}
                  aria-label={`Ir para slide ${i + 1}`}
                />
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* 11. 100% SECURE GUARANTEE SECTION */}
      <section className="py-20 sm:py-28 bg-brand-cream/35 border-y border-brand-emerald/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-brand-emerald/10 text-brand-emerald rounded-full flex items-center justify-center border border-brand-emerald/20">
            <Award className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-brand-forest tracking-tight">
            Garantia de Satisfação de 7 dias ou seu dinheiro de volta
          </h2>
          <p className="text-xs sm:text-base text-brand-forest/70 font-medium leading-relaxed max-w-2xl mx-auto">
            Garantimos a qualidade do nosso material. Se no prazo de 7 dias a partir da compra você achar que o portal não agrega valor ou que as ferramentas não auxiliam sua reeducação alimentar, nós reembolsamos 100% do seu valor pago. Sem perguntas ou burocracia.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-emerald/15 text-brand-emerald text-xs font-black rounded-lg">
            🛡 Transação protegida e garantida pela Kiwify
          </div>
        </div>
      </section>

      {/* 12. FAQ ACCORDION SECTION (10 items as requested) */}
      <section id="faq" className="py-20 sm:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-[10px] sm:text-xs bg-brand-emerald/10 text-brand-emerald font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
              Dúvidas frequentes
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-forest mt-4 tracking-tight">
              Tudo o que você precisa saber antes de assinar
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-brand-cream/20 border border-brand-emerald/5 hover:border-brand-emerald/25 rounded-2xl transition-all overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left p-5 sm:p-6 flex justify-between items-center gap-4 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-black text-brand-forest leading-snug">{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-brand-emerald shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs text-brand-forest/75 leading-relaxed font-medium border-t border-brand-emerald/5 pt-3">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 13. FINAL CLOSING CALL TO ACTION SECTION */}
      <section className="py-20 sm:py-32 bg-brand-forest text-white relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-emerald/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-emerald/20 text-brand-emerald text-[10px] font-extrabold uppercase tracking-widest rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Comece sua transformação hoje mesmo
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
            Pare de adiar sua saúde. Tenha acesso imediato a todas as ferramentas!
          </h2>
          <p className="text-xs sm:text-base text-white/70 font-medium max-w-xl mx-auto leading-relaxed">
            Por apenas R$97,00 no plano vitalício, você garante o livro interativo mais completo e todas as ferramentas para acelerar seus objetivos sem nenhuma taxa recorrente.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#precos" 
              className="w-full sm:w-auto py-4 px-8 bg-brand-emerald hover:bg-brand-emerald/90 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Garantir Meu Acesso Vitalício <ArrowRight className="w-4 h-4" />
            </a>
            <button 
              onClick={() => onGoToAuth('register')}
              className="w-full sm:w-auto py-4 px-8 bg-white/10 hover:bg-white/15 text-white font-black text-sm rounded-2xl transition-all border border-white/15 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Já tenho cadastro / Criar Senha
            </button>
          </div>

          <p className="text-[10px] text-white/40 font-bold">
            🔒 Pagamento 100% Seguro • Liberação imediata na Kiwify • Garantia Incondicional de 7 dias
          </p>
        </div>
      </section>

      {/* 14. FOOTER */}
      <footer className="bg-white border-t border-neutral-100 py-12 text-xs text-brand-forest/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-emerald text-white rounded-xl font-bold text-xs">
                  ES
                </div>
                <span className="text-base font-black text-brand-forest tracking-tight">Emagrecer Saúde</span>
              </div>
              <p className="text-xs text-brand-forest/60 leading-relaxed">
                As melhores ferramentas e conhecimento científico para ajudar você a alcançar o peso saudável ideal com reeducação duradoura.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-brand-forest mb-4">Acesso Rápido</h4>
              <ul className="space-y-2">
                <li><a href="#beneficios" className="hover:text-brand-emerald transition-colors">Benefícios</a></li>
                <li><a href="#funcionamento" className="hover:text-brand-emerald transition-colors">Como Funciona</a></li>
                <li><a href="#recursos" className="hover:text-brand-emerald transition-colors">Recursos</a></li>
                <li><a href="#precos" className="hover:text-brand-emerald transition-colors">Planos e Preços</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-brand-forest mb-4">Legal & Contato</h4>
              <ul className="space-y-2">
                <li><a href="#faq" className="hover:text-brand-emerald transition-colors">Dúvidas Frequentes (FAQ)</a></li>
                <li><span className="text-neutral-400 block cursor-not-allowed">Termos de Uso</span></li>
                <li><span className="text-neutral-400 block cursor-not-allowed">Políticas de Privacidade</span></li>
                <li><span className="block text-neutral-500 font-semibold mt-1">E-mail: contato@emagrecersaude.com</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-brand-forest mb-4">Disclaimer de Saúde</h4>
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Aviso importante: As ferramentas e informações disponibilizadas neste portal têm caráter exclusivamente educativo e informativo. Elas não substituem, em hipótese alguma, consultas, diagnósticos ou tratamentos médicos e nutricionais individualizados. Consulte sempre seu médico de confiança.
              </p>
            </div>

          </div>

          <div className="border-t border-neutral-100 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-400 text-[11px]">
            <p>© 2026 Emagrecer Saúde. Todos os direitos reservados. Rigor científico e compromisso com o seu bem-estar.</p>
            <div className="flex gap-4">
              <span className="hover:text-brand-emerald transition-colors cursor-pointer">Instagram</span>
              <span className="hover:text-brand-emerald transition-colors cursor-pointer">YouTube</span>
              <span className="hover:text-brand-emerald transition-colors cursor-pointer">Facebook</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
