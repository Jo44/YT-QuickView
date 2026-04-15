//////////////////////////////////////
// Content.js - Chargeur de modules //
//////////////////////////////////////
(async () => {
    'use strict';
    try {
        // Résoudre l'URL interne de l'extension pour pouvoir initialiser les modules
        const src = chrome.runtime.getURL('js/modules/main.js');
        // Activer main.js qui déclenchera ses imports et `init()`
        await import(src);
    } catch (e) {
        console.error('[Quick View] Erreur de chargement des modules:', e);
    }
})();
