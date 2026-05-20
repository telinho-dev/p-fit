# p-fit · Roadmap de Produto

> App mobile-first de treino e saúde com camada social familiar e import inteligente via screenshot.

---

## Estado atual — MVP ✓

Stack: Vite 6 + React 19 + TypeScript + Tailwind v4 + Supabase + Cloudflare Pages

| Feature | Status |
|---|---|
| 5 telas (Hoje, Força, Cardio, Semanas, Nutrição, Perfil) | ✅ |
| Log por série (carga + reps por set, accordion) | ✅ |
| Navegação por semana ISO (W21, W22…) | ✅ |
| Calculadora Karvonen Zona 2 | ✅ |
| Calculadora de proteína + checklist Mounjaro | ✅ |
| Histórico 12 semanas (peso, cintura, sono) | ✅ |
| Export / import JSON + reset | ✅ |
| Storage adapter (LocalStorage ↔ Supabase, mesma interface) | ✅ |
| Cloudflare Pages deploy | ✅ |
| Design Strava/Apple Fitness, mobile-first | ✅ |

**Limitações atuais:** single-user, sem auth, roteamento via `useState<Tab>` (sem deep links nem back button).

---

## Fase 1 — Roteamento real

**Objetivo:** substituir o `useState<Tab>` por React Router v7 antes de empilhar mais features.

**Por que agora:** deep links, back button, notificações que abrem tela específica e multi-usuário dependem de URLs reais. Quanto mais tarde, mais difícil.

### Rotas planejadas

```
/                    → Hoje (home)
/strength            → Força (sessão padrão = dia atual)
/strength/:session   → Força com sessão específica (lower-a, upper-a…)
/cardio              → Cardio
/weekly              → Semanas
/nutrition           → Nutrição
/settings            → Perfil
/login               → Auth (Fase 2)
/family              → Família (Fase 3)
```

### Entregas
- Instalar React Router v7, configurar `createBrowserRouter`
- Bottom nav usa `<NavLink>` (ativo por URL, não state)
- `initialSession` prop do Hoje → Força vira `navigate("/strength/upper-a")`
- `_redirects` do Cloudflare já cobre SPA fallback (`/* /index.html 200`)
- Sem mudança visual nenhuma

---

## Fase 2 — Auth + Supabase ativo

**Objetivo:** cada usuário tem seus dados isolados na nuvem, sync multi-device.

### Auth
- Supabase Auth — magic link (sem senha pra lembrar) ou email + senha
- Tela `/login` minimalista, no estilo do design atual
- Após login: `SupabaseStorageAdapter` ativo; antes: continua com `LocalStorageAdapter`
- Migração dos dados locais pra Supabase no primeiro login ("importar dados locais?")

### Banco
- Migrations existentes (`p_user_settings`, `p_exercise_logs`, `p_weekly_logs`) já têm RLS com `auth.uid() = user_id`
- Adicionar `daily_logs` (Fase 5) e `families` (Fase 3) nas migrations seguintes

### Decisões técnicas
- Sessão Supabase no cliente, sem backend próprio por enquanto
- API key do Claude (Fase 4) vai no Cloudflare Worker, não no client

---

## Fase 3 — Família

**Objetivo:** membros de uma família podem acompanhar as atividades uns dos outros.

### Modelo de dados

```sql
families          (id, name, created_at)
family_members    (family_id, user_id, role: owner|member, joined_at)
```

RLS: leitura dos logs permitida para membros da mesma família; escrita apenas no próprio `user_id`.

### Features

**Feed familiar no Hoje**
- Seção "Família esta semana" abaixo do hero
- Cards compactos: avatar + nome + atividade + quando (ex: "Ana · Lower A · há 2h")
- Tap no card abre o detalhe (read-only)

**Gestão na aba Perfil**
- Criar família / entrar com código de convite
- Ver membros, sair da família
- Toggle de visibilidade (tornar logs privados por período)

**Leaderboard semanal (opcional)**
- Ranking de treinos concluídos na semana entre membros
- Leve, sem gamificação forçada

### Considerações
- Privacidade first: compartilhamento é opt-in, não opt-out
- Metas e logs de saúde (peso, cintura) permanecem privados por padrão; usuário escolhe o que compartilhar

---

## Fase 4 — Import via screenshot (AI vision)

**Objetivo:** importar atividades de qualquer app de fitness via print da tela, sem OAuth complexo.

### Por que screenshot e não API oficial
- Garmin Connect API: fechada, aprovação manual, rate limits severos
- Strava API: OAuth complexo, limites por hora, muda frequentemente
- Screenshot: funciona com Garmin, Strava, Apple Fitness, Samsung Health, Polar — qualquer app que tenha tela

### Fluxo

```
[usuário tira print] 
  → upload no app (drag or share sheet no iOS/Android)
    → Cloudflare Worker
      → Claude API (vision) + prompt estruturado
        → JSON validado com o schema do p-fit
          → tela de confirmação ("foi isso que você fez?")
            → salva no banco
```

### Prompt strategy
Claude recebe a imagem + contexto do usuário (unidade kg/lb, idioma) e retorna:

```json
{
  "type": "strength" | "cardio" | "unknown",
  "session": "lower-a" | "upper-a" | ...,
  "week": 21,
  "exercises": [
    { "name": "Agachamento", "sets": [{ "load": 80, "reps": 8 }, ...] }
  ],
  "confidence": 0.92,
  "raw_text": "..."
}
```

### Tela de confirmação
- Mostra o que foi extraído campo a campo
- Usuário pode editar antes de salvar
- Se `confidence < 0.7`, avisa que o parse pode ter erros

### Suporte planejado

| App | Tipo de atividade | Qualidade esperada |
|---|---|---|
| Garmin Connect | Força (séries/reps) | Alta |
| Garmin Connect | Cardio (distância/pace/FC) | Alta |
| Strava | Corrida/bike | Alta |
| Apple Fitness | Treino de força | Média |
| Apple Fitness | Cardio (fecha aneis) | Média |
| Samsung Health | Geral | Média |

### Modelo `CardioLog` (novo)
Atividades cardio importadas têm campos diferentes dos `WeeklyLog`:

```ts
type CardioLog = {
  week: number;          // ISO week
  date: string;          // yyyy-mm-dd
  type: "run" | "ride" | "walk" | "swim" | "other";
  durationMin: number;
  distanceKm?: number;
  paceMinKm?: number;    // corrida
  hrAvg?: number;
  hrMax?: number;
  source: "manual" | "screenshot";
  sourceApp?: string;    // "garmin" | "strava" | ...
};
```

---

## Fase 5 — Metas diárias + Hidratação

**Objetivo:** tracking leve do dia a dia — hidratação, suplementos, hábitos.

### `DailyLog` (novo)

```ts
type DailyLog = {
  date: string;            // yyyy-mm-dd
  hydrationMl: number | null;
  creatineDone: boolean;
  proteinTarget: number | null;    // meta do dia em g
  proteinActual: number | null;    // o que comeu
  sleepH: number | null;
  customGoals: Record<string, boolean>; // ex: { "jejum 16h": true }
};
```

### Features

**Widget no Hoje**
- Barra de hidratação (ex: 1.8L / 3L) com tap-to-increment (+ 200ml)
- Checklist rápido: creatina ✓ · proteína no alvo ✓ · sono > 7h ✓
- Streak de dias consecutivos com metas batidas

**Metas configuráveis**
- Na aba Perfil: meta de hidratação diária, lista de custom goals
- Sugestões pré-prontas: creatina 5g, multivitamínico, etc.

---

## Backlog / Futuro

| Ideia | Viabilidade | Dependência |
|---|---|---|
| Push notifications (lembrete de treino) | Alta — Web Push + Cloudflare | Fase 2 (auth) |
| Widget iOS/Android (hidratação, treino do dia) | Média — precisa de wrapper nativo | Fase 5 |
| Garmin/Strava OAuth oficial | Baixa prioridade — screenshot resolve 90% | Fase 4 estável |
| Coach mode (familiar vê logs em detalhe + comenta) | Alta | Fase 3 |
| AI coach semanal ("você melhorou X, cuidado com Y") | Alta — Claude + weekly summary | Fase 3 + 5 |
| Periodização automática (ajusta cargas semana a semana) | Média | Histórico suficiente |
| Versão PWA instalável | Alta — já quase lá, falta manifest + service worker | Qualquer fase |

---

## Sequência recomendada

```
Hoje           → Fase 1 (React Router)     ~1 sessão de dev
               → Fase 2 (Auth + Supabase)  ~2-3 sessões
               → Fase 3 (Família)          ~3-4 sessões
               → Fase 4 (Screenshot AI)    ~2 sessões
               → Fase 5 (Daily goals)      ~1-2 sessões
```

A Fase 4 (screenshot) pode entrar antes da Família se for mais motivante — o Worker do Cloudflare que ela precisa é independente do modelo de família.

---

*Última atualização: 2026-05-19*
