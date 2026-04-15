//////////////////////////////////////////////////
// Utils.js - Module des utilitaires génériques //
//////////////////////////////////////////////////

/**
 * Sélecteur sécurisé avec fallback
 * @param {string} selector - Sélecteur CSS principal
 * @param {string|null} fallbackSelector - Sélecteur de secours
 * @param {HTMLElement|Document} root - Élément racine de recherche
 * @returns {HTMLElement|null} Élément trouvé ou null
 */
export function safeQuerySelector(selector, fallbackSelector = null, root = document) {
    try {
        const element = root.querySelector(selector);
        if (element) return element;
        if (fallbackSelector) {
            return root.querySelector(fallbackSelector);
        }
    } catch (ex) {
        console.warn(`[Quick View] Sélecteur invalide: ${selector}`, ex);
    }
    return null;
}

/**
 * Sélecteur multiple sécurisé avec fallback
 * @param {string} selector - Sélecteur CSS principal
 * @param {string|null} fallbackSelector - Sélecteur de secours
 * @param {HTMLElement|Document} root - Élément racine de recherche
 * @returns {HTMLElement[]} Tableau d'éléments trouvés ou vide
 */
export function safeQuerySelectorAll(selector, fallbackSelector = null, root = document) {
    try {
        const elements = root.querySelectorAll(selector);
        if (elements.length > 0) return Array.from(elements);
        if (fallbackSelector) {
            return Array.from(root.querySelectorAll(fallbackSelector));
        }
    } catch (ex) {
        console.warn(`[Quick View] Sélecteur invalide: ${selector}`, ex);
    }
    return [];
}

/**
 * Throttle : exécute la fonction au maximum une fois par délai
 * Utile pour limiter la fréquence d'exécution
 * @param {Function} func - Fonction à throttler
 * @param {number} delay - Délai en millisecondes
 * @returns {Function} Fonction throttlée
 */
export function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}

/**
 * Lit un cookie par son nom
 * @param {string} name - Nom du cookie
 * @returns {string|null} Valeur du cookie ou null si non trouvé
 */
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
}

/**
 * Ecrit un cookie
 * @param {string} name - Nom du cookie
 * @param {string} value - Valeur du cookie
 * @param {number} days - Nombre de jours avant expiration
 */
export function setCookie(name, value, days = 365) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=.youtube.com`;
}

/**
 * Exécute une fonction quand le navigateur est inactif
 * @param {Function} func La fonction à planifier
 */
export function scheduleIdle(func) {
    let scheduled = false;
    let currentArgs = null;
    return function (...args) {
        currentArgs = args;
        if (!scheduled) {
            scheduled = true;
            const callback = () => {
                scheduled = false;
                func.apply(this, currentArgs);
            };
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(callback);
            } else {
                window.requestAnimationFrame(callback);
            }
        }
    };
}
