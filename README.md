# VA Desk — SaaS pour assistantes virtuelles

> « Tout votre business, au même endroit. »

Cockpit d'opérations pour assistantes virtuelles indépendantes :
**clients → missions → tâches → chrono → rapport d'activité → facture**.

Conçu avec Julia (VA partenaire). Beta-testé par la communauté Smart Lazy Club.

## Stack (alignée sur le repo de référence `supercacotte/smart-lazy-club`)

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Prisma 7 + PostgreSQL** (self-hosted, migrations versionnées)
- **NextAuth v5** — credentials (bcrypt) + magic link (Resend), sessions JWT avec rôle
- **Stripe** — abonnements (Essentielle 19 € / Pro 29 €)
- **Tailwind v4** — tokens CSS via `@theme inline`
- **Déploiement** : Vercel + Prisma Postgres (comme le repo de référence)

## Documentation

| Fichier | Rôle |
|---|---|
| `docs/PRD.md` | Produit : vision, personas, scope V1 gelé, modèle de données |
| `docs/DECISIONS.md` | Journal des décisions — fait foi en cas de doute |
| `docs/ARCHITECTURE.md` | Patterns repris du repo de référence, fichier par fichier |
| `docs/BUILD_PLAN.md` | Plan de build par phases (Claude Code) jusqu'à la V1 septembre |
| `docs/SESSIONS_LOG.md` | Journal des sessions de dev (à tenir à chaque session) |

## Règles de travail

1. **Le PRD fait foi.** Toute nouvelle idée va dans la section V2/V3 du PRD, pas dans le code.
2. **Une session = une entrée dans `SESSIONS_LOG.md`** (contexte, ce qui a été fait, ce qui coince).
3. **Toute décision structurante = une ligne dans `DECISIONS.md`**, datée.
4. **On copie avant de réinventer** : si le repo de référence a déjà résolu le problème (auth, admin, upload, Stripe), on reprend son pattern.

## Démarrage (une fois le squelette forké)

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Variables d'environnement attendues : `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
