/////////////////////////////////////////////
// Globals.js - Module de valeurs globales //
/////////////////////////////////////////////

// Importe les variables globales partagées
export const {
    COLOR_STORAGE_PREFIX,
    COLORS_ENABLED_KEY,
    CSS_VAR_MAP,
    createListIcon,
    createGridIcon
} = window.YTQuickViewShared || {};

// Classe CSS injectée pour le mode vue rapide
export const CLASS_NAME = 'yt-quick-view-mode';

// Clé de stockage de l'état
export const STORAGE_KEY = 'ytQuickViewEnabled';

// ID du bouton
export const BUTTON_ID = 'yt-quick-view-toggle-btn';

// Délai de throttling pour les événements fréquents
export const THROTTLE_DELAY = 300; // 300ms

// Caches des éléments DOM et des styles pour éviter les appels de modification inutiles
export const processedElements = new WeakSet();
export const styleCache = new WeakMap();

// Etat dynamique maintenu en temps réel
export const state = {
    observer: null,             // Stocke le MutationObserver du bouton header
    colorsEnabled: true,        // Etat de l'option d'affichage des couleurs
    cachedDateColors: null,     // Cache pour éviter de refaire l'extraction des CSS var (Date)
    cachedViewsColors: null,    // Cache pour éviter de refaire l'extraction des CSS var (Views)
    viewRegexPatterns: null     // Modèles Regex pré-compilés
};

// Dictionnaire des sélecteurs CSS
export const YT_SELECTORS = {

    // Page d'accueil et abonnements
    HOME_AND_SUB: [
        'span.yt-content-metadata-view-model__metadata-text',
        'span.ytContentMetadataViewModelMetadataText',
        'span.ytAttributedStringHost',
        'span[class*="metadata-text"]',
        'yt-formatted-string span'
    ],

    // Page de chaîne
    CHANNEL: [
        'ytd-grid-video-renderer #metadata-line span',
        'ytd-grid-video-renderer span.style-scope',
        'ytd-grid-video-renderer span[class*="style-scope"]'
    ],

    // Page de shorts
    SHORTS: [
        '.shortsLockupViewModelHostMetadataSubhead span',
        '.shortsLockupViewModelHostOutsideMetadataSubhead span',
        'span.yt-core-attributed-string[role="text"]'
    ],

    // Page de la communauté
    COMMUNITY_POSTS: [
        'yt-formatted-string#published-time-text a',
        'yt-formatted-string[id="published-time-text"] a',
        'ytd-backstage-post-renderer yt-formatted-string a'
    ],

    // Page de lecture
    WATCH: [
        '#view-count yt-formatted-string span',
        '[id*="view-count"] yt-formatted-string span',
        '[id*="viewCount"] yt-formatted-string span',
        '#date-text yt-formatted-string span',
        '[id*="date-text"] yt-formatted-string span',
        '[id*="dateText"] yt-formatted-string span'
    ],

    // Blocs de métadonnées
    META_BLOCKS: [
        'ytd-video-meta-block span.inline-metadata-item'
    ],

    // Commentaires
    COMMENTS: [
        'a.yt-simple-endpoint.style-scope.ytd-comment-view-model',
        'a[class*="comment-view-model"]',
        'ytd-comment-view-model a'
    ],

    // Vidéowall
    VIDEOWALL: [
        '.ytp-modern-videowall-still-view-count-and-date-info',
        '[class*="videowall-still-view-count"]',
        '[class*="ytp-modern-videowall"]'
    ]
};
