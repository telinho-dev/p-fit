export type Exercise = {
  key: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes: string;
  isCore?: boolean;
};

export type StrengthSession = {
  key: "lower-a" | "upper-a" | "lower-b" | "upper-b";
  day: "Segunda" | "Terça" | "Quinta" | "Sexta";
  title: string;
  focus: string;
  duration: string;
  headline: string;
  exercises: Exercise[];
};

export type CardioSession = {
  key: string;
  day: string;
  modality: string;
  duration: string;
  intensity: string;
  notes: string;
};

const lowerA: StrengthSession = {
  key: "lower-a",
  day: "Segunda",
  title: "Lower A",
  focus: "quadríceps + core",
  duration: "~60 min",
  headline: "Treino mais pesado da semana, faça descansado",
  exercises: [
    {
      key: "agachamento",
      name: "Agachamento livre (ou Hack machine)",
      sets: 4,
      reps: "6-8",
      rest: "2-3 min",
      notes: "Composto principal, RIR 1-2. Aquecer bem.",
    },
    {
      key: "leg-press",
      name: "Leg press 45°",
      sets: 3,
      reps: "10-12",
      rest: "2 min",
      notes: "Pés na metade-baixa da plataforma para mais quadríceps.",
    },
    {
      key: "cadeira-extensora",
      name: "Cadeira extensora",
      sets: 3,
      reps: "12-15",
      rest: "60-90s",
      notes: "Pode ir até falha na última série.",
    },
    {
      key: "stiff",
      name: "Stiff (com halteres ou barra)",
      sets: 3,
      reps: "8-10",
      rest: "2 min",
      notes: "Foco em alongar isquios, joelhos levemente flexionados.",
    },
    {
      key: "panturrilha-pe",
      name: "Panturrilha em pé (smith ou máquina)",
      sets: 4,
      reps: "10-12",
      rest: "60-90s",
      notes: "Pausa de 1s no alongamento total.",
    },
    {
      key: "prancha-frontal",
      name: "Prancha frontal (isometria)",
      sets: 3,
      reps: "40-60s",
      rest: "60s",
      notes: "CORE — manter linha reta, glúteo contraído.",
      isCore: true,
    },
    {
      key: "abdominal-infra",
      name: "Abdominal infra (perna estendida)",
      sets: 3,
      reps: "12-15",
      rest: "60s",
      notes: "CORE — não jogar a lombar contra o chão com força.",
      isCore: true,
    },
  ],
};

const upperA: StrengthSession = {
  key: "upper-a",
  day: "Terça",
  title: "Upper A",
  focus: "peito/ombro + core",
  duration: "~60 min",
  headline: "Foco em supino e desenvolvimento",
  exercises: [
    {
      key: "supino-reto",
      name: "Supino reto (barra ou halter)",
      sets: 4,
      reps: "6-8",
      rest: "2-3 min",
      notes: "Composto principal. Halteres = mais ROM, menos lesão de ombro.",
    },
    {
      key: "desenvolvimento",
      name: "Desenvolvimento halter sentado",
      sets: 3,
      reps: "8-10",
      rest: "2 min",
      notes: "Banco com encosto a 80-85°. Cuidar do ombro.",
    },
    {
      key: "supino-inclinado",
      name: "Supino inclinado halter (30-45°)",
      sets: 3,
      reps: "10-12",
      rest: "90s",
      notes: "Foco no peitoral superior.",
    },
    {
      key: "remada-cavalinho",
      name: "Remada cavalinho (ou remada baixa)",
      sets: 3,
      reps: "10-12",
      rest: "90s",
      notes: "Antagonista, mantém saúde do ombro.",
    },
    {
      key: "elevacao-lateral",
      name: "Elevação lateral halter",
      sets: 3,
      reps: "12-15",
      rest: "60s",
      notes: "Cotovelo levemente flexionado, sobe até a altura do ombro.",
    },
    {
      key: "triceps-corda",
      name: "Tríceps na corda (ou francês halter)",
      sets: 3,
      reps: "10-12",
      rest: "60-90s",
      notes: "Estender totalmente o cotovelo no final.",
    },
    {
      key: "prancha-lateral",
      name: "Prancha lateral (cada lado)",
      sets: 3,
      reps: "30-45s",
      rest: "60s",
      notes: "CORE — foco em oblíquos. 1 série por lado.",
      isCore: true,
    },
  ],
};

const lowerB: StrengthSession = {
  key: "lower-b",
  day: "Quinta",
  title: "Lower B",
  focus: "posterior/glúteo + core",
  duration: "~60 min",
  headline: "Stiff/RDL como exercício principal",
  exercises: [
    {
      key: "rdl",
      name: "Levantamento terra romeno (RDL)",
      sets: 4,
      reps: "6-8",
      rest: "2-3 min",
      notes: "Composto principal. Foco em alongar isquios. Coluna neutra.",
    },
    {
      key: "bulgaro",
      name: "Búlgaro (ou afundo) com halteres",
      sets: 3,
      reps: "8-10 cada perna",
      rest: "2 min",
      notes: "Joelho da frente alinhado com o pé.",
    },
    {
      key: "mesa-flexora",
      name: "Mesa flexora",
      sets: 3,
      reps: "10-12",
      rest: "90s",
      notes: "Controle excêntrico (descida de 2-3 segundos).",
    },
    {
      key: "hip-thrust",
      name: "Elevação pélvica / Hip thrust",
      sets: 3,
      reps: "8-10",
      rest: "90s",
      notes: "Pausa de 1s no topo. Glúteo bem contraído.",
    },
    {
      key: "panturrilha-sentado",
      name: "Panturrilha sentado",
      sets: 4,
      reps: "12-15",
      rest: "60-90s",
      notes: "Complementa a panturrilha em pé de segunda.",
    },
    {
      key: "abdominal-supra",
      name: "Abdominal supra (no solo ou máquina)",
      sets: 3,
      reps: "12-15",
      rest: "60s",
      notes: "CORE — encurtar a distância costela-quadril.",
      isCore: true,
    },
    {
      key: "dead-bug",
      name: "Dead bug (cada lado)",
      sets: 3,
      reps: "10 cada lado",
      rest: "45s",
      notes: "CORE — anti-extensão lombar. Lombar colada no chão.",
      isCore: true,
    },
  ],
};

const upperB: StrengthSession = {
  key: "upper-b",
  day: "Sexta",
  title: "Upper B",
  focus: "costas/braços + core",
  duration: "~60 min",
  headline: "Puxadas e remadas pesadas",
  exercises: [
    {
      key: "barra-fixa",
      name: "Barra fixa (ou puxada pronada)",
      sets: 4,
      reps: "6-10",
      rest: "2-3 min",
      notes: "Se não consegue na barra, usar puxada com pegada pronada.",
    },
    {
      key: "remada-curvada",
      name: "Remada curvada barra (ou Pendlay)",
      sets: 4,
      reps: "8-10",
      rest: "2 min",
      notes: "Tronco a 45°, puxar barra até o abdômen.",
    },
    {
      key: "remada-serrote",
      name: "Remada unilateral halter (serrote)",
      sets: 3,
      reps: "10-12",
      rest: "90s",
      notes: "Cotovelo próximo ao corpo. Apertar escápula.",
    },
    {
      key: "supino-fechado",
      name: "Supino fechado (ou paralelas)",
      sets: 3,
      reps: "8-10",
      rest: "2 min",
      notes: "Tríceps composto. Cotovelos junto ao corpo.",
    },
    {
      key: "rosca-direta",
      name: "Rosca direta (barra W ou reta)",
      sets: 3,
      reps: "8-10",
      rest: "60-90s",
      notes: "Cotovelos fixos ao lado do tronco.",
    },
    {
      key: "rosca-martelo",
      name: "Rosca martelo halter",
      sets: 3,
      reps: "10-12",
      rest: "60s",
      notes: "Foco em braquial e antebraço.",
    },
    {
      key: "russian-twist",
      name: "Rotação russa (russian twist) com peso",
      sets: 3,
      reps: "12-15 cada lado",
      rest: "60s",
      notes: "CORE — oblíquos. Use anilha ou medicine ball.",
      isCore: true,
    },
    {
      key: "hollow-body",
      name: "Hollow body hold",
      sets: 3,
      reps: "20-30s",
      rest: "60s",
      notes: "CORE — anti-extensão. Lombar colada no chão.",
      isCore: true,
    },
  ],
};

export const STRENGTH_SESSIONS: StrengthSession[] = [lowerA, upperA, lowerB, upperB];

export const CARDIO_SESSIONS: CardioSession[] = [
  {
    key: "qua-bike",
    day: "Quarta",
    modality: "Bike (ergométrica ou estrada)",
    duration: "45-50 min",
    intensity: "Zona 2",
    notes: "Resistência moderada, cadência 80-90 rpm. Conversa em frases completas.",
  },
  {
    key: "sab-caminhada",
    day: "Sábado A",
    modality: "Caminhada inclinada (esteira)",
    duration: "40 min",
    intensity: "Zona 2",
    notes: "Inclinação 8-12%, velocidade 5-6 km/h. Sem segurar nas barras.",
  },
  {
    key: "sab-bike",
    day: "Sábado B",
    modality: "Bike (leve)",
    duration: "30 min",
    intensity: "Zona 2",
    notes: "Pode ser na sequência ou separado. Alternativa: pular se cansaço alto.",
  },
  {
    key: "dom-leve",
    day: "Domingo",
    modality: "Caminhada inclinada ou Bike",
    duration: "40-45 min",
    intensity: "Zona 2",
    notes: "Sessão mais leve. Pode trocar por bike se preferir.",
  },
];

export const WEEKLY_OVERVIEW: { day: string; type: string; session: string; duration: string; note: string }[] = [
  { day: "Segunda", type: "Força", session: "Lower A — foco quadríceps", duration: "~60 min", note: "Treino mais pesado da semana, faça descansado" },
  { day: "Terça", type: "Força", session: "Upper A — foco peito/ombro", duration: "~60 min", note: "Foco em supino e desenvolvimento" },
  { day: "Quarta", type: "Cardio", session: "Bike — Zona 2", duration: "45-50 min", note: "Recuperação ativa entre Lower A e Lower B" },
  { day: "Quinta", type: "Força", session: "Lower B — foco posterior/glúteo", duration: "~60 min", note: "Stiff/RDL como exercício principal" },
  { day: "Sexta", type: "Força", session: "Upper B — foco costas", duration: "~60 min", note: "Puxadas e remadas pesadas" },
  { day: "Sábado", type: "Cardio", session: "Caminhada inclinada + Bike", duration: "70-80 min", note: "Pode dividir em 2 sessões no dia" },
  { day: "Domingo", type: "Cardio", session: "Caminhada inclinada (ou bike)", duration: "40-45 min", note: "Sessão mais leve antes da segunda" },
];

export const GENERAL_GUIDELINES = [
  "RIR 1-2 (Reps in Reserve): pare 1-2 reps antes da falha total na maioria das séries.",
  "Descanso: 2-3 min nos compostos pesados, 60-90s nos isolados.",
  "Progressão: anote cargas. Bateu as reps prescritas com RIR 1-2? Sobe carga semana seguinte.",
  "Aquecimento: 5 min mobilidade + 2-3 séries leves no primeiro composto.",
  "Proteína-alvo: 1.6-2.2g por kg de peso-alvo (não peso atual). Crítico no uso de Mounjaro.",
  "Creatina: 5g/dia, qualquer horário, todos os dias.",
  "Sinais de alerta: perda de força semanal, tontura, recuperação muito ruim → conversar com médico.",
  "Cardio depois do treino de força (se mesmo dia), nunca antes.",
];

export const MOUNJARO_POINTS: { topic: string; recommendation: string }[] = [
  { topic: "Risco principal", recommendation: "Perda de massa magra desproporcional. Estudos mostram 25-40% da perda total pode ser massa magra sem treino + proteína adequada." },
  { topic: "Proteína", recommendation: "Crítica. Comece pelas refeições com proteína primeiro, depois carbo/gordura. Apetite reduzido = fácil ficar com déficit proteico." },
  { topic: "Calorias", recommendation: "Não force déficit grande. Mounjaro já reduz fome — déficit muito agressivo sabota músculo e energia de treino." },
  { topic: "Creatina", recommendation: "5g/dia, sempre. Ajuda a preservar massa magra e força em déficit." },
  { topic: "Eletrólitos", recommendation: "Sódio, potássio, magnésio. Mounjaro pode causar enjoo, perdas digestivas. Cãibras são sinal de baixo." },
  { topic: "Sintomas alerta", recommendation: "Fadiga extrema, queda de força semanal, tontura, ânsia constante → conversar com médico, possível ajuste de dose." },
  { topic: "Hidratação", recommendation: "3-4L de água/dia. Apetite reduzido inclui sede reduzida — desidratação sabota treino." },
  { topic: "Refeições", recommendation: "3-4 refeições/dia, não 5-6. Apetite baixo torna refeições pequenas frequentes ineficazes para bater proteína." },
];

export const CARDIO_TIPS = [
  "Caminhada plana raramente atinge Zona 2 — use inclinação ou bike.",
  "Talk test: deve conseguir falar frases completas. Se está ofegante, baixou demais a intensidade ou subiu demais a FC.",
  "No Garmin Connect: Dispositivo → Configurações do usuário → Zonas de FC → mudar para % Reserva FC.",
  "Faça o teste de Limiar de Lactato guiado do Garmin (~20 min) para calibrar zonas reais.",
  "Cardio em jejum NÃO é superior. Faça quando for prático.",
  "Se sentir pernas pesadas no Lower B (quinta), reduza a bike de quarta para 30 min.",
  "HIIT não está incluído de propósito — o custo de recuperação não compensa em déficit + GLP-1.",
];

export const TOTAL_WEEKS = 12;
export const SESSION_WEEKS = 4;
