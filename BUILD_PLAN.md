# BUILD_PLAN.md — De zéro à la V1 (septembre 2026)

> Remplace la séquence de 12 prompts Bolt de la v1.0. Outil : **Claude Code**,
> directement sur le repo. Une phase = une ou plusieurs sessions, chacune
> loguée dans `SESSIONS_LOG.md`. On ne passe pas à la phase suivante tant que
> la précédente ne tourne pas en local.

## Phase 0 — Squelette (semaine du 28 juillet)
- Créer le repo `smart-lazy-va-os` à partir des patterns du repo de référence :
  copier `auth.ts`, `lib/` (prisma, mailer, upload, sanitize, stripe, billing),
  `@auth/*`, `AGENTS.md`, structure `globals.css`.
- Nouveau `schema.prisma` (PRD §6) + première migration + seed (1 VA de test,
  2 clients, missions/tâches factices).
- Déployer le hello-world sur Coolify dès cette phase (pipeline validé tôt).
- 📣 En parallèle : **demander l'accès API partenaire Qonto** (délai inconnu).

## Phase 1 — Auth & rôles (semaine du 28 juillet)
- Adapter l'auth aux rôles VA / CLIENT / ADMIN.
- Inscription = VA par défaut. Les comptes CLIENT sont créés par invitation
  de la VA (email + magic link), jamais par inscription libre.
- Layouts protégés : `/app` (VA), `/portail` (CLIENT), `/admin` (toi).

## Phase 2 — Clients, missions, tâches (semaine du 4 août)
- CRUD complet côté VA, sur le pattern admin du repo (formulaires Server
  Actions + Zod, RowActionsMenu).
- Fonctions `lib/data/*` filtrées par `vaId` dès la première ligne (D12).

## Phase 3 — Chrono (semaine du 4 août)
- Start/stop nommable rattaché à une tâche ; une seule entrée active.
- Liste des temps + édition a posteriori (durée, label, rattachement).

## Phase 4 — Rapport d'activité (semaine du 11 août)
- Vue par client × période : temps agrégés par mission/tâche.
- Export PDF serveur.

## Phase 5 — Portail client (semaine du 11 août)
- 3 pages : avancement, nouvelle demande (→ crée une Task `client_request`),
  rapports partagés. Rien d'autre.
- 🎯 **Jalon beta : démo à Julia + 2-3 beta-testeuses SLC. Ne pas repousser.**

## Phase 6 — Abonnements Stripe (semaine du 18 août)
- 2 Price IDs, checkout `mode: subscription`, webhook
  `/api/stripe/webhook`, table `Subscription`, gating du plan Pro.
- Page "Mon abonnement" (portail de facturation Stripe hébergé).

## Phase 7 — Facturation Qonto (semaine du 18 août, si accès API obtenu)
- OAuth Qonto par VA, tokens chiffrés.
- Bouton "Générer la facture" depuis un rapport d'activité → brouillon Qonto.
- ⚠️ Si l'accès API traîne : la V1 sort avec export PDF seul, Qonto en V1.1.

## Phase 8 — Procédures / SOP (semaine du 25 août)
- Éditeur repris de `StepsEditor` (TipTap + sanitize).
- Templates SLC pré-chargés (seed), flag `isSlcTemplate`.

## Phase 9 — Sync réunions, plan Pro (semaine du 25 août)
- Route `/api/inbound/[provider]` + table `MeetingItem` dédupliquée.
- Adapter 1 : Fireflies (webhooks). Adapter 2 : Granola (polling n8n → route).
- Extraction de tâches : appel Claude API, tâches créées en `source:
  meeting_sync` avec écran de validation avant insertion. Fathom → V1.1.

## Phase 10 — Sécurité & polish (semaine du 1er septembre)
- Audit multi-tenant croisé (ARCHITECTURE.md §4.5) sur toutes les routes.
- Rate limiting sur les routes publiques, revue des emails, états vides, 404.
- Onboarding première connexion (checklist "ajoute ton premier client").

## Phase 11 — Beta ouverte (semaine du 8 septembre)
- Ouverture aux beta-testeuses SLC, collecte de feedback structurée.

**Rappels de méthode** : commits atomiques par feature ; jamais de secret en
dur ; chaque session commence par relire `DECISIONS.md` et la dernière entrée
de `SESSIONS_LOG.md`.
