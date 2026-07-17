# Chantier réservé à la phase Claude Code (à partir du ~18 août)

## SEO / GEO — Voir `seo/` et `content/`
- [ ] Copier `seo/nextjs-content/` dans la racine du projet Next.js
- [ ] Ajouter `robots.txt` et `llms.txt` dans `/public`
- [ ] Intégrer `app/sitemap.ts` pour le sitemap dynamique
- [ ] Intégrer `app/feed.xml/route.ts` pour le RSS feed
- [ ] Intégrer `components/json-ld.tsx` et `lib/metadata.ts`
- [ ] Intégrer le layout racine avec structured data
- [ ] Créer les pages programmatiques : `/outils/`, `/comparer/`, `/glossaire-va/`, `/devenir-assistante-virtuelle/`
- [ ] Rédiger le corps de l'article pilier dans `app/devenir-assistante-virtuelle/page.tsx` (contenu dans `content/article-pilier-devenir-va-2026.md`)

> Ce que Bolt fait mal ou qu'on garde volontairement pour la reprise sur le repo exporté.
> Ajouter ici tout bug abandonné après 2-3 tentatives Bolt (avec lien vers PROMPTS_LOG.md).

## Sécurité (bloquant avant toute beta)
- [ ] **Audit RLS complet** : tests d'accès croisés avec 2 comptes assistantes + 1 compte client (aucune fuite inter-tenant, aucun champ interne visible côté portail)
- [ ] Vérifier que tokens d'intégration sont chiffrés (Supabase Vault/pgsodium) et jamais exposés au front

## Intégrations
- [ ] OAuth Qonto (flow complet + refresh) + création de brouillon de facture + envoi 1 clic
- [ ] Couche d'ingestion réunions + adapter **Fireflies** (webhook, vérif signature HMAC)
- [ ] Adapter **Granola** (polling 10-15 min, cursor, backoff 429) — internaliser depuis n8n si prototypé là
- [ ] Adapter **Fathom** (webhook) — V1.1 si planning tendu
- [ ] Upload audio + transcription dans le fil de mission (décision du 14/07)
- [ ] Import Toggl (one-shot : clients, projets, historique)
- [ ] Partage éphémère d'accès (chiffrement, usage unique, purge pg_cron)

## Qualité
- [ ] Logique de facturation : arrondis, mentions légales FR, numérotation (vérifier côté Qonto)
- [ ] Tests des parcours critiques : timer → rapport → facture ; portail client → mission
- [ ] Nettoyage du code généré (composants dupliqués, états morts)

## Bugs hérités de Bolt
- (vide pour l'instant)
