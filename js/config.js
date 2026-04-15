//////////////////////////////////////////
// Config.js - Fenêtre de configuration //
//////////////////////////////////////////
(() => {
    'use strict';

    // Constantes
    const { 
        COLOR_STORAGE_PREFIX, 
        COLORS_ENABLED_KEY, 
        createListIcon, 
        createGridIcon 
    } = window.YTQuickViewShared;

    
    // Couleurs par défaut
    const DEFAULT_COLORS = {
        // Global
        'youtube-marker-dark': '#F04949',
        'youtube-marker-light': '#963232',
        // Ancienneté
        'date-default-dark': '#64E354',
        'date-day-dark': '#54E38F',
        'date-week-dark': '#54D7E3',
        'date-month-dark': '#5484E3',
        'date-year-1-3-dark': '#8F6BEB',
        'date-year-3-plus-dark': '#CC54E3',
        'date-default-light': '#137333',
        'date-day-light': '#0F9D58',
        'date-week-light': '#0D7377',
        'date-month-light': '#1A73E8',
        'date-year-1-3-light': '#6C1ED9',
        'date-year-3-plus-light': '#8E24AA',
        // Nombre de vues
        'views-k-dark': '#FFE8C9',
        'views-m-dark': '#FFCC8A',
        'views-md-dark': '#FFB85C',
        'views-k-light': '#C48938',
        'views-m-light': '#FA9717',
        'views-md-light': '#FBA434'
    };

    // Eléments DOM
    const colorsEnabledCheckbox = document.getElementById('colors-enabled');
    const colorPickers = {
        // Global
        'youtube-marker-dark': document.getElementById('youtube-marker-dark'),
        'youtube-marker-light': document.getElementById('youtube-marker-light'),
        // Ancienneté
        'date-default-dark': document.getElementById('date-default-dark'),
        'date-day-dark': document.getElementById('date-day-dark'),
        'date-week-dark': document.getElementById('date-week-dark'),
        'date-month-dark': document.getElementById('date-month-dark'),
        'date-year-1-3-dark': document.getElementById('date-year-1-3-dark'),
        'date-year-3-plus-dark': document.getElementById('date-year-3-plus-dark'),
        'date-default-light': document.getElementById('date-default-light'),
        'date-day-light': document.getElementById('date-day-light'),
        'date-week-light': document.getElementById('date-week-light'),
        'date-month-light': document.getElementById('date-month-light'),
        'date-year-1-3-light': document.getElementById('date-year-1-3-light'),
        'date-year-3-plus-light': document.getElementById('date-year-3-plus-light'),
        // Nombre de vues
        'views-k-dark': document.getElementById('views-k-dark'),
        'views-m-dark': document.getElementById('views-m-dark'),
        'views-md-dark': document.getElementById('views-md-dark'),
        'views-k-light': document.getElementById('views-k-light'),
        'views-m-light': document.getElementById('views-m-light'),
        'views-md-light': document.getElementById('views-md-light')
    };

    // ===================== PREVISUALISATION BOUTONS =====================
    /**
     * Initialise les boutons de prévisualisation
     */
    function initButtonPreviews() {
        const gridPreview = document.getElementById('button-preview-grid');
        const listPreview = document.getElementById('button-preview-list');

        if (gridPreview && listPreview) {
            // Déterminer la couleur selon le thème
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const strokeColor = isDark ? '#f1f1f1' : '#3A3A3A';

            // Créer et insérer les icônes
            const gridIcon = createGridIcon(strokeColor);
            const listIcon = createListIcon(strokeColor);

            // Appliquer les styles communs aux SVG
            [gridIcon, listIcon].forEach(svg => {
                Object.assign(svg.style, { display: 'block', margin: 'auto' });
            });

            // Insérer les icônes dans les conteneurs
            gridPreview.appendChild(gridIcon);
            listPreview.appendChild(listIcon);
        }
    }

    // ===================== TRADUCTION =====================
    /**
     * Applique les traductions selon la langue par défaut du navigateur
     */
    function applyTranslations() {
        document.documentElement.lang = chrome.i18n.getUILanguage() || 'en';
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = chrome.i18n.getMessage(key);
            if (translation) {
                element.textContent = translation;
            }
        });
    }

    // ===================== ÉTAT =====================
    /**
     * Charge l'état actuel de l'extension
     */
    function loadState() {
        // Charger l'état d'activation des couleurs
        loadColorsEnabled();
        // Charger les couleurs personnalisées
        loadColors();
    }

    /**
     * Charge l'état d'activation des couleurs depuis le storage
     */
    function loadColorsEnabled() {
        chrome.storage.local.get([COLORS_ENABLED_KEY], (result) => {
            const enabled = result[COLORS_ENABLED_KEY] !== false;
            if (colorsEnabledCheckbox) {
                colorsEnabledCheckbox.checked = enabled;
                updateColorPickersState(enabled);
            }
        });
    }

    /**
     * Sauvegarde l'état d'activation des couleurs
     */
    function saveColorsEnabled(enabled) {
        chrome.storage.local.set({ [COLORS_ENABLED_KEY]: enabled }, () => {
            // Mettre à jour l'état des color pickers et des boutons de reset
            updateColorPickersState(enabled);
            // Notifier le content script
            notifyContentScript('colorsEnabled', { enabled });
        });
    }

    /**
     * Met à jour l'état des color pickers et des boutons de reset (activés/désactivés)
     */
    function updateColorPickersState(enabled) {
        // Désactiver/activer les color pickers
        Object.values(colorPickers).forEach(picker => {
            if (picker) {
                picker.disabled = !enabled;
            }
        });

        // Désactiver/activer les boutons de reset
        document.querySelectorAll('.btn-reset-theme').forEach(btn => {
            btn.disabled = !enabled;
        });
    }

    /**
     * Charge les couleurs depuis le storage
     */
    function loadColors() {
        const storageKeys = Object.keys(colorPickers).map(key => COLOR_STORAGE_PREFIX + key);
        chrome.storage.local.get(storageKeys, (result) => {
            Object.keys(colorPickers).forEach(key => {
                const storageKey = COLOR_STORAGE_PREFIX + key;
                if (result[storageKey]) {
                    // Utiliser la couleur personnalisée
                    colorPickers[key].value = result[storageKey];
                } else {
                    // Utiliser la couleur par défaut
                    if (DEFAULT_COLORS[key]) {
                        colorPickers[key].value = DEFAULT_COLORS[key];
                    }
                }
            });
        });
    }

    /**
     * Sauvegarde une couleur personnalisée
     */
    function saveColor(key, color) {
        const storageKey = COLOR_STORAGE_PREFIX + key;
        chrome.storage.local.set({ [storageKey]: color }, () => {
            // Notifier le content script
            notifyContentScript('colorChange', { key, color });
        });
    }

    /**
     * Réinitialise les couleurs d'un thème spécifique aux valeurs par défaut
     * @param {string} theme - 'dark' ou 'light'
     */
    function resetColors(theme) {
        const themeSuffix = theme === 'dark' ? '-dark' : '-light';
        const confirmText = chrome.i18n.getMessage('reset_confirm');
        if (confirm(confirmText)) {
            Object.keys(colorPickers).forEach(key => {
                if (key.endsWith(themeSuffix) && DEFAULT_COLORS[key]) {
                    // Réinitialiser la couleur à la valeur par défaut
                    const defaultColor = DEFAULT_COLORS[key];
                    colorPickers[key].value = defaultColor;
                    saveColor(key, defaultColor);
                }
            });
        }
    }

    // ===================== COMMUNICATION =====================
    /**
     * Envoie un message au content script
     */
    function notifyContentScript(action, data) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: action,
                    data: data
                }).catch(() => { });
            }
        });
    }

    // ===================== EVENEMENTS =====================
    // Changements de couleurs
    Object.keys(colorPickers).forEach(key => {
        colorPickers[key].addEventListener('change', (event) => {
            saveColor(key, event.target.value);
        });
    });

    // Boutons reset par thème
    document.querySelectorAll('.btn-reset-theme').forEach(btn => {
        btn.addEventListener('click', (event) => {
            // Empêcher l'action si le bouton est désactivé
            if (btn.disabled) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            const theme = btn.getAttribute('data-theme');
            resetColors(theme);
        });
    });

    // Checkbox pour activer/désactiver les couleurs
    if (colorsEnabledCheckbox) {
        colorsEnabledCheckbox.addEventListener('change', (event) => {
            saveColorsEnabled(event.target.checked);
        });
    }

    // Initialisation
    applyTranslations();
    loadState();
    initButtonPreviews();
})();
