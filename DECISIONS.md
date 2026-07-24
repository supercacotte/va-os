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
| D11 | **Révisée le 23/07** : uploads via Vercel Blob (hébergement Vercel, filesystem éphémère) ; la validation type/taille de `lib/upload.ts` est conservée | ✅ 23/07 | Pas de volume persistant sur Vercel ; Blob est le stockage natif de la plateforme |
| D12 | Multi-tenancy applicative (pas de RLS Postgres) : tout accès passe par des fonctions de data-access filtrées par `vaId` — jamais de `prisma.x.findMany` nu dans une page | ⏳ | Prisma n'apporte pas le filet RLS de Supabase ; la discipline doit être structurelle (voir ARCHITECTURE.md) + audit dédié en phase 10 |
| D13 | Bolt Pro (tokens jusqu'au 28/08) relégué à un usage optionnel : maquettes UI jetables uniquement, jamais de code destiné au repo | ⏳ | Éviter deux bases de code divergentes |
| D14 | **Tranchée le 23/07** : identité **VA Desk** (tagline « Tout votre business, au même endroit. ») — palette lavande `#C5C4FF`, rose `#FFB6E3`, citron `#E3F85A`, orange `#FCA049`, fond `#EBEAE5`, ink `#202221`, blanc `#FBFBF9`, olive `#CBC064` ; principe : app lisible, texte toujours ink sur fonds clairs, couleurs en accents/surfaces uniquement | ✅ 23/07 | Identité propre au produit (distincte du site SLC), pensée pour un outil de travail quotidien |

| D15 | Rapports **persistés** (modèle `Report`, un par client × mois, « générer » = action explicite de la VA) + **toggle de visibilité portail par client** (`Client.portalReportsEnabled`, défaut ON) : le portail ne montre que les rapports générés d'un client dont le toggle est actif | ✅ 23/07 | Maquettes 15a/16c validées par Caroline ; remplace la V1 « tous les mois avec du temps sont visibles » (note de la session Phase 5) |

| D16 | **Tâches récurrentes en V1** : modèle `RecurringTask` (titre, mission, cadence hebdo/mensuelle) + génération **paresseuse** de l'occurrence de la période au chargement — pas de cron. Arrêter une récurrence ne touche pas aux occurrences passées | ✅ 24/07 | Besoin cœur de métier (pré-compta mensuelle, reporting…) ; occurrences = Task normales, chrono/rapports/portail inchangés |
| D17 | **Annuaire public de VA en V1** : `/annuaire` sans connexion, profils **opt-in uniquement** (`VaProfile.published`, défaut false), recherche nom/spécialité, contact direct email/site. Pas de modération admin en V1 (à ajouter si abus) | ✅ 24/07 | Canal d'acquisition : les VA se référencent, les clients potentiels les trouvent |

## Modèle d'entrée pour les prochaines décisions

```
| D15 | [décision] | ✅ JJ/MM | [justification en une phrase] |
```
