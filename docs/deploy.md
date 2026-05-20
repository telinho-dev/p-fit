# Deploy & ambientes

Quatro modos de rodar o p-fit, do mais simples ao mais "produção":

| Modo                          | Front           | Dados                  | Quando usar                     |
| ----------------------------- | --------------- | ---------------------- | ------------------------------- |
| 1. dev local                  | `vite`          | `localStorage`         | iteração rápida, sem auth       |
| 2. dev local + Supabase local | `vite`          | Supabase CLI (Docker)  | testar RLS / migrations         |
| 3. dev local + Supabase prod  | `vite`          | Supabase hospedado     | smoke test com dados reais      |
| 4. Cloudflare Pages prod      | Pages (estátic) | Supabase hospedado     | deploy real                     |

Os dois eixos (front local/remoto × dados local/remoto) são independentes — qualquer combinação roda.

---

## 1. Dev local com localStorage (default)

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Badge do header mostra **local**. Dados ficam em `localStorage` (chave `pfit:data:v1`).

---

## 2. Dev local com Supabase local (CLI)

Pré-requisitos: [Docker](https://docs.docker.com/get-docker/) e [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
# Uma vez por máquina
supabase init                        # cria supabase/config.toml (se não existe)
npm run db:start                     # sobe Postgres + Auth + Studio em containers
                                     # imprime URL, anon key, service key

# Em todo dev daqui pra frente
npm run dev
```

Depois do `db:start`:

1. Copie o `anon key` impresso (ou rode `supabase status` pra ver de novo).
2. Crie `.env.local`:
   ```
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
3. Aplique a migration:
   ```bash
   npm run db:push        # ou supabase db reset (recria do zero)
   ```
4. Reinicie `npm run dev` — badge do header deve trocar pra **supabase**.

Studio local: `http://127.0.0.1:54323`. Inbucket (emails): `http://127.0.0.1:54324`.

Pra zerar tudo: `npm run db:reset` (recria do zero) ou `npm run db:stop`.

---

## 3. Dev local com Supabase hospedado

```bash
# Cria o projeto no app.supabase.com
# Cola a migration no SQL Editor (ou usa supabase db push com link)

# .env.local
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon do dashboard>

npm run dev
```

Pra empurrar a migration via CLI (em vez de copiar/colar):

```bash
supabase login
supabase link --project-ref <ref>
supabase db push
```

---

## 4. Cloudflare Pages (deploy)

### Setup uma vez

```bash
# Cria o projeto Pages na dashboard OU via CLI:
npx wrangler login
npx wrangler pages project create p-fit --production-branch=main
```

Configure as env vars na dashboard (Settings → Environment variables):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

> **Importante:** Vite injeta env vars **no build**, então mudar elas exige um redeploy. Não basta editar e refrescar.

### Deploy

```bash
npm run deploy
```

Que é `npm run build && wrangler pages deploy`. O `wrangler.jsonc` aponta pra `./dist`.

### Local preview com edge-rules (`_headers`, `_redirects`)

```bash
npm run build
npm run pages:dev
```

Levanta um servidor local que respeita os arquivos `public/_headers` e `public/_redirects` (vite preview ignora eles).

---

## Hooking Cloudflare ↔ Supabase

Não há nada especial — Cloudflare Pages serve o JS estático, o JS faz fetch direto pra Supabase API a partir do browser. Garanta apenas que:

- `Authentication → URL Configuration → Site URL` no Supabase aponte pro domínio do Pages (ex.: `https://p-fit.pages.dev`).
- `Additional Redirect URLs` inclua `http://localhost:5173` se quiser testar magic links em dev.
- CORS não precisa ser configurado — Supabase aceita qualquer origem com a anon key correta.

## Backup / restore

Use **Início → Dados → Exportar JSON** sempre antes de mexer em migrations grandes ou trocar de adapter local↔Supabase. Importar substitui tudo.
