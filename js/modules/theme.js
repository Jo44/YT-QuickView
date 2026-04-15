///////////////////////////////////////////
// Theme.js - Module de gestion du thème //
///////////////////////////////////////////

// Imports
import { COLOR_STORAGE_PREFIX, COLORS_ENABLED_KEY, state } from './globals.js';
import { updateVideoStyles } from './colorizer.js';

/**
 * Vérifie si YouTube est en mode sombre
 * @returns {boolean} true si mode sombre, false sinon
 */
export function isDarkTheme() {
    return document.documentElement.hasAttribute('dark') ||
        document.body.hasAttribute('dark') ||
        document.documentElement.classList.contains('dark-mode');
}

/**
 * Charge l'état d'activation des couleurs depuis local storage
 */
export function loadColorsEnabledState() {

    // Vérifier que l'API de stockage est disponible
    if (!chrome || !chrome.storage) return;
    chrome.storage.local.get([COLORS_ENABLED_KEY], (result) => {
        state.colorsEnabled = result[COLORS_ENABLED_KEY] !== false;
        
        // Attribut en cascade CSS
        document.documentElement.setAttribute('data-quick-view-colors', state.colorsEnabled);

        // Selon l'état
        if (!state.colorsEnabled) {

            // Supprimer les couleurs personnalisées appliquées
            clearAllColors();

        } else {

            // Recharger les couleurs personnalisées configurées
            loadCustomColors();

            // Mettre à jour les styles de tous les éléments déjà présents
            updateVideoStyles();
        }
    });
}

/**
 * Invalide le cache des couleurs CSS
 */
export function invalidateColorCache() {
    state.cachedDateColors = null;
    state.cachedViewsColors = null;
}

/**
 * Applique une couleur personnalisée à une variable CSS
 * @param {string} varName - Nom de la variable CSS
 * @param {string} color - Code couleur HEX ou RGB
 */
export function applyCustomColor(varName, color) {

    // Appliquer la variable CSS racine dynamiquement
    document.documentElement.style.setProperty(varName, color);

    // Invalider le cache pour forcer un recalcul colorimétrique
    invalidateColorCache();
}

/**
 * Supprime toutes les couleurs personnalisées appliquées
 */
export function clearAllColors() {

    // Récupérer la liste des variables CSS personnalisées
    const baseVars = [
        'youtube-marker',
        'date-day', 'date-week', 'date-month',
        'date-year-1-3', 'date-year-3-plus', 'date-default',
        'views-k', 'views-m', 'views-md'
    ];

    // Supprimer les variables CSS personnalisées
    baseVars.forEach(baseName => {
        document.documentElement.style.removeProperty(`--user-dark-${baseName}`);
        document.documentElement.style.removeProperty(`--user-light-${baseName}`);
    });
    
    // Invalider le cache pour forcer un recalcul colorimétrique
    invalidateColorCache();
    
    // Mettre à jour les styles de tous les éléments déjà présents
    updateVideoStyles();
}

/**
 * Charge l'intégralité du set de couleurs configurées
 */
export function loadCustomColors() {

    // Vérifier que la colorisation est activée
    if (!state.colorsEnabled) return;

    // Récupérer toutes les couleurs personnalisées stockées
    chrome.storage.local.get(null, (items) => {
        Object.keys(items).forEach(key => {

            // Traiter uniquement les clés de couleurs personnalisées
            if (key.startsWith(COLOR_STORAGE_PREFIX)) {
                const colorKey = key.replace(COLOR_STORAGE_PREFIX, ''); 
                const color = items[key];

                // Extraire le nom de base et le thème à partir de la clé
                const baseNameMatches = colorKey.match(/^(.*?)-(dark|light)$/);
                if (baseNameMatches) {
                    const baseName = baseNameMatches[1];
                    const theme = baseNameMatches[2];
                    const rootVarName = `--user-${theme}-${baseName}`;

                    // Appliquer la couleur personnalisée à la variable CSS correspondante
                    applyCustomColor(rootVarName, color);
                }
            }
        });
        
        // Invalider le cache pour forcer un recalcul colorimétrique
        invalidateColorCache();
    });
}
