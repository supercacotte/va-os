# VA Desk — Direction artistique (référence : maquette 5a & 7a)

Cockpit joyeux et éditorial pour assistantes virtuelles. Principe directeur : **la grille est sérieuse, les accessoires sont ludiques**. La structure (cartes, listes, alignements) est droite et sobre ; la personnalité vient des badges-stickers penchés, des ombres offset et de la typo display.

---

## 1. Palette

| Token | Hex | Rôle |
|---|---|---|
| `ink` | `#202221` | **Tout le texte**, icônes, nav actif (fond pill), bouton Pause |
| `paper` | `#FBFBF9` | Fond de page, cartes sur fond écru, pastilles sur aplat coloré |
| `sand` | `#EBEAE5` | Fond secondaire : lignes de missions, champs de formulaire, badges neutres |
| `lilac` | `#C5C4FF` | **Couleur client** (client 1) + panneau chrono quand ce client est tracké |
| `pink` | `#FFB6E3` | **Couleur client** (client 2) + sticker logo VA DESK |
| `lime` | `#E3F85A` | **Succès / fait** : badges « tout est fait ✓ », badge compteur du titre, « ● rec » |
| `orange` | `#FCA049` | **Action / à faire** : bouton Démarrer, badges « n à faire », avatar, soulignés de liens |
| `olive` | `#CBC064` | Réserve (graphiques, catégories). Ne pas utiliser en fond de texte long |

### Logique couleur (importante)
- **La couleur code le client** : chaque client reçoit une couleur (lilac, pink, puis olive…) reprise sur sa carte, la pastille `›` de ses missions, et le panneau chrono quand un chrono tourne pour lui.
- **Orange = il y a une action à faire. Lime = c'est fait.** Ne jamais inverser, ne jamais utiliser ces deux couleurs pour autre chose.
- Une seule signification par couleur et par écran. Le nav actif est en `ink`, jamais dans une couleur client.

### Palette clients étendue (20 couleurs)

Les couleurs client sont des **pastels de même famille** que le lilas et le rose de la marque : en oklch, luminosité et chroma constants, seule la teinte varie. Formule : `oklch(0.86 0.09 H)` — le texte `ink` reste lisible sur toutes.

Attribution dans l'ordre (client 1 → 20), puis on recycle :

| # | Couleur | Hex approx. | # | Couleur | Hex approx. |
|---|---|---|---|---|---|
| 1 | `oklch(0.83 0.09 282)` (lilas marque) | `#C5C4FF` | 11 | `oklch(0.86 0.09 108)` | `#CBDD9F` |
| 2 | `oklch(0.85 0.11 340)` (rose marque) | `#FFB6E3` | 12 | `oklch(0.86 0.09 126)` | `#B8E2AB` |
| 3 | `oklch(0.86 0.09 216)` | `#ACDDF8` | 13 | `oklch(0.86 0.09 144)` | `#A9E5BC` |
| 4 | `oklch(0.86 0.09 54)` | `#F8C79E` | 14 | `oklch(0.86 0.09 162)` | `#9FE6CE` |
| 5 | `oklch(0.86 0.09 90)` | `#DDD69A` | 15 | `oklch(0.86 0.09 198)` | `#A0E2EC` |
| 6 | `oklch(0.86 0.09 0)` | `#FFB9C6` | 16 | `oklch(0.86 0.09 234)` | `#BCD6FF` |
| 7 | `oklch(0.86 0.09 306)` | `#F0BCF0` | 17 | `oklch(0.86 0.09 252)` | `#CBCEFF` |
| 8 | `oklch(0.86 0.09 180)` | `#9CE5DE` | 18 | `oklch(0.86 0.09 288)` | `#E4C1FB` |
| 9 | `oklch(0.86 0.09 72)` | `#EBCF97` | 19 | `oklch(0.86 0.09 324)` | `#F9B8E2` |
| 10 | `oklch(0.86 0.09 36)` | `#FFC0A8` | 20 | `oklch(0.86 0.09 18)` | `#FFBAB8` |

Règles :
- L'ordre 1-10 alterne les familles de teintes pour que deux clients consécutifs soient toujours très différenciables.
- La couleur est **attribuée à la création du client et n'en change jamais** (stockée avec le client, pas recalculée par index de liste).
- Pas de confusion avec la sémantique : les statuts `orange #FCA049` et `lime #E3F85A` sont plus saturés que les pastels clients, et n'apparaissent que sur des badges pill — jamais en fond de carte.
- Préférer les valeurs `oklch()` en CSS (supportées partout) ; les hex sont des approximations de secours.

## 2. Typographie

Deux polices, gratuites (Google Fonts) :

- **Bowlby One** — display. Uniquement : H1 (« Bonjour Julia ! »), chiffre du timer, logo. Jamais en corps, jamais en dessous de 26 px, max 2 occurrences visibles par écran (hors logo).
- **Instrument Sans** — tout le reste (UI, corps, labels, boutons).

| Usage | Police | Taille | Graisse | Casse |
|---|---|---|---|---|
| H1 page | Bowlby One | 44 px | 400 | Phrase |
| Timer chrono | Bowlby One | 38 px | 400 | — |
| Titre de carte / nom client | Instrument Sans | 19 px | 700 | Phrase |
| Titre de ligne (mission) | Instrument Sans | 17 px | 600 | Phrase |
| Corps / métadonnées | Instrument Sans | 13 px | 400–600 | Phrase, opacité 0.7 pour le secondaire |
| Label de section | Instrument Sans | 13 px | 700 | MAJUSCULES + letter-spacing 1.5px |
| Badge / sticker | Instrument Sans | 12 px | 700 | minuscules (« 2 à faire ») |
| Nav / boutons | Instrument Sans | 14 px | 600–700 | Phrase |

Les MAJUSCULES sont réservées aux labels de section (CLIENTS, CHRONO…) et à MON ESPACE. Nulle part ailleurs.

## 3. Formes

### Rayons de coin
| Élément | Radius |
|---|---|
| Cartes (client, chrono) | 16–18 px |
| Lignes de liste (missions) | 14 px |
| Champs / selects | 10 px |
| Boutons | 12 px |
| Badges, pills, pastilles `›`, avatar rond, nav | 999px (pill) |
| Sticker logo, badge du titre | 8–12 px |

### Bordures
- Par défaut : **aucune bordure**. Les surfaces se distinguent par la couleur de fond.
- `2px solid ink` : **uniquement l'élément sélectionné/actif** (ex : carte du client actif).
- `2px dashed rgba(32,34,33,0.33)` : zones d'ajout (« + Nouveau client ») et états vides (chrono au repos).
- Séparateurs internes : `1px solid rgba(32,34,33,0.15)`.

### Ombres
Deux ombres seulement :
- **Offset « sticker »** : `0 3px 0` à `0 5px 0` `rgba(32,34,33,0.07–0.20)` — cartes posées, boutons d'action, badges stickers. Pas de flou.
- **Élévation d'écran** : `0 16px 40px rgba(32,34,33,0.12)` — conteneur de page uniquement.

Jamais d'ombre floutée sur les composants internes.

### Rotations (le « twist »)
- Autorisées **uniquement** sur les stickers décoratifs : logo VA DESK (−2°), badge compteur du titre (−3°), badge d'état du chrono (« ● rec », « à l'arrêt », +2°).
- **Interdites** sur les conteneurs, les lignes de liste, les tags de statut des missions, les champs. Max 3 éléments penchés par écran.

## 4. Espacements

Base 4 px.
- Padding cartes : 20–26 px
- Padding lignes de liste : 16 px 20 px
- Padding champs : 12–13 px 16–18 px
- Gap entre cartes d'une colonne : 12–14 px
- Gap entre colonnes : 28 px
- Marge page : 32 px
- Sous le H1 : 32 px ; sous un label de section : 12–14 px
- Grille du dashboard : `300px | 1fr | 340px`

## 5. Règles à ne pas enfreindre

1. **Le texte est toujours `ink` (#202221)** — sur fond clair comme sur aplat coloré. Exception unique : texte `paper` sur fond `ink` (nav actif, bouton Pause).
2. **Jamais de couleur vive en couleur de texte** (pas de texte orange, lilas, rose ou lime). Les couleurs vives sont des fonds de surfaces et de badges.
3. Orange = à faire, lime = fait — sémantique fixe.
4. Une couleur = un sens par écran. Si le lilas est la couleur de Marie, rien d'autre n'est lilas.
5. Bowlby One : H1 + timer + logo seulement.
6. Rotations réservées aux stickers décoratifs (max 3/écran), jamais aux conteneurs.
7. Le contour noir 2px signale la sélection, pas la décoration.
8. Ombres offset sans flou sur les composants ; l'ombre floue n'existe qu'au niveau page.
9. Contraste : tout texte < 15 px sur aplat coloré passe en graisse ≥ 600.
10. Pas d'emoji dans l'UI ; les symboles (▶ ⏸ ■ › ▾ ✓ ●) suffisent.

## 6. Dashboard client (portail) — pattern spécifique

Ces règles s'appliquent **uniquement au dashboard client** (référence : maquette 7a), pas à l'espace VA ni à l'admin.

- **Modèle mental en deux colonnes** (`1fr | 380px`) : gauche = ce que la VA fait pour le client (missions avec barre de progression et checklist) ; droite = ce que le client demande (panneau « Nouvelle demande ») + rapports.
- **Panneau « Nouvelle demande » = panneau vedette**, traité comme le chrono de l'espace VA : aplat couleur client (lilas pour Marie), titre display Bowlby One (32 px), badge sticker penché, chips de catégorie en pills `paper`, gros bouton orange avec ombre offset.
- **Le suivi des demandes vit DANS le panneau vedette** (ligne « ⏳ chez Julia » sous le bouton), jamais en liste séparée à côté des missions — la distinction missions/demandes doit rester évidente.
- Barres de progression des missions : piste `paper`, remplissage **couleur du client**.
- Rapports : carte du mois en cours avec contour noir 2px (élément mis en avant), mois passés en lignes `sand` avec lien « Télécharger » souligné orange.
- Mission terminée : carte repliée (titre + barre pleine + badge lime), sans checklist dépliée.

## 7. Chargement des polices

```html
<link href="https://fonts.googleapis.com/css2?family=Bowlby+One&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet">
```

Fallbacks : `'Bowlby One', 'Arial Black', sans-serif` / `'Instrument Sans', Helvetica, Arial, sans-serif`.
(Note : la marque référence « Aileron » — Instrument Sans en est l'équivalent Google Fonts ; Aileron elle-même est gratuite si vous préférez l'auto-héberger.)
