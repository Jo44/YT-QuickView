(() => {
    'use strict';

    // Constantes
    const COLOR_STORAGE_PREFIX = 'quickViewColor_';
    const COLORS_ENABLED_KEY = 'quickViewColorsEnabled';

    // Constantes pour les icônes SVG
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const SVG_SIZE = '20';
    const SVG_VIEWBOX = '0 0 24 24';
    const STROKE_WIDTH = '2.0';

    /**
     * Traductions disponibles
     */
    const translations = {
        fr: {
            'title': 'YouTube - Quick View',
            'header-title': 'YouTube - Quick View',
            'usage-title': 'Utilisation',
            'usage-description-part1': 'Activez ou désactivez le mode Quick View en cliquant sur le bouton',
            'usage-description-part2': 'dans l\'entête de la page YouTube ou en utilisant le raccourci clavier.',
            'shortcut-title': 'Raccourci',
            'shortcut-description': 'Raccourci clavier pour basculer le mode Quick View : ',
            'colors-title': 'Couleurs',
            'dark-mode-title': 'Mode sombre',
            'light-mode-title': 'Mode clair',
            'date-title': 'Ancienneté',
            'date-default': 'Heure',
            'date-day': 'Jour',
            'date-week': 'Semaine',
            'date-month': 'Mois',
            'date-year-1-3': '1-3 ans',
            'date-year-3-plus': '3+ ans',
            'views-title': 'Nombre de vues',
            'views-k': 'Milliers (k)',
            'views-m': 'Millions (M)',
            'views-md': 'Milliards (Md)',
            'reset-confirm': 'Voulez-vous réinitialiser toutes les couleurs aux valeurs par défaut ?'
        },
        en: {
            'title': 'YouTube - Quick View',
            'header-title': 'YouTube - Quick View',
            'usage-title': 'Usage',
            'usage-description-part1': 'Enable or disable Quick View mode by clicking the button',
            'usage-description-part2': 'in YouTube header or using the keyboard shortcut.',
            'shortcut-title': 'Shortcut',
            'shortcut-description': 'Keyboard shortcut to toggle Quick View mode : ',
            'colors-title': 'Colors',
            'dark-mode-title': 'Dark Mode',
            'light-mode-title': 'Light Mode',
            'date-title': 'Age',
            'date-default': 'Hour',
            'date-day': 'Day',
            'date-week': 'Week',
            'date-month': 'Month',
            'date-year-1-3': '1-3 years',
            'date-year-3-plus': '3+ years',
            'views-title': 'View Count',
            'views-k': 'Thousands (K)',
            'views-m': 'Millions (M)',
            'views-md': 'Billions (B)',
            'reset-confirm': 'Do you want to reset all colors to default values?'
        }
    };

    // Couleurs par défaut
    const DEFAULT_COLORS = {
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

    // Éléments DOM
    const colorsEnabledCheckbox = document.getElementById('colors-enabled');
    const colorPickers = {
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

    // ===================== ICÔNES SVG =====================
    /**
     * Crée un élément SVG de base
     */
    function createBaseSVG() {
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('width', SVG_SIZE);
        svg.setAttribute('height', SVG_SIZE);
        svg.setAttribute('viewBox', SVG_VIEWBOX);
        return svg;
    }

    /**
     * Crée un élément path SVG
     */
    function createSVGPath(d, strokeColor) {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', STROKE_WIDTH);
        path.setAttribute('stroke-linecap', 'round');
        return path;
    }

    /**
     * Crée un élément rect SVG
     */
    function createSVGRect(x, y, width, height, strokeColor) {
        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('stroke-width', STROKE_WIDTH);
        rect.setAttribute('fill', 'none');
        return rect;
    }

    /**
     * Crée l'icône de liste (3 lignes horizontales)
     */
    function createListIcon(strokeColor) {
        const svg = createBaseSVG();
        svg.appendChild(createSVGPath('M3 6h18', strokeColor));
        svg.appendChild(createSVGPath('M3 12h18', strokeColor));
        svg.appendChild(createSVGPath('M3 18h18', strokeColor));
        return svg;
    }

    /**
     * Crée l'icône de grille (4 carrés)
     */
    function createGridIcon(strokeColor) {
        const svg = createBaseSVG();
        const positions = [
            { x: 3, y: 3 },
            { x: 14, y: 3 },
            { x: 3, y: 14 },
            { x: 14, y: 14 }
        ];
        positions.forEach(pos => {
            svg.appendChild(createSVGRect(pos.x, pos.y, 7, 7, strokeColor));
        });
        return svg;
    }

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

            gridPreview.appendChild(gridIcon);
            listPreview.appendChild(listIcon);
        }
    }

    // ===================== TRADUCTION =====================
    /**
     * Détecte la langue du navigateur
     * @returns {string} 'fr' si français, 'en' sinon
     */
    function detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        return browserLang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
    }

    /**
     * Applique les traductions selon la langue détectée
     */
    function applyTranslations() {
        const lang = detectLanguage();
        document.documentElement.lang = lang;

        // Traduire tous les éléments avec l'attribut data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
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
            // Notifier le content script du changement de couleur
            notifyContentScript('colorChange', { key, color });
        });
    }

    /**
     * Réinitialise les couleurs d'un thème spécifique aux valeurs par défaut
     * @param {string} theme - 'dark' ou 'light'
     */
    function resetColors(theme) {
        const themeSuffix = theme === 'dark' ? '-dark' : '-light';
        const lang = detectLanguage();
        const confirmText = translations[lang]['reset-confirm'];

        if (confirm(confirmText)) {
            Object.keys(colorPickers).forEach(key => {
                if (key.endsWith(themeSuffix) && DEFAULT_COLORS[key]) {
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

    // ===================== ÉVÉNEMENTS =====================
    // Changements de couleurs
    Object.keys(colorPickers).forEach(key => {
        colorPickers[key].addEventListener('change', (e) => {
            saveColor(key, e.target.value);
        });
    });

    // Boutons reset par thème
    document.querySelectorAll('.btn-reset-theme').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Empêcher l'action si le bouton est désactivé
            if (btn.disabled) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            const theme = btn.getAttribute('data-theme');
            resetColors(theme);
        });
    });

    // Checkbox pour activer/désactiver les couleurs
    if (colorsEnabledCheckbox) {
        colorsEnabledCheckbox.addEventListener('change', (e) => {
            saveColorsEnabled(e.target.checked);
        });
    }

    // Initialisation
    applyTranslations();
    loadState();
    initButtonPreviews();
})();
