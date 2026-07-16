# PRD — SaaS de gestion pour Assistantes Virtuelles
### Nom de code : Smart Lazy Club (provisoire) · V1 — cible : début septembre 2026
*Rédigé le 10 juillet 2026 · Base : transcript Caroline × Julia + décisions produit des échanges de cadrage*

---

## 1. Vision & positionnement

**Le cockpit d'exploitation des assistantes virtuelles indépendantes.** Un seul outil qui remplace la pile bricolée Toggl + Notion + tableur de facturation + WhatsApp, organisé autour du flux réel du métier :

> Client → Mission → Tâches → Temps → Rapport → Facture

**Différenciation** (ce qu'aucun concurrent horizontal ne fait) :
1. La chaîne **temps → rapport d'activité → facture Qonto** fermée de bout en bout.
2. Les **procédures (SOPs)** liées aux clients et aux missions, avec bibliothèque de templates fournie (synergie directe avec la librairie Smart Lazy Club existante).
3. Les **réunions Granola transformées en tâches** automatiquement (tier Pro).
4. Un **portail client** minimaliste qui crée du lock-in par les habitudes des clients finaux.

**Philosophie produit :** "la flemme est un signal stratégique" — chaque écran doit réduire une friction identifiée dans le quotidien réel d'une VA, jamais ajouter un rituel de saisie.

**Non-objectifs V1 (explicites) :** pas de mode agence/équipe, pas de coffre-fort de mots de passe persistant, pas d'envoi d'emails depuis le Gmail de l'assistante (scope Google restreint), pas d'ingestion automatique des emails clients, pas de curseur d'efficience, pas de calendrier prédictif IA, pas d'app mobile.

---

## 2. Personas & rôles

| Rôle | Description | Accès |
|---|---|---|
| **Assistante (owner)** | VA indépendante française, 3-10 clients actifs, facture 40-70 €/h ou au forfait. Utilise déjà Toggl/Notion/Granola de façon dispersée. | Application complète |
| **Client final (guest)** | Entrepreneur/dirigeant servi par l'assistante. Invité par email, ne paie rien. | Portail client uniquement, scopé à sa propre relation |

Un client final peut être lié à plusieurs assistantes (rare mais possible) : la relation est portée par la table `clients`, pas par le compte utilisateur.

---

## 3. Offre & pricing

| | **Essentielle — 19 €/mois** | **Pro — 29 €/mois** |
|---|---|---|
| Cockpit complet (clients, missions, tâches, timer, statuts) | ✅ | ✅ |
| Rapports d'activité + facturation Qonto 1 clic | ✅ | ✅ |
| Procédures + bibliothèque de templates | ✅ | ✅ |
| Portail client (illimité) | ✅ | ✅ |
| Extraction de tâches depuis transcript (copier-coller) | ✅ | ✅ |
| **Sync réunions automatique** (Fireflies, Granola, Fathom → tâches) | ❌ | ✅ |
| Import Toggl (historique) | ✅ | ✅ |
| Partage éphémère d'accès sécurisés | ✅ | ✅ |

- Essai gratuit 14 jours sans CB. Annuel : 2 mois offerts.
- Le tier Pro fonctionne avec le notetaker de l'assistante : Fireflies (accès API dès le plan gratuit), Granola (nécessite le plan Business à 14 $/mois — option sans bot) ou Fathom. Affiché honnêtement dans le pricing.
- Infra cible : coût marginal quasi nul (Supabase free/pro tier + Vercel) pour préserver la marge à 19-29 €.

---

## 4. Scope fonctionnel V1

### 4.1 Dashboard "Aujourd'hui" (écran d'accueil)
Agrège en un écran : timer en cours (s'il tourne) · tâches dues aujourd'hui/en retard · missions **En attente client** depuis > 3 jours · prospects à relancer · factures en brouillon à valider · dernières réunions Granola rattachées. C'est la réponse quotidienne à "qu'est-ce que je fais maintenant ?". Chaque item est actionnable en 1 clic.

### 4.2 Clients (mini-CRM intégré)
- Fiche client : coordonnées, entreprise, **statut** (`prospect` / `actif` / `à relancer` / `perdu`), taux horaire ou forfait mensuel, devise, seuil d'alerte forfait (%), date de prochaine relance, notes libres, canal de contact préféré.
- Vue liste filtrable par statut. Les relances dues remontent dans "Aujourd'hui".
- Alerte "80 % du forfait mensuel consommé" (calculée sur les time entries du mois).
- **Pas** de pipeline deals, pas d'objets custom : le CRM est une vue sur l'entité client existante.

### 4.3 Missions & tâches
- Hiérarchie : Client → Missions → Tâches (conforme au modèle mental du transcript : "vacances Cap-Ferret" = mission ; "réserver le restaurant" = tâche).
- **Double titre de mission** : titre client (celui de la demande d'origine, non modifié) + titre interne (renommable par l'assistante).
- **Statuts de mission** : `Nouvelle → En cours → En attente client → Terminée → Facturée`. Le passage à "En attente client" horodate l'attente (compteur visible côté portail : "Marie attend votre réponse depuis 4 jours").
- Tâches : titre, description, due date, done/todo, lien vers time entries.
- **Fil de mission** : notes/messages chronologiques. Chaque entrée porte un champ `source` manuel (Email / WhatsApp / Meet / Téléphone / Portail / Interne). Les messages du portail client s'y insèrent automatiquement. Recherche plein texte sur les fils (le cas "je suis sûre qu'il me l'a partagé, mais où ?").
- Archives : missions terminées/facturées consultables et cherchables, jamais supprimées.

### 4.4 Timer
- Gros bouton on/off global, toujours accessible (barre persistante). Un timer actif à la fois.
- Une time entry = tâche (ou mission) + libellé + start/stop. Libellé pré-rempli avec le titre de la tâche.
- Édition a posteriori : ajustement des heures, ajout manuel rétroactif ("45 min sur Cap-Ferret hier"), suppression.
- Garde-fou : notification si un timer tourne depuis > 3 h ("c'est normal ?").
- Champ facultatif `temps_facturé` distinct du temps mesuré (sans curseur d'efficience — simple override manuel à la validation du rapport).

### 4.5 Rapport d'activité mensuel
- Généré par client et par période : missions, tâches, libellés de time entries, totaux d'heures, montant théorique.
- Rendu web brandé (logo/couleurs de l'assistante) + export PDF.
- C'est la marche intermédiaire obligatoire avant facturation : le rapport validé alimente la facture.

### 4.6 Facturation (Qonto OAuth)
- Connexion "Connecter mon compte Qonto" (OAuth 2.0, Developer Portal Qonto, sandbox pour le dev).
- Le dernier jour du mois (ou à la demande) : génération automatique du **brouillon** de facture depuis le rapport validé → notification → l'assistante vérifie → envoi en 1 clic **via Qonto** (numérotation, mentions légales, conformité PDP/Factur-X portées par Qonto).
- Option par client : "envoi 100 % automatique" (opt-in explicite, off par défaut).
- Fallback sans Qonto : export du rapport en PDF + montant, l'assistante facture ailleurs (pas de moteur de facture interne en V1).

### 4.7 Procédures (SOPs)
- Éditeur guidé par template : **Déclencheur** (récurrence ou événement) · **Accès nécessaires** · **Étapes** · **Résultat attendu** · **Temps standard**.
- Deux niveaux : procédure **générique** (bibliothèque de l'assistante) et procédure **instanciée par client** (copie liée, spécificités locales).
- Liaison mission ↔ procédure : à l'ouverture d'une mission, suggestion manuelle de la procédure pertinente (tagging automatique = V2).
- **Bibliothèque Smart Lazy fournie** : 20-30 templates pré-remplis à l'onboarding (pré-compta, tri de messagerie, préparation de déplacement, onboarding client, gestion d'agenda…). Contenu produit par Caroline, actif différenciant.
- Export PDF brandé d'une procédure (livrable client).

### 4.8 Réunions & extraction de tâches (multi-provider)
- **Entrée universelle (tous tiers)** : zone "coller un transcript" → pipeline Claude API → extraction structurée : action items (titre, client détecté, deadline détectée), demandes signalées "devisables", proposition de compte-rendu. L'assistante coche → création des tâches dans la bonne mission.
- **Sync automatique (tier Pro)** — architecture : une couche d'ingestion unifiée (normalisation vers `meetings` : titre, participants, occurred_at, résumé, transcript) alimentée par **trois adapters** :
  - **Fireflies** (priorité 1) : clé API + **webhook natif** "Transcription complete" (POST signé HMAC SHA-256, header `x-hub-signature`). Accès API dès le plan gratuit (50 req/jour ; 500/jour en Pro). Le plus rapide à valider de bout en bout.
  - **Granola** (priorité 2) : clé API personnelle `grn_…` (plan Business 14 $/mois requis). Read-only, sans webhook → polling `GET /v1/notes?created_after=` toutes les 10-15 min (cursor pagination, backoff 429). Notes disponibles seulement une fois résumé+transcript générés (latence minutes → 1 h). L'option premium **sans bot** recommandée in-app. **Jamais** de workspace Granola mutualisé entre assistantes (confidentialité inter-clients) : une clé personnelle par assistante.
  - **Fathom** (priorité 3, glisse en V1.1 si le planning frotte) : clé API (`X-Api-Key`, `api.fathom.ai/external/v1`) + **webhooks natifs** dont le payload inclut transcript, résumé et action items. ⚠️ Vérifier semaine 1 quels plans Fathom incluent l'accès API.
- En aval des trois adapters, pipeline commun : matching client (heuristique : emails participants ↔ contacts client, mots-clés du titre) → file **"Réunions à rattacher"** pour les non-matchées → extraction Claude → écran de validation.
- UX calibrée sur la latence des providers : "ta réunion de 14 h apparaît vers 15 h avec ses tâches extraites".

### 4.9 Portail client
Trois capacités, pas une de plus :
1. **Créer une demande** (titre + description + pièces jointes) → devient une mission "Nouvelle".
2. **Répondre dans le fil** d'une mission.
3. **Voir l'état** de ses missions (statuts, y compris "En attente de votre réponse depuis X jours").
- Invitation par email (magic link), branding de l'assistante, aucune configuration côté client.

### 4.10 Partage éphémère d'accès
- Côté portail : "Transmettre un accès sécurisé" → champ chiffré → lien à usage unique, autodestruction après lecture ou expiration (72 h par défaut).
- Côté assistante : le secret est affiché une fois, jamais stocké en clair, trace horodatée "un accès a été transmis le X" dans le fil de mission.
- Recommandation in-app d'un coffre partagé (1Password/Bitwarden) pour les accès permanents. Intégration du bouton **"Save in 1Password"** sur l'écran de réception (enregistrement direct navigateur → coffre de l'assistante) : nice-to-have V1.5.

### 4.11 Onboarding "aha moment" (< 10 minutes)
Parcours forcé à la première connexion :
1. Créer son premier client (ou **importer depuis Toggl** — V1.5).
2. Créer une mission + lancer/arrêter un timer sur une tâche.
3. Générer un **rapport de démo** avec ces données → l'assistante voit à quoi ressemblera sa fin de mois dès le jour 1.
4. (Pro) Coller sa clé Granola → première réunion ingérée.
Checklist de progression visible, état vide de chaque écran = tutoriel contextuel.

---

## 5. Scope V2 / V3 (gelé, pour mémoire)

**V2 :** ingestion email automatique (adresses dédiées type "Pikachu36") · tagging auto des missions + suggestion auto de procédure · relances email automatisées · connecteur Pennylane · import Google Calendar enrichi (rattachement auto réunion ↔ client) · génération de devis · brouillons d'emails IA in-app (copier / mailto) · bibliothèque de procédures communautaire (partage entre membres Smart Lazy Club) · facturation programmée 100 % auto par défaut.

**V3 :** mode agence multi-assistantes (plan 49-79 €) avec efficience/supervision · coffre-fort persistant ou intégration profonde gestionnaire de mots de passe · bot d'enregistrement self-hosted (type Vexa) pour le hors-Granola · calendrier prédictif de charge · apps mobiles.

---

## 6. Modèle de données (Supabase / PostgreSQL)

```
users                 -- auth Supabase (assistantes ET clients finaux)
  id uuid PK, email, full_name, role enum('assistant','client'), created_at

assistant_profiles
  user_id uuid PK→users, brand_name, logo_url, brand_color,
  siret, address, default_hourly_rate numeric, currency char(3),
  plan enum('trial','essentielle','pro'), trial_ends_at,
  onboarding_state jsonb

clients
  id uuid PK, assistant_id uuid→users, company_name, contact_name,
  contact_email, status enum('prospect','actif','a_relancer','perdu'),
  billing_mode enum('hourly','retainer'), hourly_rate numeric,
  retainer_hours numeric, retainer_alert_pct int default 80,
  next_followup_date date, preferred_channel text, notes text,
  qonto_client_id text, created_at, archived_at

client_portal_access
  id uuid PK, client_id uuid→clients, user_id uuid→users,
  invited_at, accepted_at

missions
  id uuid PK, client_id uuid→clients, assistant_id uuid→users,
  title_internal text, title_client text,
  status enum('nouvelle','en_cours','attente_client','terminee','facturee'),
  waiting_since timestamptz, source enum('portail','manuel','email','autre'),
  procedure_id uuid→procedures NULL, created_at, closed_at

tasks
  id uuid PK, mission_id uuid→missions, title, description,
  due_date date, is_done bool, done_at, created_from enum('manuel','extraction','portail'),
  meeting_id uuid→meetings NULL, position int

time_entries
  id uuid PK, task_id uuid→tasks NULL, mission_id uuid→missions,
  assistant_id uuid→users, label text,
  started_at timestamptz, stopped_at timestamptz NULL,  -- NULL = timer actif
  duration_minutes int GENERATED, billed_minutes int NULL,  -- override manuel
  is_manual bool default false

mission_messages   -- fil de mission
  id uuid PK, mission_id uuid→missions, author_user_id uuid→users,
  body text, source enum('email','whatsapp','meet','telephone','portail','interne'),
  attachments jsonb, created_at
  -- index GIN plein texte sur body

procedures
  id uuid PK, assistant_id uuid→users, client_id uuid→clients NULL,  -- NULL = générique
  parent_template_id uuid NULL, title, trigger_type enum('recurrence','evenement','manuel'),
  trigger_detail text, required_access text, steps jsonb,
  expected_output text, standard_minutes int, updated_at

procedure_templates  -- bibliothèque Smart Lazy (lecture seule, seedée)
  id uuid PK, title, category, ...mêmes champs de contenu

meetings
  id uuid PK, assistant_id uuid→users, provider enum('granola','fireflies','fathom','paste'),
  provider_note_id text UNIQUE NULL, title, occurred_at, participants jsonb,
  summary text, transcript jsonb, client_id uuid→clients NULL,  -- NULL = à rattacher
  extraction_status enum('pending','done','skipped'), created_at

extracted_items
  id uuid PK, meeting_id uuid→meetings, kind enum('task','devisable','note'),
  payload jsonb,  -- titre, deadline détectée, client suggéré, confiance
  status enum('proposed','accepted','rejected'), task_id uuid→tasks NULL

reports
  id uuid PK, assistant_id, client_id, period_start date, period_end date,
  status enum('draft','validated'), totals jsonb, pdf_url text, created_at

invoices
  id uuid PK, report_id uuid→reports, client_id, amount numeric, currency,
  status enum('draft','pending_review','sent','error'),
  qonto_invoice_id text, sent_at, auto_send bool default false

integrations
  id uuid PK, assistant_id uuid→users,
  provider enum('qonto','google_calendar','granola','fireflies','fathom','toggl'),
  access_token_enc text, refresh_token_enc text, expires_at,
  scopes text[], external_account_id text, status enum('active','revoked','error'),
  created_at
  -- tokens chiffrés (pgsodium / Supabase Vault), JAMAIS en clair

secure_shares
  id uuid PK, client_id uuid→clients, mission_id uuid NULL,
  ciphertext text, created_by uuid→users, expires_at timestamptz,
  consumed_at timestamptz NULL, created_at
  -- purge automatique post-consommation/expiration (pg_cron)
```

**Règle d'or multi-tenant :** toute table métier porte directement ou par jointure un `assistant_id`. **RLS activée sur 100 % des tables** :
- Assistante : accès uniquement aux lignes de son `assistant_id`.
- Client final : accès uniquement aux missions/messages/shares liés à son `client_portal_access`, et uniquement aux champs exposés (jamais `title_internal`, jamais les time entries brutes, jamais les procédures).
- Aucune requête côté client sans RLS ; les crons/webhooks passent par le service role côté serveur uniquement.

---

## 7. Architecture des intégrations

| Intégration | Méthode | Tier | Notes clés |
|---|---|---|---|
| **Qonto** | OAuth 2.0 (Developer Portal + sandbox) | Tous | Endpoints Client Invoices (création de facture). Conformité e-invoicing (PDP/Factur-X) portée par Qonto. Se limiter aux scopes facturation — pas de lecture de transactions (territoire DSP2). |
| **Google Calendar** | OAuth 2.0, scope `calendar.readonly` | Tous | Scope "sensible" (vérification légère Google, pas de CASA). Affichage de la journée dans "Aujourd'hui". Aucun scope Gmail en V1. |
| **Fireflies** | Clé API + webhook natif (signature HMAC) | Pro | Push temps réel "Transcription complete". API dès le plan gratuit (50 req/jour). Adapter prioritaire. |
| **Granola** | Clé API personnelle `grn_` (plan Business requis) | Pro | Read-only, pas de webhooks → polling 10-15 min via cron, pagination cursor, backoff 429. Option sans bot. Une clé par assistante, jamais de workspace partagé. |
| **Fathom** | Clé API `X-Api-Key` + webhooks natifs | Pro (V1.1 si planning tendu) | Payload webhook inclut transcript, résumé, action items. Vérifier semaine 1 les plans incluant l'API. |
| **Toggl** | Token API (import one-shot) | Tous (V1.5) | Migration : clients, projets, historique de time entries. |

**Flux serveur (jamais dans le navigateur) :** tous les appels aux APIs tierces passent par le backend (Edge Functions Supabase ou n8n en prototypage) avec les tokens déchiffrés côté serveur. Le front ne voit jamais un token.

**Prototypage vs production :** le polling Granola et le cron de facturation peuvent tourner sur le n8n existant (Coolify) pendant la beta, puis être internalisés en Edge Functions/pg_cron avant l'ouverture payante. Décision assumée pour tenir septembre.

---

## 8. Design system

- **Couleurs** : carmin `#E8005A` (actions, accents) · navy `#19192C` (texte, surfaces sombres) · cream `#FCF9E8` (fonds).
- **Typographies** : Clash Display (titres) · Satoshi (corps).
- Ton : chaleureux, direct, tutoiement, vocabulaire du métier (mission, relance, forfait) — jamais de jargon SaaS anglophone dans l'UI.
- Composants : shadcn/ui + Tailwind (défauts Bolt), thémés dès le premier prompt pour éviter le look "template Bolt".
- Écrans denses mais calmes : le dashboard "Aujourd'hui" est la vitrine — il doit être montrable en screenshot marketing dès la V1.

---

## 9. Séquence de prompts Bolt (ordre impératif)

> Un prompt = une feature. Mode diff systématique. GitHub connecté au prompt 0. Chaque étape se termine par un test manuel avant la suivante.

0. **Setup** : projet Next.js + Supabase (auth email/magic link), Tailwind thémé (tokens §8), layout app (sidebar clients, barre timer persistante), déploiement Vercel, repo GitHub.
1. **Schéma & RLS** : création de toutes les tables du §6 avec RLS policies (fournir le schéma verbatim). Seed de données de démo.
2. **Clients** : CRUD fiche client complète, vue liste + filtres statut, champ relance.
3. **Missions & tâches** : hiérarchie, double titre, statuts + horodatage "attente client", CRUD tâches.
4. **Timer** : bouton global on/off, time entries, édition/ajout rétroactif, garde-fou 3 h.
5. **Fil de mission** : messages + source + pièces jointes + recherche plein texte.
6. **Dashboard "Aujourd'hui"** : agrégation (timer, tâches dues, attentes client > 3 j, relances, factures draft).
7. **Rapport d'activité** : génération par client/période, rendu brandé, export PDF, validation.
8. **Procédures** : éditeur template guidé, générique vs instanciée, liaison mission, export PDF, seed bibliothèque.
9. **Portail client** : rôle guest, magic link, 3 capacités, RLS renforcée (audit spécifique à ce prompt).
10. **Extraction transcript (coller)** : zone de collage → Edge Function → Claude API → extracted_items → écran de validation → création de tâches.
11. **Onboarding** : parcours 4 étapes, checklist, états vides tutoriels.
12. **[Reprise Claude Code — hors Bolt]** OAuth Qonto + brouillon de facture + envoi 1 clic ; couche d'ingestion réunions + adapters (Fireflies webhook → Granola polling → Fathom webhook) ; partage éphémère ; audit RLS complet ; import Toggl.

Les intégrations (12) se font volontairement **après** l'export du repo, sous Claude Code : Bolt est mauvais sur les flows OAuth serveur et c'est là que se joue la sécurité.

---

## 10. Planning (10 juillet → début septembre)

| Semaine | Jalon |
|---|---|
| **14-20 juil.** | PRD validé avec Julia · comptes créés (Qonto Developer Portal + sandbox, Google Cloud project, Granola Business pour test) · maquette rapide du dashboard "Aujourd'hui" · prompts 0-2 |
| **21 juil. - 3 août** | Prompts 3-7 : cœur clients/missions/timer/rapport fonctionnel avec données réelles (dogfooding immédiat sur tes propres clients) |
| **4-17 août** | Prompts 8-11 : procédures, portail, extraction, onboarding · rédaction des 20-30 templates de procédures · email partenariat Granola envoyé |
| **18-28 août** | Export repo (avant expiration des tokens Bolt le 28) · Claude Code : Qonto, Granola sync, partage éphémère, audit RLS |
| **29 août - 7 sept.** | Beta fermée : Julia + 2-3 VAs du Smart Lazy Club · corrections · page pricing 2 tiers |
| **Début sept.** | V1 ouverte aux membres du Club (early bird), itération sur retours |

**Règle anti-dérive :** le scope §4 est gelé. Toute nouvelle idée va dans un fichier `V2.md`, pas dans Bolt. Si le planning frotte fin août, ordre de sacrifice : adapter Fathom (→ V1.1) → partage éphémère → import Toggl → (en dernier recours) la sync réunions se réduit à Fireflies seul, Granola en V1.1.

---

## 11. Risques & parades

| Risque | Parade |
|---|---|
| Faille RLS multi-tenant (le classique des apps vibe-codées) | Audit dédié sous Claude Code (prompt 12) + tests d'accès croisés avec 2 comptes avant toute beta |
| Validation OAuth Qonto plus lente que prévu | Demander l'accès Developer Portal **semaine 1** ; fallback = export PDF du rapport |
| Rate limits / évolutions API notetakers (Granola, Fireflies, Fathom) | Adapters isolés derrière une couche d'ingestion commune + feature flag par provider ; backoff + polling espacé (Granola) ; fallback copier-coller toujours présent |
| Tokens Bolt épuisés avant la fin | Prompts atomiques, mode diff, jamais de "refais tout" ; le repo est exportable à tout moment |
| Beta-testeuses silencieuses | Recruter dans le Club avec deal explicite (gratuité 6 mois contre 1 call de feedback/semaine) |
| Scope creep (le risque n°1 de ce projet) | Ce document fait foi ; toute addition passe par un arbitrage "qu'est-ce qu'on retire en échange ?" |

---

*Fin du PRD V1 — prochaine mise à jour après la beta fermée.*
