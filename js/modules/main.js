////////////////////////////////
// Main.js - Module principal //
////////////////////////////////

// Imports
import { state, BUTTON_ID } from './globals.js';
import { fixCookie, onKeyDown, updateQuickViewModeState, createButton, updateButtonTheme } from './ui.js';
import { loadColorsEnabledState, clearAllColors, loadCustomColors } from './theme.js';
import { isDarkTheme } from './theme.js';
import { updateVideoStyles } from './colorizer.js';
import { initObservers, observeMastheadOnce } from './observer.js';

/**
 * Initialise le script
 */
function init() {

    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }

    // Appliquer la classe CSS selon l'état sauvegardé
    updateQuickViewModeState();
    
    // Charger l'état d'activation de la colorisation
    loadColorsEnabledState();
    
    // Corriger le cookie YouTube si présent
    fixCookie();

    // Insérer le bouton de bascule dans le header
    const container = document.querySelector('ytd-masthead #end');
    if (container) createButton(container);
    else observeMastheadOnce();

    // Ajouter le raccourci clavier
    document.addEventListener('keydown', onKeyDown, true);

    // Initialiser les observers pour détecter les changements de contenu et appliquer les styles
    initObservers();

    // Déclencher le premier traitement par force (tout le document)
    updateVideoStyles([document]);
    
    // Déclencher le sync du thème visuel du bouton
    updateButtonTheme();
}

/**
 * Interface d'écoute qui reçoit les requêtes de la popup de configuration
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // Gèrer les différentes actions possibles envoyées par la popup
    if (message.action === 'colorsEnabled') {
        const { enabled } = message.data;
        state.colorsEnabled = enabled;
        document.documentElement.setAttribute('data-quick-view-colors', state.colorsEnabled);

        // Si les couleurs sont activées
        if (enabled) {

            // Charger les couleurs personnalisées
            loadCustomColors();

            // Appliquer les styles à tous les éléments déjà présents
            updateVideoStyles([document]);

        } else {

            // Supprimer toutes les variables CSS personnalisées
            clearAllColors();
        }

        // Répondre à la popup pour confirmer la mise à jour de l'état
        sendResponse({ success: true });

    } else if (message.action === 'colorChange') {

        // Gérer la mise à jour d'une couleur personnalisée
        const { key, color } = message.data;
        const baseNameMatches = key.match(/^(.*?)-(dark|light)$/);

        // Extraire le nom de base et le thème à partir de la clé
        if (baseNameMatches) {
            const baseName = baseNameMatches[1];
            const theme = baseNameMatches[2];
            const rootVarName = `--user-${theme}-${baseName}`;
            
            // Applique la variable CSS racine dynamiquement sur la page en cours
            document.documentElement.style.setProperty(rootVarName, color);
            
            // Invalide le cache pour forcer un reclacul colorimétrique
            state.cachedDateColors = null;
            state.cachedViewsColors = null;

            // Appliquer les styles mis à jour à tous les éléments déjà présents
            updateVideoStyles([document]);

            // Répondre à la popup pour confirmer la mise à jour de la couleur
            sendResponse({ success: true });

        } else {

            // Répondre à la popup avec une erreur si la clé ne correspond pas
            sendResponse({ success: false });

        }
    } else if (message.action === 'getTheme') {

        // Répondre à la popup avec le thème actuel (dark ou light)
        sendResponse({ isDark: isDarkTheme() });

    }
    return true;
});

// Lancement immédiat
init();
