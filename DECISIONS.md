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
| D18 | **« Mon compte » honnête pendant la beta** (maquette 30b) : notifications et préférences (fuseau, arrondi chrono, début de semaine, langue) **stockées dans `UserSettings` mais pas encore effectives** (annoncé dans l'UI) ; carte Abonnement = Beta 0 €/mois, facturation désactivée jusqu'à la Phase 6 ; **portabilité dès la V1** : export ZIP de CSV (`/api/export`) + suppression de compte en cascade (comptes portail inclus, mot « SUPPRIMER » exigé côté serveur) | ✅ 24/07 | Ne jamais afficher un réglage qui ment ; « tout est à toi » est un argument produit — l'export et la suppression existent avant même le paiement |
| D19 | **Échéances sur les tâches** : `Task.dueDate` optionnelle (date seule, pas d'heure) ; les occurrences récurrentes reçoivent la leur **automatiquement** (fin de semaine ISO / fin de mois de la période, avec rattrapage des occurrences existantes) ; affichage en mots (« pour demain », « pour dimanche », « en retard — hier » en orange) et tri des tâches datées en premier | ✅ 24/07 | Retour de Caroline : « je vois que Reçus est en hebdo, mais je ne sais pas quand elle est prévue » — la date est le vrai manque pour s'organiser |
| D20 | **Réordonnancement du BUILD_PLAN (6↔8)** : Phase 6 = bibliothèque de procédures/SOP (ex-8), Phase 7 = abonnements Stripe PWYW (ex-6), Phase 8 = facturation Qonto (ex-7, placée en dernier). Décision du 23/07, consignée le 24/07 (les numéros D18/D19 étaient déjà pris) | ✅ 23/07 | La dépendance externe passe en dernier : l'accès développeur Qonto est en vérification (~7 jours) — on ne fait attendre aucune phase derrière |
| D21 | **Pricing V1 = PWYW (pay what you want)** : un seul plan, toutes les fonctionnalités V1 (sync réunions incluse — plus de gating Pro), prix mensuel libre choisi par la VA à l'abonnement — **minimum 9 €, suggéré 19 €, maximum 39 €/mois** (bornes fixées le 24/07 ; Stripe `custom_unit_amount`, mode `subscription`). Remplace le modèle 2 plans Essentielle 19 € / Pro 29 € (D10 et PRD §3 v1.1 restent dans l'historique). La segmentation par paliers revient en V2 (sync réunions + canal chat au palier supérieur) | ✅ 24/07 | Beta : maximiser l'adoption et apprendre ce que les VA sont prêtes à payer, plutôt que de deviner deux prix ; la simplicité d'un plan unique colle au positionnement « honnête » de la beta (D18) |
| D22 | **Procédures rattachées au client** (amendement de la Phase 6) : `Procedure.clientId` obligatoire, plus de bibliothèque centrale — consultation depuis la fiche client (VA) et le portail du client en **lecture seule**, ce qui fait une **4e capacité du portail** (amendement assumé de la règle des 3). Action « Dupliquer vers un autre client » côté VA ; templates SLC = modèles proposés à la création, pas des procédures visibles ; lib/data filtrée par `vaId` et, côté portail, par le `clientId` du compte connecté. Décision du 23/07, consignée le 24/07 (le numéro D19 demandé était déjà pris) | ✅ 23/07 | La 4e capacité est en lecture seule (aucune surface de support en plus) et remplace le dépôt des SOP dans le Notion du client — la procédure vit là où le client la cherche |

## Modèle d'entrée pour les prochaines décisions

```
| D15 | [décision] | ✅ JJ/MM | [justification en une phrase] |
```
