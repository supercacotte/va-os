# SLA VA OS *(nom de code — à renommer)*

SaaS de gestion pour assistantes virtuelles indépendantes : clients → missions → tâches → temps → rapport → facture, plus procédures, portail client et extraction de tâches depuis les réunions.

**Projet porté par Caroline Franquet (Smart Lazy Club), avec Julia (advisor métier).**

## SEO / GEO — Voir le dossier `content/`

- **`content/seo-geo-strategie-va-caroline-franquet.md`** — stratégie SEO/GEO complète pour le marché VA
- **`content/article-pilier-devenir-va-2026.md`** — article pilier "Devenir Assistante Virtuelle en 2026" (3 500 mots, voix Caro)
- **`seo/nextjs-content/`** — tous les fichiers Next.js prêts à copier : sitemap, robots.txt, llms.txt, structured data, templates pages (outils, glossaire, comparateurs)

## Stack

- **Front/App** : Next.js (App Router) + Tailwind CSS + shadcn/ui
- **Backend/DB** : Supabase (PostgreSQL, Auth magic link, RLS, Edge Functions)
- **Déploiement** : Vercel
- **Intégrations** : Qonto (OAuth, facturation), Google Calendar (lecture), Fireflies / Granola / Fathom (réunions), Toggl (import)
- **IA** : Claude API (extraction de tâches depuis transcripts)

## Design system

Fond crème `#FXXXX8` · Rouge `#XXXXX` · Carmin `#XXXXXX` (actions) · Titres Clash Display · Corps Satoshi · UI en français, tutoiement.

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
