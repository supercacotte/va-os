# Journal des décisions

> Trois lignes par décision : date, choix, raison. Ce fichier évite de re-débattre des choix déjà tranchés.

**10/07/2026 — Intégrations en "bring your own account" (OAuth/clé API personnelle).** Chaque assistante connecte ses propres comptes (Qonto, notetaker, calendar). Raison : coût marginal nul, conformité portée par les éditeurs, pas de revente de licences.

**10/07/2026 — Facturation déléguée à Qonto via API, pas de moteur de facture interne.** Raison : numérotation, mentions légales et conformité e-invoicing (PDP/Factur-X) portées par Qonto ; réforme réception obligatoire sept. 2026.

**10/07/2026 — Timer développé en interne, pas d'OAuth Toggl.** Raison : le timer est le cœur de la chaîne de valeur ; dépendre d'un tiers ferait du produit une surcouche. Toggl = import de migration uniquement (V1.5).

**10/07/2026 — Pas de coffre-fort de mots de passe en V1.** Partage éphémère chiffré à usage unique (type Password Pusher) + recommandation 1Password/Bitwarden pour le durable. Raison : responsabilité et crypto d'un vault disproportionnées ; pas d'OAuth "lecture de coffre" chez les éditeurs (zero-knowledge).

**10/07/2026 — Envoi d'emails depuis le Gmail de l'assistante exclu en V1.** Raison : scope Google restreint `gmail.send` → vérification CASA annuelle (délais + coûts). Alternatives : envoi par Qonto, ou domaine propre (Resend/Postmark) avec reply-to, ou mailto. Calendar readonly (scope "sensible") : OK.

**10/07/2026 — Sync réunions multi-provider : Fireflies (webhooks, prio 1) → Granola (polling, prio 2) → Fathom (webhooks, prio 3/V1.1).** Couche d'ingestion unifiée + adapters. Raison : Fireflies = API dès le plan gratuit ; Granola = option sans bot mais Business 14$/mois requis et pas de webhook ; épouser l'outil déjà utilisé par les VAs. Interdit : workspace Granola mutualisé entre assistantes (confidentialité inter-clients).

**14/07/2026 — Ingestion WhatsApp/Telegram reportée en V2.** Raison : route non-officielle WhatsApp = risque de ban du numéro pro des assistantes (inacceptable) ; route officielle Meta = onboarding disproportionné pour du self-service à 19-29 €. V1 : upload audio + transcription dans le fil de mission (extension §4.8). Réévaluation post-beta sur données d'usage réelles.

**Gelé pour mémoire (voir PRD §5) :** efficience/temps facturé en simple override manuel (pas de curseur), portail client limité à 3 capacités, pas de mode agence, pas d'ingestion email automatique en V1.
