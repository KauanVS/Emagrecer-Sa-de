import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  LogOut, 
  RefreshCw, 
  Download, 
  Upload, 
  FileText, 
  ExternalLink, 
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { googleSignIn, logout, initAuth, getAccessToken } from '../firebaseAuth';
import { calculateCaloricDetails } from '../utils';
import { ProgressLog } from '../types';

interface DriveFile {
  id: string;
  name: string;
  webViewLink: string;
  createdTime: string;
}

export default function GoogleSyncTool() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<string | null>(null); // 'drive_upload' | 'drive_restore' | 'gmail_send' etc.
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Email form state
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [emailType, setEmailType] = useState<'calories' | 'plate' | 'workout' | 'diary'>('calories');

  // Confirmation state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'backup' | 'restore' | 'email';
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    // Check auth on load
    const unsubscribe = initAuth(
      (firebaseUser, accessToken) => {
        setUser(firebaseUser);
        setToken(accessToken);
        setRecipientEmail(firebaseUser.email || '');
        setLoading(false);
        fetchDriveFiles(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setRecipientEmail(result.user.email || '');
        fetchDriveFiles(result.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setError('Falha ao conectar com o Google. Certifique-se de aceitar as permissões necessárias.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError(null);
    setSuccess(null);
    try {
      await logout();
      setUser(null);
      setToken(null);
      setFiles([]);
    } catch (err) {
      console.error(err);
      setError('Falha ao desconectar.');
    }
  };

  const fetchDriveFiles = async (accessToken: string) => {
    try {
      // Fetch files containing 'Emagrecer' in their names
      const query = encodeURIComponent("name contains 'Emagrecer' and trashed = false");
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&fields=files(id,name,webViewLink,createdTime)&pageSize=10`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  // Helper to base64url encode for Gmail API
  const base64urlEncode = (str: string): string => {
    const utf8Bytes = new TextEncoder().encode(str);
    const base64 = btoa(String.fromCharCode(...utf8Bytes));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  // Safe subject encoding for Gmail UTF-8
  const encodeSubject = (subject: string): string => {
    try {
      return `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
    } catch (e) {
      return subject;
    }
  };

  // Get active data from localStorage
  const getCalorieData = () => {
    const savedInputs = localStorage.getItem('emagrecer_saude_calories_inputs');
    const savedResults = localStorage.getItem('emagrecer_saude_calories_results');
    
    let inputs = {
      gender: 'female',
      age: 30,
      weight: 70,
      height: 165,
      activityLevel: 'moderate',
      goal: 'healthy_loss',
    };
    
    if (savedInputs) {
      try { inputs = JSON.parse(savedInputs); } catch (e) {}
    }
    
    const results = savedResults ? JSON.parse(savedResults) : calculateCaloricDetails(inputs as any);
    return { inputs, results };
  };

  const getPlateData = () => {
    const savedPlate = localStorage.getItem('emagrecer_saude_plate_state');
    if (savedPlate) {
      try {
        return JSON.parse(savedPlate);
      } catch (e) {}
    }
    return null;
  };

  const getWorkoutData = () => {
    const env = localStorage.getItem('emagrecer_saude_workout_env') || 'casa';
    const level = localStorage.getItem('emagrecer_saude_workout_level') || 'iniciante';
    return { env, level };
  };

  const getProgressLogs = (): ProgressLog[] => {
    const saved = localStorage.getItem('emagrecer_saude_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  };

  // --- GOOGLE DRIVE OPERATIONS ---

  const findExistingFile = async (fileName: string, accessToken: string): Promise<string | null> => {
    try {
      const query = encodeURIComponent(`name = '${fileName}' and trashed = false`);
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.files && data.files.length > 0) {
          return data.files[0].id;
        }
      }
    } catch (e) {
      console.error('Error finding file:', e);
    }
    return null;
  };

  const saveFileToDrive = async (fileName: string, mimeType: string, content: string) => {
    if (!token) return;
    setSyncing('drive_upload');
    setError(null);
    setSuccess(null);

    try {
      // Check if file exists to update, or create new
      const existingId = await findExistingFile(fileName, token);
      let fileId = existingId;

      if (!fileId) {
        // Create file metadata first
        const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: fileName,
            mimeType: mimeType,
          }),
        });

        if (!createRes.ok) throw new Error('Falha ao criar metadados do arquivo.');
        const fileMetadata = await createRes.json();
        fileId = fileMetadata.id;
      }

      // Upload the actual media content (PATCH)
      const uploadRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': mimeType,
          },
          body: content,
        }
      );

      if (!uploadRes.ok) throw new Error('Falha ao fazer upload do conteúdo.');

      setSuccess(`Arquivo "${fileName}" salvo com sucesso no seu Google Drive!`);
      fetchDriveFiles(token);
    } catch (err: any) {
      console.error(err);
      setError(`Erro ao salvar no Drive: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setSyncing(null);
    }
  };

  const handleBackupCaloriePlan = () => {
    const { inputs, results } = getCalorieData();
    const activityLabels: Record<string, string> = {
      sedentary: 'Sedentário (Pouco ou nenhum exercício)',
      light: 'Atividade Leve (1-3 dias/semana)',
      moderate: 'Atividade Moderada (3-5 dias/semana)',
      active: 'Muito Ativo (Exercício diário intenso)',
      very_active: 'Atleta (Exercício pesado 2x ao dia)'
    };
    const goalLabels: Record<string, string> = {
      healthy_loss: 'Emagrecimento Saudável (-450 kcal/dia)',
      moderate_loss: 'Emagrecimento Suave (-250 kcal/dia)',
      maintenance: 'Manter o Peso Atual'
    };

    const text = `=====================================================
EMAGRECER SAÚDE - PLANO CALÓRICO INDIVIDUALIZADO
=====================================================
Gerado em: ${new Date().toLocaleString('pt-BR')}

DADOS FISIOLÓGICOS INSERIDOS:
- Gênero: ${inputs.gender === 'male' ? 'Masculino' : 'Feminino'}
- Idade: ${inputs.age} anos
- Peso Atual: ${inputs.weight} kg
- Altura: ${inputs.height} cm
- Nível de Atividade: ${activityLabels[inputs.activityLevel] || inputs.activityLevel}
- Objetivo Definido: ${goalLabels[inputs.goal] || inputs.goal}

RESULTADOS METABÓLICOS RECOMENDADOS (Parte 3 do Livro):
- Taxa Metabólica Basal (TMB): ${results.tmb} kcal/dia
- Gasto Energético Total (VET): ${results.vet} kcal/dia
- META CALÓRICA DIÁRIA: ${results.targetCalories} kcal/dia
- Recomendação de Água Diária: ${results.waterMl} ml (${(results.waterMl / 1000).toFixed(1)}L)

DIVISÃO DE MACRONUTRIENTES DIÁRIOS:
1. PROTEÍNAS: ${results.proteinGrams}g (${results.proteinPercent}% - Calorias: ${results.proteinGrams * 4} kcal)
   * Essencial para manutenção de massa magra e saciedade prolongada.
2. GORDURAS SAUDÁVEIS: ${results.fatGrams}g (${results.fatPercent}% - Calorias: ${results.fatGrams * 9} kcal)
   * Fundamental para regulação hormonal e absorção de vitaminas lipossolúveis.
3. CARBOIDRATOS COMPLEXOS: ${results.carbGrams}g (${results.carbPercent}% - Calorias: ${results.carbGrams * 4} kcal)
   * Fonte primária de energia para os treinos de força e metabólicos.

=====================================================
Aviso: Este plano é calculado com fórmulas científicas padrão. Consulte sempre um médico ou nutricionista antes de iniciar mudanças alimentares profundas.`;

    setConfirmAction({
      type: 'backup',
      message: 'Deseja exportar e salvar seu Plano Calórico personalizado no Google Drive? Se o arquivo já existir, ele será atualizado.',
      onConfirm: () => saveFileToDrive('Emagrecer_Saude_Plano_Calorico.txt', 'text/plain', text)
    });
  };

  const handleBackupMealPlate = () => {
    const plate = getPlateData();
    if (!plate || (!plate.selectedVeg && !plate.selectedProtein && !plate.selectedCarb)) {
      setError('Por favor, monte seu prato saudável no simulador antes de tentar exportá-lo!');
      return;
    }

    const text = `=====================================================
EMAGRECER SAÚDE - PRATO SAUDÁVEL PERSONALIZADO
=====================================================
Gerado em: ${new Date().toLocaleString('pt-BR')}

ESTRUTURA DO SEU PRATO SIMULADO (Proporções Ideais - Parte 4):

1. VEGETAIS E SALADAS (Meta: 50% do volume do prato)
   - Alimento Selecionado: ${plate.selectedVeg ? plate.selectedVeg.name : 'Nenhum selecionado'}
   - Porção Simulada: ${plate.selectedVeg ? `${plate.vegWeight}g` : '0g'}
   - Benefício Científico: ${plate.selectedVeg ? plate.selectedVeg.benefit : ''}

2. PROTEÍNA MAGRA (Meta: 25% do volume do prato)
   - Alimento Selecionado: ${plate.selectedProtein ? plate.selectedProtein.name : 'Nenhum selecionado'}
   - Porção Simulada: ${plate.selectedProtein ? `${plate.proteinWeight}g` : '0g'}
   - Benefício Científico: ${plate.selectedProtein ? plate.selectedProtein.benefit : ''}

3. CARBOIDRATO COMPLEXO / LEGUMINOSA (Meta: 25% do volume do prato)
   - Alimento Selecionado: ${plate.selectedCarb ? plate.selectedCarb.name : 'Nenhum selecionado'}
   - Porção Simulada: ${plate.selectedCarb ? `${plate.carbWeight}g` : '0g'}
   - Benefício Científico: ${plate.selectedCarb ? plate.selectedCarb.benefit : ''}

-----------------------------------------------------
ESTATÍSTICAS NUTRICIONAIS DO PRATO:
- Total Estimado de Calorias: ${plate.totalCalories} kcal

* DIRETRIZ PRÁTICA: Montar o prato nesta exata proporção visual garante alto aporte de fibras e proteínas com densidade calórica controlada, facilitando o déficit calórico sem passar fome!`;

    setConfirmAction({
      type: 'backup',
      message: 'Deseja exportar e salvar o design de Prato Saudável no seu Google Drive?',
      onConfirm: () => saveFileToDrive('Emagrecer_Saude_Prato_Sugerido.txt', 'text/plain', text)
    });
  };

  const handleBackupWorkout = () => {
    const { env, level } = getWorkoutData();
    const envLabel = env === 'casa' ? 'Treino em Casa' : 'Treino na Academia';
    const lvlLabel = level.charAt(0).toUpperCase() + level.slice(1);

    const text = `=====================================================
EMAGRECER SAÚDE - FICHA DE TREINO INDIVIDUALIZADA
=====================================================
Ambiente Selecionado: ${envLabel}
Nível de Aptidão: ${lvlLabel}
Gerado em: ${new Date().toLocaleString('pt-BR')}

DIRETRIZ DE ATIVIDADE FÍSICA (Parte 5 do Livro):
O exercício físico serve como estimulador de massa muscular (retendo tecido magro ativo durante o emagrecimento) e regulador metabólico.

ROUTINE DE EXERCÍCIOS RECOMENDADA:
${env === 'casa' && level === 'iniciante' ? `
* Agachamento Livre na Cadeira (3 séries de 12-15 reps)
  - Instruções: Agache devagar jogando os quadris para trás até tocar a cadeira e levante.
* Flexão de Braço na Parede (3 séries de 10-12 reps)
  - Instruções: Flexione os cotovelos contra a parede mantendo o abdômen firme.
* Elevação Pélvica / Ponte (3 séries de 15 reps)
  - Instruções: Deitado, contraia os glúteos e eleve os quadris em direção ao teto.
* Prancha Isométrica (3 séries de 20-30 segundos)
  - Instruções: Sustente o corpo alinhado apoiando apenas antebraços e pontas dos pés.` : ''}
${env === 'casa' && level === 'intermediario' ? `
* Afundo Alternado / Passada (4 séries de 10 reps/perna)
  - Instruções: Dê um passo longo à frente e desça o quadril a 90 graus. Alterne pernas.
* Flexão de Joelhos no Chão (4 séries de 8-12 reps)
  - Instruções: Apoie mãos e joelhos no chão e desça o tronco de forma controlada.
* Agachamento Sumô (4 séries de 15 reps)
  - Instruções: Afaste pés, aponte pontas dos pés para fora e agache profundamente.
* Tríceps Banco na Cadeira (4 séries de 12 reps)
  - Instruções: Apoie mãos na borda traseira da cadeira, flexione cotovelos descendo o quadril.
* Abdominal Remador (4 séries de 15 reps)
  - Instruções: Deitado de costas, flexione joelhos e sente-se abraçando as pernas simultaneamente.` : ''}
${env === 'casa' && level === 'avancado' ? `
* Burpees Completos (4 séries de 10 reps)
  - Instruções: Agache, flexão no chão, levante-se explosivamente com um salto.
* Agachamento com Salto (4 séries de 15 reps)
  - Instruções: Agache livre e salte de forma explosiva amortecendo a queda.
* Flexão de Braço Padrão (4 séries de 12 reps)
  - Instruções: Prancha corporal completa e flexão tradicional de peitoral.
* Agachamento Búlgaro (3 séries de 10 reps/perna)
  - Instruções: Pé apoiado atrás na cadeira, agache com a perna dianteira.
* Polichinelos Rápidos (4 séries de 40 reps)
  - Instruções: Ritmo intenso para manter batimentos altos.` : ''}
${env === 'academia' && level === 'iniciante' ? `
* Leg Press 45° (3 séries de 12 reps)
  - Instruções: Apoie pés na largura dos ombros, flexione joelhos até 90 graus e empurre.
* Puxada Aberta Pulley Costas (3 séries de 12 reps)
  - Instruções: Puxe a barra em direção ao peito, espremendo as escápulas.
* Supino Vertical Máquina (3 séries de 12 reps)
  - Instruções: Empurre os manípulos contraindo o peitoral, retorne devagar.
* Cadeira Extensora (3 séries de 15 reps)
  - Instruções: Estenda os joelhos sustentando 1 segundo na contração máxima.` : ''}
${env === 'academia' && level === 'intermediario' ? `
* Agachamento Livre com Barra (4 séries de 10 reps)
  - Instruções: Mantenha a coluna reta e desça os quadris abaixo da linha dos joelhos.
* Supino Reto com Halteres (4 séries de 10 reps)
  - Instruções: Excelente para estabilização de ombro e peitoral.
* Stiff com Halteres (3 séries de 12 reps)
  - Instruções: Desça o tronco com pernas semiestendidas, sentindo os glúteos.
* Remada Baixa Triângulo (4 séries de 10 reps)
  - Instruções: Puxe o triângulo rente à barriga mantendo as costas eretas.` : ''}
${env === 'academia' && level === 'avancado' ? `
* Agachamento Livre com Barra (4 séries de 8-10 reps)
  - Instruções: Pirâmide progressiva com foco em profundidade.
* Leg Press 45° / Drop Set (4 séries de 12 + Drop)
  - Instruções: Faça 12 repetições, reduza peso 30% e faça até a falha sem descanso.
* Stiff com Barra Lento (4 séries de 10 reps)
  - Instruções: Foco extremo na cadência da descida (excêntrica de 4 segundos).
* Cadeira Extensora Isométrica (3 séries de 10 reps)
  - Instruções: Estenda e segure 3 segundos no pico de contração em cada rep.` : ''}

=====================================================
Aviso de Segurança: Respeite os limites da sua articulação. Mantenha-se hidratado e aquecido de forma adequada antes das séries de trabalho de força.`;

    setConfirmAction({
      type: 'backup',
      message: 'Deseja exportar e salvar esta Ficha de Treino no seu Google Drive?',
      onConfirm: () => saveFileToDrive('Emagrecer_Saude_Ficha_Treino.txt', 'text/plain', text)
    });
  };

  const handleBackupWeightLogs = () => {
    const logs = getProgressLogs();
    if (logs.length === 0) {
      setError('Seu diário de progresso está vazio! Adicione algumas medidas antes de tentar fazer backup.');
      return;
    }

    const payload = JSON.stringify(logs, null, 2);

    setConfirmAction({
      type: 'backup',
      message: `Deseja criar um arquivo de backup com os seus ${logs.length} registros do diário no Google Drive? Isso protegerá seus dados contra perdas de cache do navegador.`,
      onConfirm: () => saveFileToDrive('Emagrecer_Saude_Diario_Medidas_Backup.json', 'application/json', payload)
    });
  };

  const handleRestoreWeightLogs = async () => {
    if (!token) return;
    setSyncing('drive_restore');
    setError(null);
    setSuccess(null);

    try {
      const existingId = await findExistingFile('Emagrecer_Saude_Diario_Medidas_Backup.json', token);
      if (!existingId) {
        throw new Error('Nenhum arquivo de backup "Emagrecer_Saude_Diario_Medidas_Backup.json" foi encontrado no seu Google Drive.');
      }

      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${existingId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Falha ao baixar o arquivo de backup do Drive.');
      const backupLogs = await res.json();

      if (!Array.isArray(backupLogs)) {
        throw new Error('O arquivo de backup possui um formato inválido.');
      }

      setConfirmAction({
        type: 'restore',
        message: `ATENÇÃO: Deseja importar os ${backupLogs.length} registros salvos no Google Drive? Isso substituirá seus dados locais atuais. Esta ação não pode ser desfeita.`,
        onConfirm: () => {
          localStorage.setItem('emagrecer_saude_logs', JSON.stringify(backupLogs));
          setSuccess(`Restauração concluída! ${backupLogs.length} registros foram importados do Google Drive. Recarregue a página ou acesse o Diário para visualizar.`);
          // Refresh page event or update state locally
          window.dispatchEvent(new Event('storage'));
        }
      });

    } catch (err: any) {
      console.error(err);
      setError(`Erro na restauração: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setSyncing(null);
    }
  };


  // --- GMAIL OPERATIONS ---

  const handleSendGmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !recipientEmail) return;

    setSyncing('gmail_send');
    setError(null);
    setSuccess(null);

    try {
      let subject = '';
      let htmlBody = '';

      if (emailType === 'calories') {
        const { inputs, results } = getCalorieData();
        const goalLabel = inputs.goal === 'healthy_loss' ? 'Emagrecimento Saudável' : inputs.goal === 'moderate_loss' ? 'Emagrecimento Suave' : 'Manutenção de Peso';
        subject = 'Emagrecer Saúde - Plano de Calorias & Macros';
        htmlBody = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
            <div style="background-color: #0d9488; padding: 24px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Emagrecer Saúde Premium</h1>
              <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Seu Plano Metabólico Científico Baseado na Parte 3</p>
            </div>
            <div style="padding: 24px; background-color: #fcfbf9;">
              <p>Olá,</p>
              <p>Conforme calculado no simulador interativo, aqui está o detalhamento ideal da sua ingestão diária de energia e macronutrientes para alcançar o objetivo de <strong>${goalLabel}</strong>:</p>
              
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #0d9488;">
                <h3 style="margin: 0 0 12px 0; color: #0d9488; font-size: 16px;">Meta Energética Diária</h3>
                <div style="font-size: 32px; font-weight: 900; color: #0f172a; margin-bottom: 4px;">${results.targetCalories} <span style="font-size: 16px; font-weight: normal; color: #64748b;">kcal / dia</span></div>
                <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Fórmula de Harris-Benedict (Basal: ${results.tmb} kcal | Gasto Total VET: ${results.vet} kcal)</div>
              </div>

              <h3 style="color: #0f172a; border-bottom: 1px solid #e2e8f0; pb: 8px; font-size: 15px; margin-top: 24px;">Meta de Macronutrientes e Hidratação</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #334155;">🥩 Proteínas (Saciedade & Massa Magra):</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #0f172a;">${results.proteinGrams}g <span style="font-size:11px; font-weight:normal; color:#64748b;">(${results.proteinPercent}%)</span></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #334155;">🥑 Gorduras Saudáveis (Hormonal):</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #0f172a;">${results.fatGrams}g <span style="font-size:11px; font-weight:normal; color:#64748b;">(${results.fatPercent}%)</span></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #334155;">🌾 Carboidratos Complexos (Energia):</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #0f172a;">${results.carbGrams}g <span style="font-size:11px; font-weight:normal; color:#64748b;">(${results.carbPercent}%)</span></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #0d9488;">💧 Recomendação de Água:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #0d9488;">${results.waterMl} ml (${(results.waterMl / 1000).toFixed(1)} Litros)</td>
                </tr>
              </table>

              <div style="margin-top: 24px; padding: 12px; background-color: #fef3c7; border-radius: 6px; font-size: 11px; color: #78350f;">
                <strong>Importante:</strong> Consulte sempre seu nutricionista ou médico. O cálculo serve como estimativa inicial baseada em seu perfil.
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              Emagrecer Saúde Premium © 2026. Todos os direitos reservados.
            </div>
          </div>
        `;
      } else if (emailType === 'plate') {
        const plate = getPlateData();
        if (!plate || (!plate.selectedVeg && !plate.selectedProtein && !plate.selectedCarb)) {
          throw new Error('Por favor, monte seu prato no simulador para enviá-lo por e-mail!');
        }
        subject = 'Emagrecer Saúde - Meu Prato Saudável Simulado';
        htmlBody = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
            <div style="background-color: #0d9488; padding: 24px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Meu Prato Saudável Simulado</h1>
              <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Composição e Proporções Científicas</p>
            </div>
            <div style="padding: 24px; background-color: #fcfbf9;">
              <p>Aqui está o design do seu prato balanceado estruturado com base nas porções saudáveis:</p>
              
              <div style="background-color: #ecfdf5; border-radius: 8px; padding: 14px; margin-bottom: 20px; text-align: center; font-size: 18px; font-weight: bold; color: #065f46; border: 1px solid #a7f3d0;">
                Calorias Totais Estimadas: ${plate.totalCalories} kcal
              </div>

              <div style="margin-bottom: 16px;">
                <h4 style="margin: 0; color: #0d9488; font-size: 14px;">🥗 50% - Vegetais & Fibras:</h4>
                <div style="padding-left: 12px; font-size: 13px; color: #334155; margin-top: 4px;">
                  <strong>${plate.selectedVeg ? `${plate.selectedVeg.name} (${plate.vegWeight}g)` : 'Nenhum selecionado'}</strong><br/>
                  ${plate.selectedVeg ? plate.selectedVeg.benefit : ''}
                </div>
              </div>

              <div style="margin-bottom: 16px;">
                <h4 style="margin: 0; color: #f59e0b; font-size: 14px;">🥩 25% - Proteína Magra:</h4>
                <div style="padding-left: 12px; font-size: 13px; color: #334155; margin-top: 4px;">
                  <strong>${plate.selectedProtein ? `${plate.selectedProtein.name} (${plate.proteinWeight}g)` : 'Nenhum selecionado'}</strong><br/>
                  ${plate.selectedProtein ? plate.selectedProtein.benefit : ''}
                </div>
              </div>

              <div style="margin-bottom: 16px;">
                <h4 style="margin: 0; color: #3b82f6; font-size: 14px;">🌾 25% - Carboidrato Complexo / Leguminosa:</h4>
                <div style="padding-left: 12px; font-size: 13px; color: #334155; margin-top: 4px;">
                  <strong>${plate.selectedCarb ? `${plate.selectedCarb.name} (${plate.carbWeight}g)` : 'Nenhum selecionado'}</strong><br/>
                  ${plate.selectedCarb ? plate.selectedCarb.benefit : ''}
                </div>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              Emagrecer Saúde Premium © 2026. Todos os direitos reservados.
            </div>
          </div>
        `;
      } else if (emailType === 'workout') {
        const { env, level } = getWorkoutData();
        const envLabel = env === 'casa' ? 'Treino Corporal em Casa' : 'Treino de Força na Academia';
        const lvlLabel = level.charAt(0).toUpperCase() + level.slice(1);
        subject = `Emagrecer Saúde - Ficha de Treino (${lvlLabel})`;
        
        let exercisesHtml = '';
        if (env === 'casa' && level === 'iniciante') {
          exercisesHtml = `
            <li style="margin-bottom: 12px;"><strong>Agachamento Livre na Cadeira:</strong> 3 séries de 12-15 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Agache devagar jogando os quadris para trás até tocar a cadeira e levante.</span></li>
            <li style="margin-bottom: 12px;"><strong>Flexão de Braço na Parede:</strong> 3 séries de 10-12 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Flexione os cotovelos contra a parede mantendo o abdômen firme.</span></li>
            <li style="margin-bottom: 12px;"><strong>Elevação Pélvica / Ponte:</strong> 3 séries de 15 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Deitado, contraia os glúteos e eleve os quadris em direção ao teto.</span></li>
            <li style="margin-bottom: 12px;"><strong>Prancha Isométrica:</strong> 3 séries de 20-30 segundos.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Sustente o corpo alinhado apoiando apenas antebraços e pontas dos pés.</span></li>
          `;
        } else if (env === 'casa' && level === 'intermediario') {
          exercisesHtml = `
            <li style="margin-bottom: 12px;"><strong>Afundo Alternado:</strong> 4 séries de 10 reps/perna.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Passo à frente desça o quadril a 90 graus. Alterne pernas.</span></li>
            <li style="margin-bottom: 12px;"><strong>Flexão de Joelhos no Chão:</strong> 4 séries de 8-12 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Apoie joelhos no chão e desça o tronco controlado.</span></li>
            <li style="margin-bottom: 12px;"><strong>Agachamento Sumô:</strong> 4 séries de 15 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Afaste pés para fora e agache profundamente.</span></li>
            <li style="margin-bottom: 12px;"><strong>Tríceps Banco na Cadeira:</strong> 4 séries de 12 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Apoie mãos na cadeira e flexione cotovelos descendo o quadril.</span></li>
            <li style="margin-bottom: 12px;"><strong>Abdominal Remador:</strong> 4 séries de 15 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Deitado de costas, flexione joelhos e sente-se abraçando as pernas.</span></li>
          `;
        } else if (env === 'casa' && level === 'avancado') {
          exercisesHtml = `
            <li style="margin-bottom: 12px;"><strong>Burpees Completos:</strong> 4 séries de 10 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Agache, flexão no chão, levante-se explosivamente com salto.</span></li>
            <li style="margin-bottom: 12px;"><strong>Agachamento com Salto:</strong> 4 séries de 15 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Agache e salte de forma explosiva controlando a queda.</span></li>
            <li style="margin-bottom: 12px;"><strong>Flexão de Braço Padrão:</strong> 4 séries de 12 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Prancha completa e flexão de peito.</span></li>
            <li style="margin-bottom: 12px;"><strong>Agachamento Búlgaro:</strong> 3 séries de 10 reps/perna.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Pé apoiado atrás na cadeira, agache com a perna dianteira.</span></li>
            <li style="margin-bottom: 12px;"><strong>Polichinelos Rápidos:</strong> 4 séries de 40 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Ritmo intenso de polichinelo.</span></li>
          `;
        } else if (env === 'academia' && level === 'iniciante') {
          exercisesHtml = `
            <li style="margin-bottom: 12px;"><strong>Leg Press 45°:</strong> 3 séries de 12 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Pés afastados, flexione joelhos 90 graus e empurre.</span></li>
            <li style="margin-bottom: 12px;"><strong>Puxada Aberta Pulley Costas:</strong> 3 séries de 12 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Puxe a barra em direção ao peito, espremendo as costas.</span></li>
            <li style="margin-bottom: 12px;"><strong>Supino Vertical Máquina:</strong> 3 séries de 12 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Empurre os manípulos contraindo o peito.</span></li>
            <li style="margin-bottom: 12px;"><strong>Cadeira Extensora:</strong> 3 séries de 15 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Estenda os joelhos sustentando 1 segundo na contração máxima.</span></li>
          `;
        } else if (env === 'academia' && level === 'intermediario') {
          exercisesHtml = `
            <li style="margin-bottom: 12px;"><strong>Agachamento Livre Barra:</strong> 4 séries de 10 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Coluna ereta e desça os quadris abaixo dos joelhos.</span></li>
            <li style="margin-bottom: 12px;"><strong>Supino Reto com Halteres:</strong> 4 séries de 10 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Estabilização de ombros e contração de peito.</span></li>
            <li style="margin-bottom: 12px;"><strong>Stiff com Halteres:</strong> 3 séries de 12 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Desça o tronco com pernas semiestendidas focando glúteos.</span></li>
            <li style="margin-bottom: 12px;"><strong>Remada Baixa Triângulo:</strong> 4 séries de 10 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Costas retas puxando o triângulo na barriga.</span></li>
          `;
        } else if (env === 'academia' && level === 'avancado') {
          exercisesHtml = `
            <li style="margin-bottom: 12px;"><strong>Agachamento Livre Barra:</strong> 4 séries de 8-10 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Pirâmide progressiva com foco em profundidade.</span></li>
            <li style="margin-bottom: 12px;"><strong>Leg Press 45° (Drop Set):</strong> 4 séries de 12 + Drop.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Faça 12 repetições, reduza peso 30% e faça até falhar sem descanso.</span></li>
            <li style="margin-bottom: 12px;"><strong>Stiff com Barra Lento:</strong> 4 séries de 10 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Foco na cadência de descida de 4 segundos.</span></li>
            <li style="margin-bottom: 12px;"><strong>Cadeira Extensora Isométrica:</strong> 3 séries de 10 reps.<br/><span style="color:#64748b; font-size: 12px;">Instruções: Estenda e segure 3 segundos na contração.</span></li>
          `;
        }

        htmlBody = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
            <div style="background-color: #0d9488; padding: 24px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Minha Ficha de Treino Premium</h1>
              <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">${envLabel} - ${lvlLabel}</p>
            </div>
            <div style="padding: 24px; background-color: #fcfbf9;">
              <p>O exercício de força ativa caminhos celulares que previnem o catabolismo muscular, obrigando o organismo a mobilizar gordura como fonte primária de energia durante o emagrecimento.</p>
              
              <h3 style="color:#0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 20px;">Sua Ficha de Treino Recomendada:</h3>
              <ul style="padding-left: 20px; color: #334155; line-height: 1.6;">
                ${exercisesHtml}
              </ul>

              <div style="margin-top: 24px; padding: 12px; background-color: #fee2e2; border-radius: 6px; font-size: 11px; color: #991b1b;">
                <strong>Aviso de Segurança:</strong> Respeite seus limites físicos. Certifique-se de executar os movimentos com a postura correta para evitar lesões.
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              Emagrecer Saúde Premium © 2026. Todos os direitos reservados.
            </div>
          </div>
        `;
      } else if (emailType === 'diary') {
        const logs = getProgressLogs();
        if (logs.length === 0) {
          throw new Error('Nenhum registro no diário de medidas foi encontrado para enviar!');
        }
        subject = 'Emagrecer Saúde - Meu Histórico de Medidas';
        
        let rowsHtml = '';
        logs.forEach(log => {
          const moodEmoji = log.mood === 'excellent' ? '🤩' : log.mood === 'good' ? '😊' : log.mood === 'neutral' ? '😐' : '🥺';
          rowsHtml += `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; text-align: center;">${log.weight} kg</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; text-align: center;">${log.waist} cm</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center;">${moodEmoji}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">${log.notes || '-'}</td>
            </tr>
          `;
        });

        htmlBody = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
            <div style="background-color: #0d9488; padding: 24px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Diário de Progresso & Medidas</h1>
              <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Evolução Histórica</p>
            </div>
            <div style="padding: 20px; background-color: #fcfbf9;">
              <p>Aqui está o seu histórico completo de registros de medidas cadastrados localmente no app:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                <thead>
                  <tr style="background-color: #f1f5f9; text-align: left;">
                    <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 13px; color: #475569;">Data</th>
                    <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 13px; color: #475569; text-align: center;">Peso</th>
                    <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 13px; color: #475569; text-align: center;">Cintura</th>
                    <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 13px; color: #475569; text-align: center;">Humor</th>
                    <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 13px; color: #475569;">Anotações</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
              
              <p style="margin-top: 20px; font-size: 13px; color: #64748b; font-style: italic;">
                "A consistência é muito mais importante do que a velocidade. Continue registrando sua jornada!"
              </p>
            </div>
            <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              Emagrecer Saúde Premium © 2026. Todos os direitos reservados.
            </div>
          </div>
        `;
      }

      const emailString = [
        `From: me`,
        `To: ${recipientEmail}`,
        `Subject: ${encodeSubject(subject)}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset="UTF-8"`,
        ``,
        `<div>${htmlBody}</div>`
      ].join('\r\n');

      const raw = base64urlEncode(emailString);

      setConfirmAction({
        type: 'email',
        message: `Deseja enviar este e-mail para ${recipientEmail} usando o Gmail?`,
        onConfirm: async () => {
          setSyncing('gmail_send');
          const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ raw }),
          });

          if (!res.ok) {
            const errorDetails = await res.text();
            throw new Error(`O Gmail retornou um erro ao enviar: ${errorDetails}`);
          }

          setSuccess(`E-mail enviado com sucesso para ${recipientEmail}!`);
          setSyncing(null);
        }
      });

    } catch (err: any) {
      console.error(err);
      setError(`Erro ao enviar e-mail: ${err.message || 'Erro desconhecido'}`);
      setSyncing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-brand-forest bg-white border border-brand-emerald/10 rounded-2xl shadow-sm min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-emerald mb-4" />
        <p className="text-sm font-semibold">Carregando conexões com o Google...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-brand-forest">
      
      {/* Side bar or Main column */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Connection status card */}
        <div className="bg-white border border-brand-emerald/10 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          {/* Subtle gold badge in corner */}
          <div className="absolute top-0 right-0 bg-brand-emerald/10 px-3 py-1 rounded-bl-xl text-[10px] font-extrabold uppercase tracking-widest text-brand-emerald">
            Cloud Sync
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-brand-emerald/10 text-brand-emerald rounded-xl">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans text-xl font-extrabold text-brand-forest">Sincronização Google</h3>
              <p className="text-xs text-brand-forest/65">Sincronize arquivos, faça backup e envie por e-mail</p>
            </div>
          </div>

          {!user ? (
            <div className="space-y-4 py-3">
              <p className="text-xs sm:text-sm text-brand-forest/70 leading-relaxed">
                Conecte sua Conta do Google para acessar recursos avançados de salvamento automático no 
                <strong> Google Drive</strong> e envio de relatórios via <strong>Gmail</strong>. 
                Seus dados serão manipulados com total privacidade e autorização prévia de sua conta.
              </p>

              {/* Styled Google Sign-In button as recommended */}
              <button 
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 active:bg-neutral-100 py-3 px-4 rounded-xl shadow-sm transition-all cursor-pointer font-bold text-sm text-neutral-700"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0 block">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>Conectar com o Google</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-brand-cream/60 p-3.5 rounded-xl border border-brand-emerald/10">
                <img 
                  src={user.photoURL || 'https://www.gravatar.com/avatar/?d=mp'} 
                  alt={user.displayName || 'Usuário Google'} 
                  className="w-12 h-12 rounded-full border border-brand-emerald/20 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-brand-emerald font-extrabold uppercase tracking-wide">Conta Ativa</div>
                  <div className="font-extrabold text-brand-forest truncate text-sm">{user.displayName}</div>
                  <div className="text-xs text-brand-forest/60 truncate">{user.email}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Desconectar do Google
              </button>
            </div>
          )}
        </div>

        {/* Global info/tutorial box */}
        <div className="bg-brand-cream border border-brand-emerald/10 rounded-2xl p-5 shadow-sm flex gap-3">
          <Info className="w-5 h-5 text-brand-emerald shrink-0 mt-0.5" />
          <div className="text-xs text-brand-forest/75 leading-relaxed space-y-1.5">
            <p className="font-bold">O que posso fazer com a Sincronização?</p>
            <p><strong>💾 Google Drive:</strong> Exporte seu plano calórico, receitas customizadas e treinos como arquivos .txt para organizar sua jornada. Faça o backup do seu diário de peso na nuvem para nunca perder sua evolução caso limpe o cache do navegador.</p>
            <p><strong>✉️ Gmail:</strong> Envie relatórios de alta qualidade diretamente para sua caixa de entrada com apenas um clique.</p>
          </div>
        </div>

      </div>

      {/* Main configuration panels */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Status Messages overlay/container */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700 text-xs sm:text-sm shadow-sm"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="font-bold">Houve um erro:</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-teal-50 border border-teal-100 rounded-xl flex gap-3 text-teal-800 text-xs sm:text-sm shadow-sm"
            >
              <CheckCircle className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <p className="font-bold">Sucesso!</p>
                <p className="mt-0.5">{success}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation popup overlay */}
        <AnimatePresence>
          {confirmAction && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white border border-brand-emerald/10 p-6 rounded-2xl shadow-xl max-w-md w-full text-brand-forest space-y-4"
              >
                <div className="flex items-center gap-2.5 text-brand-emerald font-sans font-black text-lg">
                  <Sparkles className="w-5 h-5 text-brand-sunset" />
                  Confirmar Ação Google
                </div>
                
                <p className="text-xs sm:text-sm text-brand-forest/85 leading-relaxed bg-brand-cream/40 p-3 rounded-xl border border-brand-emerald/5">
                  {confirmAction.message}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="py-2 px-4 border border-brand-emerald/10 hover:bg-neutral-50 rounded-xl text-xs font-bold transition-all cursor-pointer text-brand-forest/70"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const trigger = confirmAction.onConfirm;
                      setConfirmAction(null);
                      trigger();
                    }}
                    className="py-2 px-4 bg-brand-emerald hover:bg-brand-emerald-dark text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Confirmar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!user ? (
          <div className="bg-white border border-brand-emerald/10 rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
            <Cloud className="w-12 h-12 text-brand-forest/20 animate-pulse" />
            <div>
              <h4 className="font-extrabold text-brand-forest text-base">Nenhuma Conta Conectada</h4>
              <p className="text-xs text-brand-forest/60 max-w-xs mx-auto mt-1">
                Conecte sua Conta do Google para desbloquear as ferramentas avançadas de integração com Gmail e Google Drive.
              </p>
            </div>
            <button
              onClick={handleLogin}
              className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Conectar Agora
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* GOOGLE DRIVE SYNC SECTION */}
            <div className="bg-white border border-brand-emerald/10 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="font-sans text-lg font-black flex items-center gap-2 text-brand-forest border-b border-brand-cream pb-3">
                <Upload className="w-5 h-5 text-brand-emerald" />
                Google Drive - Backup & Exportação
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Export Plano Calorico */}
                <button
                  disabled={syncing !== null}
                  onClick={handleBackupCaloriePlan}
                  className="p-3.5 bg-brand-cream/40 hover:bg-brand-cream border border-brand-emerald/10 hover:border-brand-emerald/30 rounded-xl text-left transition-all cursor-pointer flex gap-3 items-start disabled:opacity-50 group"
                >
                  <FileText className="w-5 h-5 text-brand-emerald mt-0.5 shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <div className="text-xs font-black">Salvar Plano de Calorias</div>
                    <div className="text-[10px] text-brand-forest/60 mt-0.5">Exporta seus dados e macros calculados para o Drive.</div>
                  </div>
                </button>

                {/* Export Prato Saudavel */}
                <button
                  disabled={syncing !== null}
                  onClick={handleBackupMealPlate}
                  className="p-3.5 bg-brand-cream/40 hover:bg-brand-cream border border-brand-emerald/10 hover:border-brand-emerald/30 rounded-xl text-left transition-all cursor-pointer flex gap-3 items-start disabled:opacity-50 group"
                >
                  <FileText className="w-5 h-5 text-brand-emerald mt-0.5 shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <div className="text-xs font-black">Salvar Prato Customizado</div>
                    <div className="text-[10px] text-brand-forest/60 mt-0.5">Exporta a composição de saladas, carnes e carboidratos.</div>
                  </div>
                </button>

                {/* Export Treino */}
                <button
                  disabled={syncing !== null}
                  onClick={handleBackupWorkout}
                  className="p-3.5 bg-brand-cream/40 hover:bg-brand-cream border border-brand-emerald/10 hover:border-brand-emerald/30 rounded-xl text-left transition-all cursor-pointer flex gap-3 items-start disabled:opacity-50 group"
                >
                  <FileText className="w-5 h-5 text-brand-emerald mt-0.5 shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <div className="text-xs font-black">Salvar Ficha de Treino</div>
                    <div className="text-[10px] text-brand-forest/60 mt-0.5">Exporta sua rotina ativa para realizar offline.</div>
                  </div>
                </button>

                {/* Backup Diario */}
                <button
                  disabled={syncing !== null}
                  onClick={handleBackupWeightLogs}
                  className="p-3.5 bg-brand-emerald/5 hover:bg-brand-emerald/10 border border-brand-emerald/15 hover:border-brand-emerald/35 rounded-xl text-left transition-all cursor-pointer flex gap-3 items-start disabled:opacity-50 group"
                >
                  <Upload className="w-5 h-5 text-brand-emerald mt-0.5 shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <div className="text-xs font-black text-brand-emerald">Fazer Backup do Diário</div>
                    <div className="text-[10px] text-brand-forest/60 mt-0.5">Cria uma cópia de segurança na nuvem com todo histórico de peso.</div>
                  </div>
                </button>

              </div>

              {/* Restore Box */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-extrabold text-amber-800 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-amber-600 shrink-0" />
                    Restaurar do Backup em Nuvem
                  </p>
                  <p className="text-[11px] text-brand-forest/70 mt-1">Recupere suas medidas salvas no Google Drive em outro dispositivo.</p>
                </div>
                <button
                  disabled={syncing !== null}
                  onClick={handleRestoreWeightLogs}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-2 rounded-lg transition-all text-[11px] shrink-0 flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {syncing === 'drive_restore' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Restaurar Medidas
                </button>
              </div>

              {/* File List Area */}
              {files.length > 0 && (
                <div className="pt-3 border-t border-brand-cream">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-forest/60 mb-2.5">Arquivos Salvos Recorrentes:</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {files.map((file) => (
                      <div key={file.id} className="flex justify-between items-center bg-brand-cream/20 p-2.5 border border-brand-emerald/5 rounded-lg text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-brand-emerald/70 shrink-0" />
                          <span className="font-bold truncate text-brand-forest">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-brand-forest/50 font-mono">
                            {new Date(file.createdTime).toLocaleDateString('pt-BR')}
                          </span>
                          <a 
                            href={file.webViewLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-brand-emerald hover:text-brand-emerald-dark font-extrabold flex items-center gap-0.5 transition-colors"
                          >
                            Abrir
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* GMAIL API EXPORT SECTION */}
            <div className="bg-white border border-brand-emerald/10 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-sans text-lg font-black flex items-center gap-2 text-brand-forest border-b border-brand-cream pb-3">
                <Mail className="w-5 h-5 text-brand-emerald" />
                Gmail - Envio Direto de Relatórios
              </h3>

              <form onSubmit={handleSendGmail} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Report to Email */}
                  <div>
                    <label className="block text-xs font-bold text-brand-forest/80 mb-1.5">Escolher Relatório</label>
                    <select
                      value={emailType}
                      onChange={(e: any) => setEmailType(e.target.value)}
                      className="w-full bg-white border border-brand-emerald/10 rounded-xl p-2.5 text-xs outline-none focus:border-brand-emerald transition-all cursor-pointer text-brand-forest font-medium"
                    >
                      <option value="calories">Plano de Calorias & Macronutrientes</option>
                      <option value="plate">Simulação do Prato Saudável Ativo</option>
                      <option value="workout">Ficha de Treino Recomendada</option>
                      <option value="diary">Histórico do Diário de Medidas</option>
                    </select>
                  </div>

                  {/* Recipient Input */}
                  <div>
                    <label className="block text-xs font-bold text-brand-forest/80 mb-1.5">E-mail de Destino</label>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="seu-email@gmail.com"
                      className="w-full bg-white border border-brand-emerald/10 rounded-xl p-2.5 text-xs outline-none focus:border-brand-emerald transition-all text-brand-forest font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={syncing !== null}
                  className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-3 px-4 rounded-xl shadow-sm text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {syncing === 'gmail_send' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando E-mail...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Relatório pelo Gmail
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
