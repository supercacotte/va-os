# DECISIONS.md — Journal des décisions

> Règle : toute décision structurante est datée et justifiée ici. En cas de
> doute pendant le build, ce fichier fait foi avec le PRD.

## Décisions v1.0 (16 juillet 2026) — reconduites

| # | Décision | Justification |
|---|---|---|
| D1 | OAuth "bring your own account" par défaut pour les outils tiers | Pas de gestion de comptes mutualisés ; la VA connecte ses propres comptes |
| D2 | Facturation entièrement déléguée à l'API Qonto | Évite un moteur de facturation interne et la conformité Factur-X |
| D3 | Chrono développé en interne | Cœur du produit, pas de dépendance Toggl |
| D4 | WhatsApp/Telegram reportés en V2 | API non officielles bannissables ; onboarding Meta disproportionné en self-service à 19-29 € |
| D5 | Scope d'envoi Gmail exclu de la V1 | Revue de sécurité CASA de Google trop lourde |
| D6 | Sync réunions = couche d'ingestion unifiée, 3 adapters : Fireflies (webhooks) → Granola (polling) → Fathom (V1.1) | Un modèle interne unique, des adapters interchangeables |
| D7 | Pas de coffre-fort de mots de passe persistant en V1 (partage éphémère seulement) ; pas de mode équipe ; pas de curseur d'efficience | Responsabilité/crypto sérieuse ; scope V1 tenable |

## Décisions v1.1 (23 juillet 2026)

| # | Décision | Statut | Justification |
|---|---|---|---|
| D8 | **Pivot de stack : abandon de Bolt + Supabase → Next.js 16 + Prisma + PostgreSQL + NextAuth v5, en forkant les patterns du repo `supercacotte/smart-lazy-club`** | ⏳ À confirmer par Caroline | Le repo de référence résout déjà auth, admin, Stripe, upload, emails ; stack maîtrisée en interne ; déploiement identique (Coolify). Un build Bolt aurait imposé une migration complète ensuite |
| D9 | Auth reprise telle quelle du repo : NextAuth v5, credentials bcrypt + magic link Resend, rôle dans le JWT | ⏳ | Code éprouvé en production sur smartlazyclub.com |
| D10 | Stripe en mode `subscription` (2 plans) au lieu du mode `payment` du repo | ⏳ | Le repo vend des achats unitaires ; le SaaS vend un abonnement. Webhooks `customer.subscription.*` à ajouter |
| D11 | Uploads sur disque local du VPS (pattern `lib/upload.ts` du repo) en V1 | ⏳ | Suffisant à cette échelle ; S3-compatible envisageable en V2 si multi-serveur |
| D12 | Multi-tenancy applicative (pas de RLS Postgres) : tout accès passe par des fonctions de data-access filtrées par `vaId` — jamais de `prisma.x.findMany` nu dans une page | ⏳ | Prisma n'apporte pas le filet RLS de Supabase ; la discipline doit être structurelle (voir ARCHITECTURE.md) + audit dédié en phase 10 |
| D13 | Bolt Pro (tokens jusqu'au 28/08) relégué à un usage optionnel : maquettes UI jetables uniquement, jamais de code destiné au repo | ⏳ | Éviter deux bases de code divergentes |
| D14 | Palette de l'app : à trancher (palette "plage" du site vs variante sobre) | 🔲 Ouverte | Voir PRD §7 |

## Modèle d'entrée pour les prochaines décisions

```
| D15 | [décision] | ✅ JJ/MM | [justification en une phrase] |
```
