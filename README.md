# YouTube – Quick View

Extension Chrome pour améliorer l'affichage de YouTube avec un mode Quick View et des couleurs pour les statistiques.

## Fonctionnalités

- **Mode Quick View**           : Bascule rapide entre vue classique et vue grille (plus de colonnes)
- **Couleurs des statistiques** : Colorisation automatique des dates et du nombre de vues avec personnalisation par thème
- **Raccourci clavier**         : Bascule le mode avec `Shift + L`
- **Support multilingue**       : Français et Anglais (détection automatique)
- **Adaptation au thème**       : Couleurs adaptées au mode clair/sombre de YouTube avec configuration séparée
- **Configuration avancée**     : Personnalisez les couleurs pour chaque type de statistique et chaque thème

## Installation

### Depuis le Chrome WebStore

[Lien 🌐](https://chromewebstore.google.com/detail/youtube-quick-view/pfgnimcdoenieikioadlnbicnjldmhoa) 

### Depuis les fichiers sources

1. Clonez ou téléchargez ce dépôt
2. Ouvrez Chrome et allez dans `chrome://extensions/`
3. Activez le "Mode développeur" (en haut à droite)
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier contenant les fichiers de l'extension

## Utilisation

1. Allez sur YouTube
2. Cliquez sur le bouton de bascule dans le header (icône liste/grille)
3. Ou utilisez le raccourci `Shift + L`

Le mode Quick View affiche les vidéos dans une grille avec plus de colonnes, et les statistiques (dates, vues) sont automatiquement colorisées selon leur valeur :
- **Dates** : Couleurs différentes selon l'ancienneté (heure, jour, semaine, mois, année)
- **Vues**  : Couleurs différentes selon l'échelle (base, milliers, millions, milliards)

Les couleurs sont personnalisables via la popup de configuration de l'extension.

## Structure des fichiers

```
Quick View/
├── _locales/            # Traductions (FR/EN)
├── css/                 # Fichiers CSS
│   ├── config.css       # Styles de la fenêtre de configuration
│   └── content.css      # Styles pour YouTube
├── html/                # Fichiers HTML
│   └── config.html      # Interface de configuration
├── icons/               # Icônes de l'extension
├── js/                  # Fichiers JavaScript
│   ├── modules/         # Modules JavaScript
│   │   ├── colorizer.js # Module de colorisation
│   │   ├── global.js    # Module global
│   │   ├── main.js      # Module principal
│   │   ├── observer.js  # Module d'observation des changements DOM
│   │   ├── theme.js     # Module de gestion du thème
│   │   ├── ui.js        # Module d'interface utilisateur
│   │   └── utils.js     # Module d'utilitaires
│   ├── config.js        # Fenêtre de configuration
│   ├── content.js       # Chargeur de modules
│   └── shared.js        # Constantes et fonctions partagées
├── manifest.json        # Configuration de l'extension (Manifest V3)
└── README.md            # Documentation
```

## Notes

- L'extension fonctionne uniquement sur `https://www.youtube.com/*`
- Les préférences sont sauvegardées dans `localStorage` (état du mode) et `chrome.storage.local` (couleurs et activation)
- La popup de configuration permet de personnaliser les couleurs pour chaque thème (clair/sombre)
- La colorisation peut être activée/désactivée via un toggle dans la popup de configuration

## Updates
- **v1.0** : 
  - Initial release
- **v1.1** : 
  - Fixed CSS selectors for colorization (YouTube update)
  - Modularized code into separate files for better maintainability
  - Better optimization and performance
