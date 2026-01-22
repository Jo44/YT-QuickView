# YouTube – Quick View

Extension Chrome pour améliorer l'affichage de YouTube avec un mode Quick View et des couleurs pour les statistiques.

## Fonctionnalités

- **Mode Quick View** : Bascule rapide entre vue classique et vue grille avec plus de colonnes
- **Couleurs des statistiques** : Colorisation automatique des dates et du nombre de vues avec personnalisation par thème
- **Raccourci clavier** : `Shift + L` pour basculer le mode
- **Support multilingue** : Français et Anglais (détection automatique)
- **Adaptation au thème** : Couleurs adaptées au mode clair/sombre de YouTube avec configuration séparée
- **Configuration avancée** : Personnalisez les couleurs pour chaque type de statistique et chaque thème

## Installation

### Depuis les fichiers sources

1. Clonez ou téléchargez ce dépôt
2. Ouvrez Chrome et allez dans `chrome://extensions/`
3. Activez le "Mode développeur" (en haut à droite)
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier contenant les fichiers de l'extension

## Utilisation

1. Allez sur YouTube (page d'accueil ou abonnements)
2. Cliquez sur le bouton de bascule dans le header (icône liste/grille)
3. Ou utilisez le raccourci `Shift + L`

Le mode Quick View affiche les vidéos dans une grille avec plus de colonnes, et les statistiques (dates, vues) sont automatiquement colorisées selon leur valeur :
- **Dates** : Couleurs différentes selon l'ancienneté (heure, jour, semaine, mois, année)
- **Vues** : Couleurs différentes selon l'échelle (base, milliers, millions, milliards)

Les couleurs sont personnalisables via la popup de configuration de l'extension.

## Structure des fichiers

```
Quick View/
├── _locales/         # Traductions (FR/EN)
├── css/              # Fichiers CSS
│   ├── config.css    # Styles de la popup de configuration
│   └── content.css   # Styles pour YouTube (layout et couleurs)
├── html/             # Fichiers HTML
│   └── config.html   # Interface de configuration
├── icons/            # Icônes de l'extension
├── js/               # Fichiers JavaScript
│   ├── config.js     # Logique de la popup de configuration
│   └── content.js    # Script principal injecté dans YouTube
├── manifest.json     # Configuration de l'extension (Manifest V3)
└── README.md         # Documentation
```

## Notes

- L'extension fonctionne uniquement sur `https://www.youtube.com/*`
- Le mode Quick View est automatiquement désactivé sur les pages de chaîne (commençant par `/@`)
- Les préférences sont sauvegardées dans `localStorage` (état du mode) et `chrome.storage.local` (couleurs et activation)
- La popup de configuration permet de personnaliser les couleurs pour chaque thème (clair/sombre)
- La colorisation peut être activée/désactivée via un toggle dans la popup de configuration