# PRD — VA Desk (v1.1)

> v1.1 — 23 juillet 2026. Révision de la v1.0 (16 juillet) : pivot de stack
> Bolt/Supabase → Next.js/Prisma/NextAuth, aligné sur le repo de référence
> `supercacotte/smart-lazy-club`. Le scope produit V1 est inchangé.

## 1. Vision

Les assistantes virtuelles indépendantes jonglent entre Toggl, Notion, un
tableur de facturation et leurs mails. Le VA OS ferme la chaîne dans un seul
outil : le temps tracké devient un rapport d'activité, qui devient une facture.

**Trois différenciateurs (inchangés) :**
1. **Chaîne fermée** du chrono à la facture générée via Qonto.
2. **Bibliothèque de procédures (SOP)** avec templates brandés Smart Lazy Club.
3. **Extraction automatique de tâches** depuis les transcripts de réunion
   (Fireflies, Granola, Fathom) — incluse dans le plan PWYW en V1 (D21),
   réservée au palier supérieur en V2.

## 2. Personas

- **Léa, VA indépendante française** (persona principal) — 3 à 8 clients,
  facture au forfait ou au temps, veut prouver sa valeur sans y passer son
  dimanche. C'est elle qui paie l'abonnement.
- **Le client de Léa** — fondateur ou dirigeant de PME. Ne paie rien, ne
  configure rien. Portail volontairement minimal : consulter l'avancement,
  déposer une demande, voir le rapport d'activité. **Trois capacités, pas une
  de plus** (lock-in par l'habitude, sans surface de support).

## 3. Offres

**V1 : pricing PWYW — pay what you want (D21, 24/07).** Un seul plan, toutes
les fonctionnalités, prix mensuel libre choisi par la VA à l'abonnement
(plancher technique et montant suggéré à fixer en Phase 7). Remplace le
modèle 2 plans 19/29 € (historique : v1.1 du 23/07, D10).

| Fonctionnalité | V1 (PWYW) |
|---|---|
| Clients / missions / tâches | ✅ |
| Chrono + édition a posteriori | ✅ |
| Rapport d'activité + export PDF | ✅ |
| Facturation via Qonto | ✅ |
| Bibliothèque SOP + templates SLC | ✅ |
| Portail client | ✅ |
| Sync réunions (Fireflies / Granola / Fathom) | ✅ |

Abonnement Stripe (mode `subscription`, montant libre), essai à définir,
annulation self-service. La segmentation par paliers revient en V2 (cf. §5 :
sync réunions + canal chat au palier supérieur).

## 4. Scope V1 (gelé)

1. Dashboard VA : clients, missions, tâches (CRUD complet).
2. Chrono nommable, rattaché à une tâche/mission, éditable a posteriori.
3. Rapport d'activité par client et par période + export PDF.
4. Génération de facture semi-automatique via **API Qonto** (bouton, pas d'envoi auto).
5. Bibliothèque de procédures avec template guidé.
6. Portail client : 3 capacités (avancement / demande / rapport).
7. Sync réunions (incluse, D21) : ingestion unifiée, adapters dans l'ordre —
   Fireflies (webhooks) → Granola (polling via n8n sur le VPS) → Fathom (V1.1).
8. Abonnements Stripe PWYW (un plan, montant libre — D21) + gestion du statut d'abonnement.
9. **Tâches récurrentes** (ajout 24/07, D16) : à la création d'une tâche,
   option « chaque semaine / chaque mois » — modèle `RecurringTask` +
   génération paresseuse de l'occurrence de la période courante au
   chargement (pas de cron). Occurrences = tâches normales (chrono,
   rapports, portail inchangés).
10. **Annuaire public de VA** (ajout 24/07, D17) : page `/annuaire`
    accessible sans connexion depuis la home — les VA se référencent via un
    profil **opt-in** (jamais publiées par défaut), les visiteurs cherchent
    par nom/spécialité et contactent directement (email/site).

## 5. Hors scope V1 (gelé — ne pas rouvrir sans décision datée)

- **V2** : ingestion email automatique, tags auto + suggestion de procédure,
  curseur d'efficience, archives avec recherche, facturation programmée,
  **canal d'entrée de tâches par chat** : bot Telegram dédié (**API
  officielle** — la contrainte de D4 tient toujours, pas d'API non
  officielle) permettant aux clients d'envoyer des demandes qui deviennent
  des tâches `source client_request`, liaison client via lien d'invitation ;
  WhatsApp envisageable ensuite **via API officielle uniquement** (l'onboarding
  Meta reste disproportionné en self-service, cf. D4). Dans l'offre V2 à
  paliers, ce canal est **complémentaire de la sync réunions** : réservé au
  palier supérieur, les deux couvrent l'entrée automatique de tâches (à
  l'oral via les réunions, à l'écrit via le chat). Envoi Gmail (revue CASA
  Google).
- **V3 ou jamais** : coffre-fort de mots de passe persistant (jamais en
  vibe-coding — partage éphémère sécurisé seulement), mode équipe/agence,
  calendrier prédictif IA.

## 6. Modèle de données (draft Prisma — conventions du repo de référence)

Multi-tenancy : **la VA est le tenant**. Toute donnée métier porte un `vaId`.
Le client final se connecte via un compte lié à un `Client` (pas un tenant).

```prisma
enum Role { VA CLIENT ADMIN }
enum Plan { ESSENTIELLE PRO } // draft v1.1 — passera à un plan unique PWYW en Phase 7 (D21)
enum SubscriptionStatus { TRIALING ACTIVE PAST_DUE CANCELED }

model User {
  id               String   @id @default(cuid())
  email            String   @unique
  name             String?
  lastName         String?
  password         String?
  role             Role     @default(VA)
  stripeCustomerId String?  @unique
  // si role = CLIENT : rattachement au Client de la VA
  clientId         String?  @unique
  client           Client?  @relation(fields: [clientId], references: [id])
  subscription     Subscription?
  clients          Client[]      @relation("VaClients")
  createdAt        DateTime @default(now())
}

model Subscription {
  id                   String             @id @default(cuid())
  vaId                 String             @unique
  va                   User               @relation(fields: [vaId], references: [id], onDelete: Cascade)
  plan                 Plan
  status               SubscriptionStatus
  stripeSubscriptionId String             @unique
  currentPeriodEnd     DateTime
}

model Client {
  id        String    @id @default(cuid())
  vaId      String
  va        User      @relation("VaClients", fields: [vaId], references: [id], onDelete: Cascade)
  name      String
  company   String?
  portalUser User?
  missions  Mission[]
  createdAt DateTime  @default(now())
}

model Mission {
  id        String   @id @default(cuid())
  clientId  String
  client    Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  name      String
  status    String   @default("active")
  tasks     Task[]
  createdAt DateTime @default(now())
}

model Task {
  id          String      @id @default(cuid())
  missionId   String
  mission     Mission     @relation(fields: [missionId], references: [id], onDelete: Cascade)
  title       String
  done        Boolean     @default(false)
  source      String      @default("manual") // manual | meeting_sync | client_request
  timeEntries TimeEntry[]
  createdAt   DateTime    @default(now())
}

model TimeEntry {
  id        String    @id @default(cuid())
  taskId    String
  task      Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)
  label     String?
  startedAt DateTime
  endedAt   DateTime?
  // durée éditable a posteriori
}

model Procedure {
  id        String   @id @default(cuid())
  vaId      String
  title     String
  steps     String   // HTML sanitizé (pattern TipTap + sanitize-html du repo)
  isSlcTemplate Boolean @default(false)
  createdAt DateTime @default(now())
}

// D16 — modèle de tâche récurrente ; les occurrences sont des Task normales
// (Task.recurringTaskId + recurringPeriod, unique par période).
model RecurringTask {
  id        String   @id @default(cuid())
  missionId String
  mission   Mission  @relation(fields: [missionId], references: [id], onDelete: Cascade)
  title     String
  cadence   String   // weekly | monthly
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}

// D17 — profil annuaire public, opt-in strict (published=false par défaut).
model VaProfile {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  displayName  String
  headline     String?
  bio          String
  specialties  String[]
  location     String?
  contactEmail String?
  website      String?
  published    Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model MeetingItem {
  id         String   @id @default(cuid())
  vaId       String
  provider   String   // fireflies | granola | fathom
  externalId String
  transcript String
  processed  Boolean  @default(false)
  createdAt  DateTime @default(now())
  @@unique([provider, externalId])
}

model Invoice {
  id             String   @id @default(cuid())
  vaId           String
  clientId       String
  periodStart    DateTime
  periodEnd      DateTime
  qontoInvoiceId String?  @unique
  amountCents    Int
  createdAt      DateTime @default(now())
}
```

À affiner en phase 1 du build plan ; ce draft fixe les conventions (cuid,
enums, `onDelete: Cascade`, `@@unique` composés) reprises du repo de référence.

## 7. Design system

Identité **VA Desk** (D14, tranchée le 23/07). Tagline : « Tout votre
business, au même endroit. »

Palette : lavande `#C5C4FF`, rose `#FFB6E3`, citron `#E3F85A`, orange
`#FCA049`, fond `#EBEAE5`, ink `#202221`, blanc `#FBFBF9`, olive `#CBC064`.
Principe : l'app reste lisible — le texte est toujours ink sur fonds clairs,
les couleurs ne servent qu'en **accents et surfaces**, jamais pour du texte
courant.

Fontes : **BOWL** (display) et **Aileron** (body), chargées en
`next/font/local` dès que les fichiers de police seront dans le repo —
fallbacks système en attendant. Structure de tokens reprise du repo de
référence (`globals.css`, `@theme inline`).

Ton : **joyeux, éditorial** — ni girlboss cliché, ni SaaS froid. On écrit
comme une collègue compétente et de bonne humeur, pas comme un dashboard.

## 8. Intégrations

| Intégration | Modèle | Quand |
|---|---|---|
| Stripe (abonnements) | Compte plateforme | Phase 6 |
| Qonto (facturation) | **OAuth "bring your own account"** | Phase 7 |
| Fireflies | OAuth + webhooks | Phase 9 |
| Granola | Polling n8n (VPS Coolify) puis internalisation | Phase 9 |
| Fathom | Webhooks | V1.1 |

Principe inchangé : la facturation est **entièrement déléguée à Qonto**
(pas de moteur de facturation interne, pas de charge Factur-X).

## 9. Risques

| Risque | Mitigation |
|---|---|
| Scope creep (risque n°1) | PRD gelé ; idées → §5 ; mentor dit non |
| Autorisation multi-tenant sans RLS | Garde-fous ARCHITECTURE.md §Autorisation + audit dédié phase 10 |
| API Qonto : délais d'accès partenaire | Demander l'accès dès la phase 1, en parallèle du build |
| Dépendance à une seule personne sur la stack | Docs + SESSIONS_LOG tenus ; Caroline monte sur Claude Code |
| Beta trop tardive | Julia + beta-testeuses SLC dès la fin de phase 5 |
