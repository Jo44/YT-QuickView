//////////////////////////////////////////////////////////
// UI.js - Module de gestion de l'interface utilisateur //
//////////////////////////////////////////////////////////

// Imports
import { STORAGE_KEY, CLASS_NAME, BUTTON_ID, createListIcon, createGridIcon } from './globals.js';
import { safeQuerySelector, getCookie, setCookie } from './utils.js';

/**
 * Modifie le cookie PREF pour désactiver le mode liste natif de YouTube
 */
export function fixCookie() {

    // Récupérer le cookie PREF
    const prefCookie = getCookie('PREF');
    if (!prefCookie) return;

    // Modifier le cookie PREF
    // => Mode liste : f6=40000001
    // => Mode par défaut : f6=40000000
    if (prefCookie.includes('f6=40000001')) {
        const updatedCookie = prefCookie.replace(/f6=40000001/g, 'f6=40000000');
        setCookie('PREF', updatedCookie);
    }
}

/**
 * Vérifie si on est sur une page de chaine
 * @returns {boolean} true si l'URL correspond à une page de chaîne (commence par /@), false sinon
 */
export function isChannelPage() {
    return location.pathname.startsWith('/@');
}

/**
 * Lit l'état de la bascule du mode depuis le localStorage
 * @returns {boolean} true si le mode est activé, false sinon
 */
export function isEnabled() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
}

/**
 * Force l'activation ou la désactivation du mode
 * @param {boolean} enabled true pour activer, false pour désactiver
 */
export function setEnabled(enabled) {

    // Ne pas activer le mode sur les pages de chaînes
    if (enabled && isChannelPage()) {
        enabled = false;
    }
    
    // Sauvegarder l'état dans localStorage
    localStorage.setItem(STORAGE_KEY, enabled);
    
    // Ajouter ou retirer la classe CSS sur l'élément root
    document.documentElement.classList.toggle(CLASS_NAME, enabled);

    // Mettre à jour l'icône du bouton pour refléter le nouvel état
    updateButtonIcon();
}

/**
 * Alterne l'état principal stocké
 */
export function toggle() {
    setEnabled(!isEnabled());
}

/**
 * Supprime tout le contenu d'un bouton
 * @param {HTMLElement} btn Le bouton dont le contenu doit être vidé
 */
export function clearButtonContent(btn) {
    while (btn.firstChild) {
        btn.removeChild(btn.firstChild);
    }
}

/**
 * Met à jour l'icône du bouton de bascule en fonction de l'état actuel (activé ou désactivé)
 */
export function updateButtonIcon() {

    // Récupérer le bouton par son ID
    const btn = document.getElementById(BUTTON_ID);
    if (!btn) return;

    // Vider le contenu actuel du bouton
    clearButtonContent(btn);

    // Créer et ajouter l'icône appropriée selon l'état
    const icon = isEnabled() ? createListIcon('currentColor') : createGridIcon('currentColor');
    btn.appendChild(icon);
}

/**
 * Met à jour le thème du bouton de bascule en fonction du thème actuel de YouTube
 */
export function updateButtonTheme() {

    // Récupérer le bouton par son ID
    const btn = document.getElementById(BUTTON_ID);
    if (!btn) return;

    // Mettre à jour l'icône du bouton pour refléter l'état actuel
    updateButtonIcon();
}

/**
 * Crée le bouton de bascule dans le conteneur spécifié et lui attache les événements nécessaires
 * @param {HTMLElement} container Conteneur dans lequel le bouton doit être inséré (ex: header de YouTube)
 */
export function createButton(container) {

    // Vérifier si le bouton existe déjà pour éviter les doublons
    const existingBtn = document.getElementById(BUTTON_ID);
    if (existingBtn) {
        // Mettre à jour le thème de l'icône
        updateButtonTheme();
        return;
    }

    // Créer le bouton de bascule
    const btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.title = 'Toggle Quick View (Shift + L)';

    // Ajouter les classes CSS de base pour le style du bouton
    btn.addEventListener('mousedown', () => btn.classList.add('clicked'));
    btn.addEventListener('mouseup', () => btn.classList.remove('clicked'));
    btn.addEventListener('mouseleave', () => btn.classList.remove('clicked'));
    
    // Ajouter l'écouteur de clic pour basculer le mode
    btn.addEventListener('click', toggle);

    // Insérer le bouton dans le conteneur spécifié
    container.prepend(btn);

    // Mettre à jour l'icône du bouton pour refléter l'état actuel
    updateButtonIcon();
}

/**
 * Ecoute le raccourci clavier de bascule : Shift + L
 * @param {KeyboardEvent} event L'événement de pression de touche
 */
export function onKeyDown(event) {

    // Vérifier que le raccourci clavier correspond à Shift + L
    if (!event.shiftKey || event.code !== 'KeyL') return;
    
    // Vérifier que le focus n'est pas dans un champ de saisie
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable) return;
    
    // Simuler un clic sur le bouton de bascule pour activer/désactiver le mode
    const btn = document.getElementById(BUTTON_ID);
    if (btn) btn.click();
    event.preventDefault();
    event.stopPropagation();
}

/**
 * Met à jour l'état du mode en fonction de l'URL actuelle et de l'état d'activation
 */
export function updateQuickViewModeState() {

    // Vérifier si le mode est activé
    const enabled = isEnabled();

    // Ne pas activer le mode sur les pages de chaînes
    const shouldBeActive = enabled && !isChannelPage();
    
    // Ajouter ou retirer la classe CSS sur l'élément root selon l'état et la page
    document.documentElement.classList.toggle(CLASS_NAME, shouldBeActive);
}
