# AI-chat MVP

## Doel

De publieke AI-chat laat gebruikers praten met de Jaakie-kennisbank en het onderzoeksdossier. De payrollcalculator blijft deterministic en browser-only; de chat loopt via Vercel serverless, Supabase rate limiting en OpenAI file search.

## Environment variables

Zet deze variabelen in Vercel:

```text
AI_CHAT_ENABLED=true
AI_CHAT_DAILY_LIMIT=10
AI_CHAT_MAX_MESSAGE_CHARS=1000
OPENAI_API_KEY=...
OPENAI_VECTOR_STORE_ID=...
SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
```

Optioneel:

```text
AI_CHAT_MODEL=gpt-5.4-mini
AI_CHAT_MAX_HISTORY_MESSAGES=6
AI_CHAT_MAX_OUTPUT_TOKENS=900
AI_CHAT_IP_HASH_SALT=...
```

Gebruik nooit `VITE_` voor OpenAI- of Supabase-secrets.

## Supabase

Pas de migration toe in Supabase SQL Editor:

```text
supabase/migrations/202605250001_ai_chat_usage.sql
```

De migration maakt:

- `ai_chat_usage` voor dagtellers per gehashte IP;
- `ai_chat_events` voor minimale eventlogging;
- `increment_ai_chat_usage(...)` als atomische RPC.

## Corpus indexeren

1. Pull Vercel env lokaal:

```powershell
pnpm exec vercel env pull .env.local
```

Gebruik eventueel:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
pnpm exec vercel env pull .env.local --environment=preview --yes
```

Sensitive Vercel-secrets kunnen lokaal als lege waarden verschijnen. Vul voor lokale indexering en `vercel dev` zelf deze waarden in `.env.local` in, of maak aparte Development env vars aan:

```text
OPENAI_API_KEY
SUPABASE_URL
SUPABASE_SECRET_KEY
```

2. Indexeer de kennisbank:

```powershell
bun run ai:index
```

3. Zet de geprinte waarde in Vercel:

```text
OPENAI_VECTOR_STORE_ID=vs_...
```

Wanneer `OPENAI_VECTOR_STORE_ID` lokaal ontbreekt, maakt het script een nieuwe vector store aan. Wanneer de variabele bestaat, uploadt het script naar die bestaande vector store.

De eerste MVP-index is aangemaakt en getest met `gpt-5.4-mini` + file search. `.url`-bestanden worden bewust niet geupload omdat OpenAI file uploads die extensie niet accepteren; de inhoudelijke corpusbestanden blijven beperkt tot `.md`, `.json` en `.html`.

## Lokaal testen

Gebruik Vercel dev voor de chatbot:

```powershell
pnpm exec vercel dev
```

`pnpm dev` blijft bruikbaar voor de gewone calculator, maar serveert geen Vercel `/api/chat` endpoint.
