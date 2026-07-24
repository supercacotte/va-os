# Structure de référence d'une procédure (SOP)

> Référence de **contenu** pour la Phase 6 (procédures rattachées au client, D22).
> Source : structure de la « Phase 3 » de la skill `sop-builder` fournie par
> Caroline le 24/07. Elle cadre deux choses :
> 1. le **template pré-rempli** proposé à la VA quand elle crée une procédure
>    dans l'éditeur ;
> 2. le **format des templates Smart Lazy Club** pré-chargés dans le seed.
>
> ⚠️ Aucune génération / transformation / assistance IA n'est implémentée dans
> l'app en V1 (les Phases 1, 2 et 4 de la skill sont **hors scope**, reportées
> en V2 — même logique que D17). Seul le *gabarit de contenu* ci-dessous est repris.
>
> Note d'adaptation à l'éditeur : l'éditeur TipTap (StarterKit + lien) gère
> titres, gras, italique, listes, citations et code — **pas de tableau HTML**.
> Le bloc de métadonnées, rendu en tableau dans la skill d'origine, est donc
> transposé en **liste à puces** dans les gabarits in-app (`src/lib/sop-templates.ts`).
> Le présent document conserve la forme Markdown canonique, tableau compris.

---

## Gabarit canonique

```markdown
# [Verbe + objet — ex. « Publier un épisode de podcast »]

> **Résumé en une phrase** : [ce que fait cette procédure et pourquoi]

| | |
|---|---|
| **Responsable** | [rôle, pas prénom] |
| **Fréquence** | [quotidien / hebdo / à la demande...] |
| **Durée estimée** | [X min] |
| **Outils** | [liste] |
| **Déclencheur** | [ce qui indique qu'il faut lancer la procédure] |
| **Dernière mise à jour** | [date du jour] |

## ✅ Prérequis
- [Accès nécessaires : outils, comptes, permissions]
- [Fichiers ou informations à avoir sous la main]

## 📋 Procédure

### Étape 1 — [Titre court]
[Instruction à l'impératif. Une action.]
→ *Résultat attendu : [ce qu'on doit voir à l'écran / obtenir]*

### Étape 2 — [Titre court]
[...]

🔍 **Point de contrôle** : [ce qu'il faut vérifier avant de continuer.
Si KO → quoi faire.]

## ⚠️ Cas particuliers
- **Si [situation]** → [marche à suivre]

## 🚫 Erreurs fréquentes
- [Piège connu + comment l'éviter]

## 🏁 Checklist de fin
- [ ] [Critère vérifiable 1]
- [ ] [Critère vérifiable 2]
- [ ] [Le livrable est rangé / envoyé / notifié au bon endroit]
```

## Règles de contenu (reprises de la skill)

- **Étapes atomiques** : une action par étape, verbe à l'impératif en tête.
- Chaque étape a un **résultat attendu observable**.
- Les **points de contrôle** disent quoi vérifier et quoi faire si ça échoue.
- Supprimer « Cas particuliers » / « Erreurs fréquentes » s'il n'y a rien à y
  mettre, plutôt que de les remplir artificiellement.
- Le test ultime : quelqu'un qui n'a jamais fait la tâche doit pouvoir
  l'exécuter sans poser de question.
