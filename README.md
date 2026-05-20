# p-fit

Plano de treino + cardio Z2 + registro semanal + nutrição (Mounjaro-aware), em React + Vite + Tailwind v4.

Nasceu da planilha `plano_treino_mounjaro.xlsx` — quatro sessões de força (Lower A, Upper A, Lower B, Upper B), três sessões de cardio Zona 2 e doze semanas de acompanhamento.

## Stack

- **Vite 6** + **React 19** + **TypeScript** estrito
- **Tailwind v4** (configurado via `@theme` em `src/index.css`, sem `tailwind.config.js`)
- **shadcn-style** primitives próprios em `src/components/ui/*`
- **Storage adapter** (`src/lib/storage/`) — `LocalStorageAdapter` por padrão, `SupabaseStorageAdapter` plugável

Filosofia herdada do [nextjs-ai-starter](https://github.com/rlpereiruxo/nextjs-ai-starter): TS strict, primitives próprios, storage via interface (sem acoplamento com vendor).

## Rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Os dados são salvos no `localStorage` por padrão.

## Build / typecheck

```bash
npm run typecheck
npm run build
npm run preview
```

## Persistência

Por padrão o app usa `localStorage` (key `pfit:data:v1`) — funciona offline, single-device. Sem nenhum env var setado, é assim que ele roda.

Pra trocar pro Supabase (local ou hospedado) e pra fazer deploy no Cloudflare Pages, ver [docs/deploy.md](./docs/deploy.md) — cobre os 4 modos (dev/prod × local/hospedado) e como combinar.

> **TODO**: tela de login (magic link) + promoção automática do `LocalStorageAdapter` → `SupabaseStorageAdapter` quando há sessão. Hoje o `SupabaseStorageAdapter` (`src/lib/storage/supabase.ts`) está pronto e as policies RLS escritas, mas `getStorageAdapter()` sempre retorna o local.

## Deploy

Cloudflare Pages, em uma linha:

```bash
npm run deploy   # roda npm run build && wrangler pages deploy
```

Detalhes (env vars, supabase local via CLI, preview com `_headers`) em [docs/deploy.md](./docs/deploy.md).

## Estrutura

```
src/
├── main.tsx                 entry
├── App.tsx                  shell + bottom-tab nav
├── index.css                tailwind v4 + @theme tokens
├── components/ui/           Button, Card, Input, Label, Badge, Segmented
├── features/
│   ├── home/                visão semanal + atalhos
│   ├── strength/            sessões Lower A/B, Upper A/B com log de carga por semana
│   ├── cardio/              calculadora Karvonen + sessões Z2
│   ├── weekly/              registro de 12 semanas (peso/cintura/proteína/sono)
│   └── nutrition/           calculadora de proteína + checklist Mounjaro
└── lib/
    ├── plan/data.ts         dados estáticos do plano (exercícios, sets, reps, descanso)
    ├── store.tsx            React context com persistência debounced
    ├── supabase.ts          cliente (opcional, lê env)
    ├── utils.ts             cn()
    └── storage/             adapter pattern (local + supabase)
```

## O que ainda falta

- Auth (magic link) + swap automático pro `SupabaseStorageAdapter`
- PWA / instalável
