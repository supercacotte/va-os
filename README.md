# SLA VA OS *(nom de code — à renommer)*

SaaS de gestion pour assistantes virtuelles indépendantes : clients → missions → tâches → temps → rapport → facture, plus procédures, portail client et extraction de tâches depuis les réunions.

**Projet porté par Caroline Franquet (Smart Lazy Club), avec Julia (advisor métier).**

## Stack

- **Front/App** : Next.js (App Router) + Tailwind CSS + shadcn/ui
- **Backend/DB** : Supabase (PostgreSQL, Auth magic link, RLS, Edge Functions)
- **Déploiement** : Vercel
- **Intégrations** : Qonto (OAuth, facturation), Google Calendar (lecture), Fireflies / Granola / Fathom (réunions), Toggl (import)
- **IA** : Claude API (extraction de tâches depuis transcripts)

## Design system

Fond crème `#FCF9E8` · Navy `#19192C` · Carmin `#E8005A` (actions) · Titres Clash Display · Corps Satoshi · UI en français, tutoiement.

## Lancer en local

```bash
npm install
cp .env.example .env.local   # remplir les valeurs (voir gestionnaire de mots de passe)
npm run dev
```

## Environnements

| Env | URL | Notes |
|---|---|---|
| Production | *(URL Vercel à compléter)* | Branche `main` |
| Supabase | *(URL projet à compléter)* | Région EU |

## Documentation

- [`docs/PRD.md`](docs/PRD.md) — le cahier des charges qui fait foi (scope V1 gelé)
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — journal des décisions structurantes
- [`docs/PROMPTS_LOG.md`](docs/PROMPTS_LOG.md) — journal des sessions Bolt
- [`docs/TODO_CLAUDE_CODE.md`](docs/TODO_CLAUDE_CODE.md) — chantier réservé à la phase Claude Code (fin août)

**Règle anti-dérive :** toute nouvelle idée de feature va dans `docs/V2.md`, jamais directement dans le code.
