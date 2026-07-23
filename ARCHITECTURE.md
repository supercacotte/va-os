# ARCHITECTURE.md — Patterns repris du repo de référence

Repo de référence : `github.com/supercacotte/smart-lazy-club` (smartlazyclub.com).
Ce document dit précisément **ce qu'on copie tel quel, ce qu'on adapte, et ce
qui est nouveau** — pour que chaque session Claude Code parte des bons fichiers.

## 1. À copier tel quel (ou quasi)

| Fichier du repo | Rôle | Notes |
|---|---|---|
| `src/auth.ts` | NextAuth v5 : credentials + magic link Resend, rôle dans JWT | Remplacer l'enum de rôles par `VA / CLIENT / ADMIN` |
| `src/lib/actions/auth.ts` | Signup/login en Server Actions + Zod + vérification email | Adapter le schéma Zod (rôle par défaut VA) |
| `src/lib/prisma.ts` | Singleton Prisma | Identique |
| `src/lib/mailer.ts` + `src/lib/email-templates.ts` | Envoi d'emails Resend + templates HTML | Rebrander les templates |
| `src/lib/upload.ts` | Upload avec validation type/taille | Adapter : stockage Vercel Blob (D11 révisée), garder la validation |
| `src/lib/sanitize.ts` | Sanitization du HTML TipTap | Identique — sert pour les procédures (SOP) |
| `src/lib/stripe.ts` + `src/lib/billing.ts` | Client Stripe lazy + getOrCreateStripeCustomerId | Identique |
| `src/app/@auth/*` | Modales connexion/inscription en parallel + intercepting routes | Pattern à reprendre tel quel |
| `src/components/auth/*`, `Modal.tsx`, `UserMenu.tsx` | UI auth | Rebrander |
| `AGENTS.md` + avertissement Next.js 16 | Rappel : lire `node_modules/next/dist/docs/` avant de coder | **Copier impérativement** — Next 16 a des breaking changes vs les données d'entraînement |
| `src/app/globals.css` (structure) | Tokens CSS + `@theme inline` Tailwind v4 | Garder la structure, palette selon D14 |

## 2. À adapter

### Back-office admin → Dashboard VA
Le pattern admin du repo (`src/app/admin/*`, `src/components/admin/*`) est le
squelette du dashboard VA : layout dédié, protection par rôle **au niveau de
chaque page** (`if (session?.user.role !== "VA") redirect("/")`), formulaires
riches (`ContentForm`, `StepsEditor` TipTap, `IconPicker`), `RowActionsMenu`.
L'éditeur d'étapes (`StepsEditor`) devient l'éditeur de procédures quasi sans
modification.

### Stripe : payment → subscription (D10)
`src/lib/actions/purchases.ts` montre le flow complet (session checkout,
`client_reference_id`, metadata, success/cancel URLs). À transposer :
- `mode: "subscription"` + `line_items` avec des Price IDs (2 plans) ;
- route webhook `/api/stripe/webhook` (n'existe pas dans le repo — le repo
  confirme les achats via la page succès) : gérer `checkout.session.completed`,
  `customer.subscription.updated`, `customer.subscription.deleted`,
  `invoice.payment_failed` → mettre à jour `Subscription.status` ;
- middleware de gating : plan Pro requis pour la sync réunions.

### Schéma Prisma
Conventions du repo à conserver : `cuid()`, enums, `onDelete: Cascade`,
`@@unique` composés, generator `prisma-client` avec output custom
(`src/generated/prisma`). Draft complet : PRD §6.

## 3. Nouveau (n'existe pas dans le repo de référence)

| Brique | Point d'attention |
|---|---|
| **Multi-tenancy** (D12) | Voir §4 ci-dessous — c'est LE sujet de sécurité du projet |
| **Chrono** | Server Action start/stop + état côté client ; une seule entrée active par VA ; édition a posteriori |
| **Rapport d'activité + PDF** | Génération côté serveur avec react-pdf (serverless-friendly — pas de puppeteer sur Vercel) |
| **Portail client** | Layout séparé `src/app/portail/*`, rôle CLIENT, 3 pages max |
| **OAuth Qonto** | Flow OAuth complet + stockage tokens chiffrés (table dédiée, secret en env) |
| **Ingestion réunions** | Route webhook générique `/api/inbound/[provider]` + table `MeetingItem` dédupliquée par `@@unique([provider, externalId])` ; polling Granola via n8n existant sur le VPS |

## 4. Autorisation sans RLS — règles non négociables (D12)

Supabase donnait un filet de sécurité (RLS). Prisma n'en donne aucun. Donc :

1. **Toute lecture/écriture métier passe par `src/lib/data/*.ts`**, jamais par
   un appel Prisma direct dans une page ou un composant.
2. Chaque fonction de `lib/data` prend la session en paramètre et **filtre par
   `vaId` (ou `clientId` pour le portail) dans la clause `where` elle-même** —
   pas dans le composant appelant.
3. Les Server Actions revérifient systématiquement la session (`auth()`) et la
   propriété de la ressource avant toute mutation — comme le fait déjà
   `unlockContentAction` dans le repo.
4. Le portail client ne reçoit **jamais** d'objet contenant des données d'un
   autre client de la VA (pas de "je filtre côté client").
5. Phase 10 : audit croisé dédié — tenter d'accéder aux données d'un autre
   tenant avec un compte de test, sur chaque route.

## 5. Déploiement

Comme smartlazyclub.com : **Vercel + Prisma Postgres**, avec une base dédiée
au projet (distincte de celle du site). Conséquences du filesystem éphémère
de Vercel :
- les uploads passent par **Vercel Blob** au lieu du pattern disque local de
  `lib/upload.ts` (D11 révisée) — la validation type/taille du fichier est
  conservée telle quelle ;
- l'export PDF utilise **react-pdf** (serverless-friendly), pas de puppeteer.

Le n8n déjà présent sur le VPS sert au prototypage du polling Granola avant
internalisation.
