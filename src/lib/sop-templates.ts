// Gabarits de procédures (SOP) — Phase 6, D22.
// Référence de contenu : docs/reference/sop-template.md (structure de la
// « Phase 3 » de la skill sop-builder). AUCUNE IA ici : ce ne sont que des
// contenus HTML statiques proposés au moment de la création (Phases 1/2/4 de
// la skill = hors scope V1).
//
// Contrainte éditeur : TipTap StarterKit + lien (titres, gras, italique,
// listes, citation) — donc pas de <table> ni de cases à cocher. Le bloc de
// métadonnées est une liste à puces ; la checklist de fin, une liste simple.

export type SopTemplate = {
  // slug stable pour le <select> de choix de modèle
  key: string;
  // libellé du modèle dans le sélecteur
  label: string;
  // titre pré-rempli de la procédure
  title: string;
  // contenu HTML (sanitizé à l'écriture ET au rendu)
  html: string;
};

// Squelette vierge proposé par défaut à la création d'une procédure.
export const BLANK_TEMPLATE_HTML = `
<p><em>Résumé en une phrase : ce que fait cette procédure et pourquoi.</em></p>
<h2>Informations</h2>
<ul>
<li><strong>Responsable</strong> : rôle, pas prénom</li>
<li><strong>Fréquence</strong> : quotidien / hebdo / à la demande…</li>
<li><strong>Durée estimée</strong> : X min</li>
<li><strong>Outils</strong> : liste</li>
<li><strong>Déclencheur</strong> : ce qui indique qu'il faut lancer la procédure</li>
</ul>
<h2>Prérequis</h2>
<ul>
<li>Accès nécessaires : outils, comptes, permissions</li>
<li>Fichiers ou informations à avoir sous la main</li>
</ul>
<h2>Procédure</h2>
<h3>Étape 1 — Titre court</h3>
<p>Instruction à l'impératif. Une seule action.</p>
<p><em>Résultat attendu : ce qu'on doit voir à l'écran / obtenir.</em></p>
<h3>Étape 2 — Titre court</h3>
<p>…</p>
<blockquote><p>Point de contrôle : ce qu'il faut vérifier avant de continuer. Si KO → quoi faire.</p></blockquote>
<h2>Cas particuliers</h2>
<ul>
<li><strong>Si (situation)</strong> → marche à suivre</li>
</ul>
<h2>Erreurs fréquentes</h2>
<ul>
<li>Piège connu + comment l'éviter</li>
</ul>
<h2>Checklist de fin</h2>
<ul>
<li>Critère vérifiable 1</li>
<li>Critère vérifiable 2</li>
<li>Le livrable est rangé / envoyé / notifié au bon endroit</li>
</ul>
`.trim();

// Modèles Smart Lazy Club pré-remplis — proposés à la création ET utilisés
// par le seed pour créer des procédures d'exemple sur un client de test.
export const SLC_TEMPLATES: SopTemplate[] = [
  {
    key: "podcast",
    label: "SLC — Publier un épisode de podcast",
    title: "Publier un épisode de podcast",
    html: `
<p><em>Résumé en une phrase : mettre en ligne un épisode déjà monté, de l'upload à la notification de l'équipe.</em></p>
<h2>Informations</h2>
<ul>
<li><strong>Responsable</strong> : assistante virtuelle</li>
<li><strong>Fréquence</strong> : hebdomadaire (mardi)</li>
<li><strong>Durée estimée</strong> : 20 min</li>
<li><strong>Outils</strong> : Ausha, Google Drive, WhatsApp</li>
<li><strong>Déclencheur</strong> : le fichier audio monté est déposé dans le dossier « À publier »</li>
</ul>
<h2>Prérequis</h2>
<ul>
<li>Accès au compte Ausha de la cliente</li>
<li>Le fichier audio final et la description validée dans le Drive</li>
</ul>
<h2>Procédure</h2>
<h3>Étape 1 — Téléverser l'épisode sur Ausha</h3>
<p>Connecte-toi à Ausha et téléverse le fichier audio final depuis le dossier « À publier ».</p>
<p><em>Résultat attendu : l'épisode apparaît en brouillon dans le dashboard Ausha.</em></p>
<h3>Étape 2 — Ajouter la description validée</h3>
<p>Copie la description depuis le Drive (dossier « Descriptions validées ») et colle-la dans le champ description de l'épisode.</p>
<p><em>Résultat attendu : la description s'affiche sans faute de mise en forme.</em></p>
<h3>Étape 3 — Programmer la publication</h3>
<p>Fixe la date de publication au mardi suivant, 6 h 00.</p>
<blockquote><p>Point de contrôle : vérifie que le fuseau horaire d'Ausha est bien « Europe/Paris ». Si ce n'est pas le cas, corrige-le avant de programmer.</p></blockquote>
<h3>Étape 4 — Prévenir l'équipe</h3>
<p>Envoie un message sur le groupe WhatsApp de la cliente : « Épisode programmé pour mardi 6 h ✅ ».</p>
<h2>Erreurs fréquentes</h2>
<ul>
<li>Publier au lieu de programmer : toujours choisir « Programmer », jamais « Publier maintenant ».</li>
</ul>
<h2>Checklist de fin</h2>
<ul>
<li>L'épisode est en statut « Programmé » dans Ausha</li>
<li>La description est complète et sans coquille</li>
<li>L'équipe a été notifiée sur WhatsApp</li>
</ul>
`.trim(),
  },
  {
    key: "newsletter",
    label: "SLC — Programmer la newsletter hebdomadaire",
    title: "Programmer la newsletter hebdomadaire",
    html: `
<p><em>Résumé en une phrase : préparer et programmer l'envoi de la newsletter du vendredi à partir du contenu validé.</em></p>
<h2>Informations</h2>
<ul>
<li><strong>Responsable</strong> : assistante virtuelle</li>
<li><strong>Fréquence</strong> : hebdomadaire (jeudi pour un envoi vendredi)</li>
<li><strong>Durée estimée</strong> : 30 min</li>
<li><strong>Outils</strong> : Brevo, Google Docs</li>
<li><strong>Déclencheur</strong> : le contenu de la semaine est marqué « Bon à envoyer » dans le Doc</li>
</ul>
<h2>Prérequis</h2>
<ul>
<li>Accès au compte Brevo de la cliente</li>
<li>Le texte validé et l'image de couverture de la semaine</li>
</ul>
<h2>Procédure</h2>
<h3>Étape 1 — Dupliquer le modèle d'email</h3>
<p>Dans Brevo, duplique la campagne « Modèle newsletter » et renomme-la avec la date de l'envoi.</p>
<p><em>Résultat attendu : une nouvelle campagne en brouillon porte le bon nom.</em></p>
<h3>Étape 2 — Intégrer le contenu validé</h3>
<p>Colle le texte depuis le Doc et insère l'image de couverture.</p>
<blockquote><p>Point de contrôle : envoie-toi un email de test et vérifie les liens un par un. Si un lien est cassé, corrige-le avant de continuer.</p></blockquote>
<h3>Étape 3 — Choisir la liste et programmer</h3>
<p>Sélectionne la liste « Abonnés actifs » et programme l'envoi au vendredi 9 h 00.</p>
<h2>Cas particuliers</h2>
<ul>
<li><strong>Si un jour férié tombe le vendredi</strong> → décale l'envoi au jeudi 17 h, après validation de la cliente.</li>
</ul>
<h2>Checklist de fin</h2>
<ul>
<li>L'email de test a été relu et les liens fonctionnent</li>
<li>La bonne liste d'abonnés est sélectionnée</li>
<li>La campagne est en statut « Programmée »</li>
</ul>
`.trim(),
  },
  {
    key: "precompta",
    label: "SLC — Clôturer la pré-compta du mois",
    title: "Clôturer la pré-compta du mois",
    html: `
<p><em>Résumé en une phrase : rassembler et transmettre les justificatifs du mois au comptable, au propre.</em></p>
<h2>Informations</h2>
<ul>
<li><strong>Responsable</strong> : assistante virtuelle</li>
<li><strong>Fréquence</strong> : mensuelle (avant le 5 du mois suivant)</li>
<li><strong>Durée estimée</strong> : 45 min</li>
<li><strong>Outils</strong> : Qonto, Google Drive, tableur de suivi</li>
<li><strong>Déclencheur</strong> : début de mois, pour le mois écoulé</li>
</ul>
<h2>Prérequis</h2>
<ul>
<li>Accès au compte Qonto et au Drive de la cliente</li>
<li>Le tableur de suivi des dépenses à jour</li>
</ul>
<h2>Procédure</h2>
<h3>Étape 1 — Exporter les opérations du mois</h3>
<p>Dans Qonto, exporte le relevé des opérations du mois écoulé au format CSV.</p>
<p><em>Résultat attendu : un fichier CSV couvrant du 1er au dernier jour du mois.</em></p>
<h3>Étape 2 — Rapprocher chaque justificatif</h3>
<p>Pour chaque opération, vérifie qu'un justificatif (facture, reçu) est bien attaché dans Qonto.</p>
<blockquote><p>Point de contrôle : s'il manque un justificatif, note l'opération dans l'onglet « À réclamer » du tableur et relance la cliente. Ne bloque pas la clôture pour autant.</p></blockquote>
<h3>Étape 3 — Déposer le dossier pour le comptable</h3>
<p>Range le CSV et les justificatifs dans le dossier Drive « Compta / [Mois] », puis préviens le comptable par email.</p>
<h2>Erreurs fréquentes</h2>
<ul>
<li>Oublier les opérations de fin de mois : attends le 1er du mois suivant pour être sûre que tout est passé.</li>
</ul>
<h2>Checklist de fin</h2>
<ul>
<li>Toutes les opérations ont un justificatif ou sont listées « À réclamer »</li>
<li>Le dossier du mois est complet dans le Drive</li>
<li>Le comptable a été notifié</li>
</ul>
`.trim(),
  },
];

export function slcTemplateByKey(key: string): SopTemplate | undefined {
  return SLC_TEMPLATES.find((template) => template.key === key);
}
