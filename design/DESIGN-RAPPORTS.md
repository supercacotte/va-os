# VA Desk — DA Page « Rapports » (référence : maquettes 15a + 16c)

Complète `DESIGN.md` (palette, typo, formes, espacements identiques). Ce fichier couvre la page Rapports de l'espace VA **et** le document PDF généré.

## 1. Page Rapports (15a)

Grille `1fr | 380px`, gap 28 px (gabarit standard espace VA). Gauche = état des rapports par client, droite = action.

### En-tête de page
- H1 Bowlby One 40 px « Rapports » + badge sticker citron penché (−3°) avec l'état du mois (« juillet prêt à générer »).
- Sous-titre 15 px. Nav : « Rapports » en pill ink.

### Cartes par client (colonne gauche)
Une carte `sand` radius 16 px par client :
- Ligne d'identité : avatar rond couleur client (38 px), nom 17 px 700, méta 13 px (entreprise · temps · tâches du mois).
- **Toggle « Visible sur son portail »** aligné à droite : contrôle si le client voit et télécharge ses rapports.
  - ON : piste citron `#E3F85A`, bordure 2 px ink, curseur ink 18 px à droite, label 12 px 700.
  - OFF : piste `paper`, bordure et curseur `ink` à 33 % d'opacité, curseur à gauche, label à 60 % d'opacité.
- Lignes de rapports (une par mois) : carte `paper` radius 12 px — mois 14 px 700, méta 12 px, à droite le statut + « Télécharger ↓ » souligné orange.
  - Statuts (pills 11 px 700) : `citron` « sur le portail ✓ » / `orange` « à générer ». Sémantique fixe orange = action requise, citron = fait.

### Panneau vedette « Nouveau rapport » (colonne droite)
Gabarit panneau vedette (comme chrono/demande) : aplat lilas, radius 18 px, ombre offset `0 5px 0`.
- Titre 19 px 700 + badge sticker penché (+2°) « 2 min chrono ».
- Titre display Bowlby One 30 px (« Juillet, prêt à partir. »).
- 2 selects `paper` (client, mois), récap 3 lignes (temps / tâches / missions) en 13 px.
- Bouton orange « ▶ Générer le rapport » (jamais d'emoji), microcopy « PDF + version portail, en un clic ».

### Pied de page
La page se termine par le footer app standard (voir `DESIGN.md` §5 bis). Ne pas le confondre avec le pied de page du document PDF (§2), qui a ses propres règles.

### Carte « Rappel » (sous le panneau)
Carte `paper` contour ink 2 px + ombre offset (= prioritaire) : signale les incohérences actionnables (rapport non généré, toggle désactivé). Une seule carte, 2 alertes max.

## 2. Document généré (16c — « Ink + orange »)

Page A4 (794 px de référence), fond `paper`, padding 56/64 px. Monochrome ink + UN seul accent : orange `#FCA049`.

- **En-tête** : kicker 11 px MAJUSCULES espacées, nom du client Bowlby One 30 px, méta 14 px (entreprise · préparé par), filet noir 3 px sous l'en-tête. Logo VA DESK en sticker orange penché (−2°) en haut à droite — seule rotation du document.
- **Stats** : rangée de 3 cellules dans un cadre ink 1 px radius 12 px, séparées par des filets ink (pas d'aplats). Chiffres Bowlby One 22 px.
- **Missions** : titre 16 px 700 + sous-total 14 px 700 **souligné orange 3 px**, filet ink 2 px sous la ligne de titre.
- **Entrées** : grille `90px | 1fr | 90px` (date / tâche / durée), 13 px, filets 1 px à 7 % d'opacité, date à 70 % d'opacité, durée 600 alignée à droite.
- **Total** : bandeau orange radius 12 px — libellé 14 px 700, montant Bowlby One 20 px, texte ink.
- **Pied de page** : filet 1 px, « Généré avec VA Desk — vadesk.fr » 11 px + pagination « 1 / 1 ».

### Règles du document
1. Texte ink partout ; l'orange n'apparaît qu'en soulignés, bandeau total et sticker logo.
2. Pas de couleur client dans le PDF — le destinataire EST le client, le code couleur interne n'a pas de sens pour lui.
3. Bowlby One : nom du client, chiffres de stats, montant total, logo — rien d'autre.
4. Corps jamais sous 13 px (≈ 10 pt), méta 11 px minimum.
5. Durées : « 2 h 00 », « 45 min », « < 1 min ».
6. Multi-pages : l'en-tête client ne se répète pas, le pied de page si (« 2 / 3 ») ; une mission ne se coupe pas entre son titre et sa première entrée.

## 3. Lien entre les deux
Le toggle portail (15a) gouverne : rapport visible + téléchargeable dans la section Rapports du portail client (voir `DESIGN.md` §6). « Générer » produit les deux versions (PDF 16c + version portail) en une action.
