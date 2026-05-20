# AGENTS

Regras para humanos e agentes (Claude / Cursor / Codex) trabalhando neste repo.

## Produto

p-fit é um app pessoal pra acompanhar o plano de treino + cardio + nutrição derivado de `plano_treino_mounjaro.xlsx`. Single-user no localStorage por padrão; multi-device com Supabase quando o usuário ligar.

## Não-negociáveis

- **TypeScript strict** — `noUncheckedIndexedAccess` e `strict: true` ligados no `tsconfig.app.json`. Não relaxe.
- **Dados estáticos no código, dados do usuário no storage.** A definição do plano (exercícios, sets, reps) está em `src/lib/plan/data.ts` como constantes. Tudo que o usuário inputa (cargas, reps feitas, peso) vai pro `StorageAdapter`.
- **Storage através do adapter, nunca direto.** Componentes usam `useStore()`. Adicionar persistência nova = estender `AppData` e `StorageAdapter`, não criar localStorage solto.
- **RLS no Supabase = owner-only.** Toda tabela `p_*` tem `user_id` e policies onde `auth.uid() = user_id`. Migration nova segue o mesmo padrão.
- **Mobile-first.** Layout cabe em 360px de largura. Tab bar inferior é fixa. Inputs numéricos têm `inputMode` apropriado.
- **PT-BR** na UI. Identificadores e código em inglês.

## Onde olhar primeiro

- `README.md` — setup, estrutura, persistência
- `src/lib/plan/data.ts` — fonte da verdade do plano (corresponde à planilha)
- `src/lib/storage/types.ts` — shape dos dados do usuário
- `supabase/migrations/0001_init.sql` — schema + RLS

## Testes

Ainda não há suite. Quando entrar:

- Domínio (cálculo de zona Karvonen, calculadora de proteína) → unit (Vitest)
- Storage adapter → unit com fake localStorage
- E2E happy path (logar treino, registrar semana) → Playwright

## Convenções de PR

- 1 PR = 1 mudança coesa.
- Commit message no formato `<scope>: <verb in imperative>` (ex: `strength: add per-set notes`).
- Toca `data.ts`? Confere que a planilha original ainda bate, ou anota o motivo da divergência no PR.
