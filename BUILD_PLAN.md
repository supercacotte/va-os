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
- Déployer le hello-world sur Vercel dès cette phase (pipeline validé tôt),
  avec une base **Prisma Postgres dédiée au projet**, distincte de celle du
  site smartlazyclub.com.
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

<!-- Réordonnancement du 23/07 (D20) : 6 = SOP (ex-8), 7 = Stripe (ex-6),
     8 = Qonto (ex-7, en dernier — vérification de l'accès développeur ~7 j). -->
## Phase 6 — Procédures / SOP (ex-Phase 8) (semaine du 18 août)
- Éditeur repris de `StepsEditor` (TipTap + sanitize).
- Templates SLC pré-chargés (seed), flag `isSlcTemplate`.

## Phase 7 — Abonnements Stripe PWYW (ex-Phase 6) (semaine du 18 août)
- PWYW (D21) : un seul Price à montant libre (`custom_unit_amount` avec
  plancher), checkout `mode: subscription`, webhook `/api/stripe/webhook`,
  table `Subscription` (plan unique — plus de gating Pro en V1).
- Page "Mon abonnement" (portail de facturation Stripe hébergé).

## Phase 8 — Facturation Qonto (ex-Phase 7) (semaine du 25 août, si accès API obtenu)
- Placée en dernier : l'accès développeur Qonto est en cours de
  vérification (~7 jours) — dépendance externe, on ne bloque rien derrière.
- OAuth Qonto par VA, tokens chiffrés.
- Bouton "Générer la facture" depuis un rapport d'activité → brouillon Qonto.
- ⚠️ Si l'accès API traîne : la V1 sort avec export PDF seul, Qonto en V1.1.

## Phase 9 — Sync réunions (semaine du 25 août — incluse dans le plan PWYW, D21)
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
