/////////////////////////////////////////////////////////////////////
// Observer.js - Module d'observation du DOM et des événements SPA //
/////////////////////////////////////////////////////////////////////

// Imports
import { state, THROTTLE_DELAY } from './globals.js';
import { safeQuerySelector, scheduleIdle, throttle } from './utils.js';
import { createButton, updateQuickViewModeState, updateButtonTheme } from './ui.js';
import { updateVideoStyles } from './colorizer.js';
import { invalidateColorCache } from './theme.js';

/**
 * Insère le bouton de bascule lorsque le header est présent dans le DOM
 */
export function observeMastheadOnce() {

    // Nettoyer l'observer précédent s'il existe
    if (state.observer) state.observer.disconnect();

    // Ajouter un observer qui attend que le header soit présent dans le DOM
    state.observer = new MutationObserver(() => {

        // Vérifier le container
        const container = safeQuerySelector('ytd-masthead #end', 'ytd-masthead [id="end"], #masthead #end');
        if (container && document.contains(container)) {

            // Insérer le bouton de bascule
            createButton(container);

            // Arrêter d'observer une fois ajouté
            state.observer.disconnect();
        }
    });

    // Lancer l'observer sur le document pour attraper le header dès qu'il est ajouté
    state.observer.observe(document.documentElement, { childList: true, subtree: true });
}

/**
 * Initialise les observers pour détecter les changements de contenu et appliquer les styles
 */
export function initObservers() {
    // 1. Navigation Observer
    window.addEventListener('yt-navigate-finish', () => {

        // Vérifier si le bouton est toujours là et le réinsérer si besoin   
        updateQuickViewModeState();
        observeMastheadOnce();
        
        // Mettre à jour les styles des vidéos
        updateVideoStyles(); 
    });

    // Fallback : Mutation observer sur l'URL pour s'assurer que la navbar n'a pas zappé notre bouton
    let lastPath = location.pathname;
    const throttledUrlChange = throttle(() => {
        const currentPath = location.pathname;
        if (currentPath !== lastPath) {
            lastPath = currentPath;

            // Vérifier si le bouton est toujours là et le réinsérer si besoin
            updateQuickViewModeState();
            observeMastheadOnce();

            // Mettre à jour les styles des vidéos
            updateVideoStyles();
        }
    }, THROTTLE_DELAY);
    new MutationObserver(throttledUrlChange).observe(document, { subtree: true, childList: true });

    // 2. Style Observer
    let pendingNodes = new Set();
    const scheduleStyles = scheduleIdle(() => {
        if (pendingNodes.size > 0) {

            // Traiter uniquement les noeuds concernés
            const nodesArray = Array.from(pendingNodes);
            pendingNodes.clear();

            // Mettre à jour les styles dans ces noeuds
            updateVideoStyles(nodesArray);

        } else {

            // Mettre à jour les styles de tout le document
            updateVideoStyles([document]);
        }
    });

    // Observer les modifications DOM : Ajout de noeuds
    const styleObserver = new MutationObserver((mutations) => {
        let hasRelevantChanges = false;

        // Parcourir les mutations pour détecter les ajouts de noeuds
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {

                // Filtrer les mutations qui ajoutent un noeud
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const tag = node.tagName.toUpperCase();
                        
                        // Vérifier si le noeud ajouté est pertinent pour l'application des styles
                        if (
                            tag.includes('YT') ||
                            tag === 'SPAN' ||
                            tag === 'A' ||
                            (node.querySelector && node.querySelector('yt-formatted-string, span[class*="metadata"], span[class*="style-scope"]'))
                        ) {
                            // Ajouter le noeud à la liste des noeuds à traiter
                            pendingNodes.add(node);
                            hasRelevantChanges = true;
                        }
                    }
                }
            }
        }
        
        // Si des noeuds pertinents ont été ajoutés, planifier la mise à jour des styles
        if (hasRelevantChanges) {
            scheduleStyles();
        }
    });

    // Lancer l'observer de modification du DOM
    const rootObserverElement = document.querySelector('ytd-app') || document.body;
    styleObserver.observe(rootObserverElement, { childList: true, subtree: true });

    // 3. Theme Observer
    const throttledUpdateButtonTheme = throttle(() => {

        // Invalider les caches de couleurs pour forcer la réévaluation des styles
        invalidateColorCache();

        // Mettre à jour le thème du bouton de bascule
        updateButtonTheme();

    }, THROTTLE_DELAY);
    
    // Lancer l'observer de changement de thème
    const themeObserver = new MutationObserver(throttledUpdateButtonTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['dark', 'class'] });
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['dark', 'class'] });
}
