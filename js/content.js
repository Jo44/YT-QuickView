(() => {
    'use strict';

    // ===================== DEFINITIONS =====================

    // Global
    const CLASS_NAME = 'yt-quick-view-mode';           // Classe CSS pour activer le mode Quick View
    const STORAGE_KEY = 'ytQuickViewEnabled';          // Clé storage pour l'état du mode
    const BUTTON_ID = 'yt-quick-view-toggle-btn';      // ID du bouton de bascule
    let observer = null;                               // Observer pour le container du bouton
    let colorsEnabled = true;                          // État d'activation des couleurs

    // Icônes SVG
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const SVG_SIZE = '20';
    const SVG_VIEWBOX = '0 0 24 24';
    const STROKE_WIDTH = '2.0';

    // Colorisation
    const COLOR_STORAGE_PREFIX = 'quickViewColor_';      // Préfixe de storage
    const COLORS_ENABLED_KEY = 'quickViewColorsEnabled'; // Etat d'activation de la colorisation

    // Mots-clés pour détecter les dates
    const DATE_KEYWORDS_FR = ['il y a', 'jour', 'semaine', 'mois', 'an'];
    const DATE_KEYWORDS_EN = ['ago', 'day', 'week', 'month', 'year'];

    // Mots-clés pour détecter les vues
    const VIEWS_KEYWORDS_FR = ['vues', 'k vues', 'm de vues', 'md de vues'];
    const VIEWS_KEYWORDS_EN = ['views', 'k views', 'm views', 'b views'];

    // Optimisation
    const DEBOUNCE_DELAY = 150;                       // Délai de débouncing
    const THROTTLE_DELAY = 300;                        // Délai de throttling

    // Cache
    const processedElements = new WeakSet();           // Éléments déjà traités
    const styleCache = new WeakMap();                  // Cache des styles appliqués
    let cachedDateColors = null;                       // Cache des couleurs de dates
    let cachedViewsColors = null;                      // Cache des couleurs de vues

    // ===================== DÉTECTION LANGUE =====================
    /**
     * Détecte la langue de YouTube à partir de l'attribut lang de <html>
     * @returns {string|null} 'en', 'fr' ou null si langue non supporté
     */
    function detectLanguage() {
        const htmlLang = document.documentElement.lang || document.documentElement.getAttribute('lang');
        if (htmlLang === 'en' || htmlLang === 'en-US') return 'en';
        if (htmlLang === 'fr' || htmlLang === 'fr-FR') return 'fr';
        return null;
    }

    /**
     * Retourne les mots-clés de dates selon la langue détectée
     * @returns {string[]|null} Tableau de mots-clés ou null
     */
    function getDateKeywords() {
        const lang = detectLanguage();
        if (lang === 'en') return DATE_KEYWORDS_EN;
        if (lang === 'fr') return DATE_KEYWORDS_FR;
        return null;
    }

    /**
     * Retourne les mots-clés de vues selon la langue détectée
     * @returns {string[]|null} Tableau de mots-clés ou null
     */
    function getViewsKeywords() {
        const lang = detectLanguage();
        if (lang === 'en') return VIEWS_KEYWORDS_EN;
        if (lang === 'fr') return VIEWS_KEYWORDS_FR;
        return null;
    }

    // ===================== PARTIE 1 : MISE EN PAGE =====================

    // --- État du mode Quick View ---
    /**
     * Vérifie si on est sur une page de chaîne (commençant par /@)
     * @returns {boolean} true si on est sur une page de chaîne
     */
    function isChannelPage() {
        const path = location.pathname;
        return path.startsWith('/@');
    }

    /**
     * Vérifie si le mode Quick View est activé
     * @returns {boolean} true si activé, false sinon
     */
    function isEnabled() {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    }

    /**
     * Active ou désactive le mode Quick View
     * @param {boolean} enabled - État à définir
     */
    function setEnabled(enabled) {
        // Ne pas activer le mode sur les pages de chaîne
        if (enabled && isChannelPage()) {
            enabled = false;
        }

        localStorage.setItem(STORAGE_KEY, enabled);
        document.documentElement.classList.toggle(CLASS_NAME, enabled);
        updateButtonIcon();
    }

    /**
     * Bascule l'état du mode Quick View
     */
    function toggle() {
        setEnabled(!isEnabled());
    }

    // --- Icônes SVG ---
    /**
     * Crée un élément SVG de base avec les propriétés communes
     * @returns {SVGElement} Élément SVG configuré
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
     * @param {string} d - Commande de chemin SVG
     * @param {string} strokeColor - Couleur du trait
     * @returns {SVGPathElement} Élément path configuré
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
     * @param {number} x - Position X
     * @param {number} y - Position Y
     * @param {number} width - Largeur
     * @param {number} height - Hauteur
     * @param {string} strokeColor - Couleur du trait
     * @returns {SVGRectElement} Élément rect configuré
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
     * @param {string} strokeColor - Couleur du trait
     * @returns {SVGElement} Icône SVG de liste
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
     * @param {string} strokeColor - Couleur du trait
     * @returns {SVGElement} Icône SVG de grille
     */
    function createGridIcon(strokeColor) {
        const svg = createBaseSVG();
        const positions = [
            { x: 3, y: 3 },   // Haut gauche
            { x: 14, y: 3 },  // Haut droite
            { x: 3, y: 14 },  // Bas gauche
            { x: 14, y: 14 }  // Bas droite
        ];
        positions.forEach(pos => {
            svg.appendChild(createSVGRect(pos.x, pos.y, 7, 7, strokeColor));
        });
        return svg;
    }

    // --- Bouton toggle ---
    /**
     * Vide le contenu du bouton (pour remplacer l'icône)
     * @param {HTMLElement} btn - Bouton à vider
     */
    function clearButtonContent(btn) {
        while (btn.firstChild) {
            btn.removeChild(btn.firstChild);
        }
    }

    /**
     * Met à jour l'icône du bouton selon l'état (liste ou grille)
     */
    function updateButtonIcon() {
        const btn = document.getElementById(BUTTON_ID);
        if (!btn) return;

        clearButtonContent(btn);
        const icon = isEnabled() ? createListIcon('currentColor') : createGridIcon('currentColor');
        btn.appendChild(icon);
    }

    /**
     * Met à jour l'icône du bouton selon le thème actuel
     */
    function updateButtonTheme() {
        const btn = document.getElementById(BUTTON_ID);
        if (!btn) return;
        updateButtonIcon();
    }

    /**
     * Crée le bouton de bascule dans le header YouTube
     * @param {HTMLElement} container - Container où insérer le bouton (ytd-masthead #end)
     */
    function createButton(container) {
        const existingBtn = document.getElementById(BUTTON_ID);

        // Si le bouton existe déjà, mettre à jour son thème
        if (existingBtn) {
            updateButtonTheme();
            return;
        }

        const btn = document.createElement('button');
        btn.id = BUTTON_ID;
        btn.title = 'Toggle Quick View (Shift + L)';

        // Gestion de l'effet de clic
        btn.addEventListener('mousedown', () => {
            btn.classList.add('clicked');
        });

        btn.addEventListener('mouseup', () => {
            btn.classList.remove('clicked');
        });

        btn.addEventListener('mouseleave', () => {
            btn.classList.remove('clicked');
        });

        // Action principale : basculer le mode
        btn.addEventListener('click', toggle);

        container.prepend(btn);
        updateButtonIcon();
    }

    /**
     * Observe le DOM pour détecter l'apparition du container du bouton
     * Se déconnecte automatiquement une fois le bouton créé
     */
    function observeMastheadOnce() {
        if (observer) observer.disconnect();
        observer = new MutationObserver(() => {
            const container = safeQuerySelector('ytd-masthead #end', 'ytd-masthead [id="end"], #masthead #end');
            if (container && document.contains(container)) {
                createButton(container);
                observer.disconnect();
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    // --- Raccourci clavier ---
    /**
     * Gère le raccourci clavier Shift + L pour basculer le mode
     * @param {KeyboardEvent} e - Événement clavier
     */
    function onKeyDown(e) {
        // Vérifier que c'est bien Shift + L
        if (!e.shiftKey || e.code !== 'KeyL') return;

        // Ne pas activer si l'utilisateur est en train de taper dans un champ
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable) return;

        // Simuler un clic sur le bouton
        const btn = document.getElementById(BUTTON_ID);
        if (btn) btn.click();

        e.preventDefault();
        e.stopPropagation();
    }

    // ===================== PARTIE 2 : COLORISATION =====================

    // --- Détection du thème ---
    /**
     * Vérifie si YouTube est en mode sombre
     * @returns {boolean} true si mode sombre, false sinon
     */
    function isDarkTheme() {
        return document.documentElement.hasAttribute('dark') ||
            document.body.hasAttribute('dark') ||
            document.documentElement.classList.contains('dark-mode');
    }

    // --- État d'activation des couleurs ---
    /**
     * Charge l'état d'activation des couleurs depuis le storage
     */
    function loadColorsEnabledState() {
        chrome.storage.local.get([COLORS_ENABLED_KEY], (result) => {
            colorsEnabled = result[COLORS_ENABLED_KEY] !== false;
            // Si désactivé, supprimer les couleurs appliquées
            if (!colorsEnabled) {
                clearAllColors();
            } else {
                // Si réactivé, recharger les couleurs
                loadCustomColors();
                updateVideoStyles();
            }
        });
    }

    // --- Gestion des couleurs (cache, variables CSS) ---
    /**
     * Invalide le cache des couleurs CSS (appelé lors des changements de thème)
     */
    function invalidateColorCache() {
        cachedDateColors = null;
        cachedViewsColors = null;
    }

    /**
     * Applique une couleur personnalisée à une variable CSS
     * @param {string} varName - Nom de la variable CSS (ex: '--quick-view-date-day')
     * @param {string} color - Couleur à appliquer
     */
    function applyCustomColor(varName, color) {
        document.documentElement.style.setProperty(varName, color);
        invalidateColorCache();
    }

    /**
     * Supprime toutes les couleurs appliquées (remet les couleurs par défaut)
     */
    function clearAllColors() {
        const cssVars = [
            '--quick-view-date-day', '--quick-view-date-week', '--quick-view-date-month',
            '--quick-view-date-year-1-3', '--quick-view-date-year-3-plus', '--quick-view-date-default',
            '--quick-view-views-k', '--quick-view-views-m', '--quick-view-views-md'
        ];
        cssVars.forEach(varName => {
            document.documentElement.style.removeProperty(varName);
        });
        invalidateColorCache();
        // Recoloriser avec les couleurs par défaut
        updateVideoStyles();
    }

    /**
     * Charge les couleurs personnalisées depuis le storage et les applique
     */
    function loadCustomColors() {
        if (!colorsEnabled) return;

        chrome.storage.local.get(null, (items) => {
            Object.keys(items).forEach(key => {
                if (key.startsWith(COLOR_STORAGE_PREFIX)) {
                    const colorKey = key.replace(COLOR_STORAGE_PREFIX, '');
                    const color = items[key];

                    // Mapper les clés du popup aux variables CSS
                    const baseKey = colorKey.replace(/-dark$|-light$/, '');
                    const isDark = colorKey.endsWith('-dark');
                    const isLight = colorKey.endsWith('-light');

                    const cssVarMap = {
                        'date-day': '--quick-view-date-day',
                        'date-week': '--quick-view-date-week',
                        'date-month': '--quick-view-date-month',
                        'date-year-1-3': '--quick-view-date-year-1-3',
                        'date-year-3-plus': '--quick-view-date-year-3-plus',
                        'date-default': '--quick-view-date-default',
                        'views-k': '--quick-view-views-k',
                        'views-m': '--quick-view-views-m',
                        'views-md': '--quick-view-views-md'
                    };

                    if (cssVarMap[baseKey]) {
                        // Appliquer la couleur uniquement si elle correspond au thème actuel
                        const currentIsDark = isDarkTheme();

                        if ((isDark && currentIsDark) || (isLight && !currentIsDark) || (!isDark && !isLight)) {
                            applyCustomColor(cssVarMap[baseKey], color);
                        }
                    }
                }
            });
            invalidateColorCache();
        });
    }

    // --- Détection et colorisation des dates ---
    /**
     * Lit les couleurs de dates depuis les variables CSS selon le thème actuel
     * @returns {Object} Objet avec DAY, WEEK, MONTH, YEAR_1_3, YEAR_3_PLUS, DEFAULT
     */
    function getDateColors() {
        if (cachedDateColors) return cachedDateColors;

        const computedStyle = getComputedStyle(document.documentElement);
        cachedDateColors = {
            DAY: computedStyle.getPropertyValue('--quick-view-date-day').trim() || '#54E38F',
            WEEK: computedStyle.getPropertyValue('--quick-view-date-week').trim() || '#54D7E3',
            MONTH: computedStyle.getPropertyValue('--quick-view-date-month').trim() || '#5484E3',
            YEAR_1_3: computedStyle.getPropertyValue('--quick-view-date-year-1-3').trim() || '#8F6BEB',
            YEAR_3_PLUS: computedStyle.getPropertyValue('--quick-view-date-year-3-plus').trim() || '#CC54E3',
            DEFAULT: computedStyle.getPropertyValue('--quick-view-date-default').trim() || '#64E354'
        };
        return cachedDateColors;
    }

    /**
     * Détermine la couleur à appliquer selon la date de la vidéo
     * @param {string} text - Texte contenant la date
     * @returns {Object|null} Objet avec color et fontWeight, ou null si non applicable
     */
    function colorizeDate(text) {
        const dateKeywords = getDateKeywords();
        if (!dateKeywords) return null;

        const lower = text.toLowerCase();
        const firstKeyword = dateKeywords[0].toLowerCase(); // "il y a" ou "ago"

        // Vérifier qu'il y a un indicateur temporel (ex: "il y a", "ago")
        if (!lower.includes(firstKeyword)) return null;

        // Pattern pour détecter une date YouTube typique : "il y a [nombre] [unité]" ou "[nombre] [unité] ago"
        // Format YouTube : court, avec un nombre suivi d'une unité temporelle
        // Exemples valides : "il y a 2 jours", "il y a 1 an", "2 days ago", "1 year ago"
        // Exemples invalides : "Il y a dix ans Max Laulom est parti..." (phrase narrative longue)

        const lang = detectLanguage();
        let datePattern;

        if (lang === 'fr') {
            // Pattern français : "il y a [nombre] [unité]" ou "[nombre] [unité]"
            // Le texte doit être relativement court (max 50 caractères) pour éviter les phrases narratives
            if (text.length > 50) return null;

            // Vérifier que "il y a" est suivi d'un nombre et d'une unité temporelle
            // Pattern : "il y a" + nombre + unité (jour/semaine/mois/an/heure/minute)
            datePattern = /il\s+y\s+a\s+(\d+)\s+(jour|semaine|mois|an|heure|minute|second)/i;
            if (!datePattern.test(lower)) {
                // Fallback : vérifier si c'est juste une unité temporelle après "il y a"
                // mais seulement si le texte est très court (format YouTube typique)
                if (text.length > 30) return null;
            }
        } else {
            // Pattern anglais : "[nombre] [unité] ago" ou similaire
            if (text.length > 50) return null;

            datePattern = /(\d+)\s+(day|week|month|year|hour|minute|second)\s+ago/i;
            if (!datePattern.test(lower)) {
                if (text.length > 30) return null;
            }
        }

        const dateColors = getDateColors();

        // Vérifier dans l'ordre : jour, semaine, mois, an
        if (lower.includes(dateKeywords[1].toLowerCase())) {
            return { color: dateColors.DAY, fontWeight: 'normal' };
        }
        if (lower.includes(dateKeywords[2].toLowerCase())) {
            return { color: dateColors.WEEK, fontWeight: 'normal' };
        }
        if (lower.includes(dateKeywords[3].toLowerCase())) {
            return { color: dateColors.MONTH, fontWeight: 'normal' };
        }
        if (lower.includes(dateKeywords[4].toLowerCase())) {
            // Extraire le nombre d'années pour différencier 1-3 ans et 3+ ans
            const match = lower.match(/(\d+)/);
            if (match) {
                const years = parseInt(match[1]);
                return {
                    color: years > 3 ? dateColors.YEAR_3_PLUS : dateColors.YEAR_1_3,
                    fontWeight: 'normal'
                };
            }
            return { color: dateColors.YEAR_1_3, fontWeight: 'normal' };
        }

        return { color: dateColors.DEFAULT, fontWeight: 'normal' };
    }

    // --- Détection et colorisation des vues ---
    /**
     * Lit les couleurs de vues depuis les variables CSS selon le thème actuel
     * @returns {Object} Objet avec K, M, MD pour les différentes échelles
     */
    function getViewsColors() {
        if (cachedViewsColors) return cachedViewsColors;

        const computedStyle = getComputedStyle(document.documentElement);
        cachedViewsColors = {
            K: computedStyle.getPropertyValue('--quick-view-views-k').trim() || '#C48938',
            M: computedStyle.getPropertyValue('--quick-view-views-m').trim() || '#FA9717',
            MD: computedStyle.getPropertyValue('--quick-view-views-md').trim() || '#FBA434'
        };
        return cachedViewsColors;
    }

    /**
     * Détermine la couleur à appliquer selon le nombre de vues
     * @param {string} text - Texte contenant le nombre de vues
     * @returns {Object|null} Objet avec color et fontWeight, ou null si non applicable
     */
    function colorizeViews(text) {
        const viewsKeywords = getViewsKeywords();
        if (!viewsKeywords) return null;

        const lower = text.toLowerCase();

        // Vérifier qu'il y a le mot-clé de base (ex: "vues", "views")
        if (!lower.includes(viewsKeywords[0].toLowerCase())) return null;

        const cleanText = lower.replace(/\s+/g, ' ').trim();
        const viewsColors = getViewsColors();

        // Vérifier dans l'ordre : milliards (MD), millions (M), milliers (K)
        if (cleanText.includes(viewsKeywords[3].toLowerCase())) {
            return { color: viewsColors.MD, fontWeight: 'bold' };
        }
        if (cleanText.includes(viewsKeywords[2].toLowerCase())) {
            return { color: viewsColors.M, fontWeight: 'normal' };
        }
        if (cleanText.includes(viewsKeywords[1].toLowerCase())) {
            return { color: viewsColors.K, fontWeight: 'normal' };
        }

        return null;
    }

    // --- Application des styles ---
    /**
     * Détermine le style à appliquer selon le texte (date ou vues)
     * @param {string} text - Texte à analyser
     * @returns {Object} Objet avec color et fontWeight
     */
    function colorizeText(text) {
        // Priorité à la date si les deux sont présents
        const dateStyle = colorizeDate(text);
        if (dateStyle) return dateStyle;

        const viewsStyle = colorizeViews(text);
        if (viewsStyle) return viewsStyle;

        return { color: '', fontWeight: 'normal' };
    }

    /**
     * Applique un style (couleur et poids de police) à un élément
     * Utilise un cache pour éviter les mises à jour inutiles
     * @param {HTMLElement} element - Élément à styliser
     * @param {Object} style - Objet avec color et fontWeight
     */
    function applyStyle(element, style) {
        if (!element || !style || !style.color) return;
        if (!document.contains(element)) return;
        if (!colorsEnabled) return;

        // Vérifier le cache pour éviter les mises à jour redondantes
        const cachedStyle = styleCache.get(element);
        if (cachedStyle && cachedStyle.color === style.color && cachedStyle.fontWeight === style.fontWeight) {
            return;
        }

        element.style.color = style.color;
        element.style.fontWeight = style.fontWeight;

        // Mettre en cache le style appliqué
        styleCache.set(element, { color: style.color, fontWeight: style.fontWeight });
    }

    // --- Mise à jour des styles sur différentes pages ---
    /**
     * Vérifie si un texte contient un mot-clé de date
     * @param {string} text - Texte à vérifier
     * @returns {boolean} true si un mot-clé de date est trouvé
     */
    function hasDateKeyword(text) {
        if (!text) return false;
        const keywords = getDateKeywords();
        if (!keywords || !Array.isArray(keywords)) return false;
        return keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
    }

    /**
     * Vérifie si un texte contient un mot-clé de vues
     * @param {string} text - Texte à vérifier
     * @returns {boolean} true si un mot-clé de vues est trouvé
     */
    function hasViewsKeyword(text) {
        if (!text) return false;
        const keywords = getViewsKeywords();
        if (!keywords || !Array.isArray(keywords)) return false;
        const lower = text.toLowerCase();
        return keywords.some(keyword => lower.includes(keyword.toLowerCase()));
    }

    /**
     * Fonction générique pour coloriser des éléments selon des sélecteurs
     * @param {string|string[]} selectors - Sélecteur(s) CSS principal(aux)
     * @param {string|null} fallbackSelector - Sélecteur de secours (optionnel)
     * @param {Object} options - Options de traitement
     * @param {boolean} options.normalizeText - Normaliser le texte (gérer &nbsp;)
     * @param {boolean} options.checkKeywords - Vérifier les mots-clés avant de coloriser
     * @param {boolean} options.addViewsKeyword - Ajouter le mot-clé de vues si nécessaire
     * @param {boolean} options.useCache - Utiliser le cache processedElements
     * @param {Function} options.filter - Fonction de filtrage personnalisée (optionnel)
     */
    function colorizeElements(selectors, fallbackSelector = null, options = {}) {
        const {
            normalizeText = false,
            checkKeywords = false,
            addViewsKeyword = false,
            useCache = false,
            filter = null
        } = options;

        const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
        const elements = safeQuerySelectorAll(selectorArray[0], fallbackSelector || selectorArray[1] || null);

        elements.forEach(element => {
            if (!document.contains(element)) return;
            if (useCache && processedElements.has(element)) return;
            if (filter && !filter(element)) return;

            const text = normalizeText
                ? extractNormalizedText(element)
                : (element.textContent || '').trim();

            if (!text) return;

            // Vérifier les mots-clés si demandé
            if (checkKeywords) {
                const lowerText = text.toLowerCase();
                const hasDate = hasDateKeyword(text);
                const hasViews = hasViewsKeyword(lowerText);
                if (!hasDate && !hasViews) return;
            }

            // Préparer le texte pour la colorisation
            const textForColorization = addViewsKeyword
                ? addViewsKeywordIfNeeded(text)
                : text;

            applyStyle(element, colorizeText(textForColorization));
            if (useCache) processedElements.add(element);
        });
    }

    /**
     * Extrait et normalise le texte d'un élément
     * @param {HTMLElement} element - Élément à traiter
     * @returns {string} Texte normalisé
     */
    function extractNormalizedText(element) {
        let fullText = element.innerText || element.textContent || '';
        if (!fullText && element.innerHTML) {
            const temp = document.createElement('div');
            temp.innerHTML = element.innerHTML;
            fullText = temp.innerText || temp.textContent || '';
        }
        return fullText.replace(/[\s\u00A0\u2009\u202F]+/g, ' ').trim();
    }

    /**
     * Sépare le texte en vues et date
     * @param {string} text - Texte à séparer
     * @returns {Object|null} {viewsText, dateText, separator} ou null
     */
    function separateViewsAndDate(text) {
        const separatorPattern = /\s+[•·]\s+/;
        const match = text.match(separatorPattern);
        if (!match) return null;

        const separator = match[0];
        const parts = text.split(separatorPattern);
        if (parts.length < 2) return null;

        return {
            viewsText: parts[0].trim(),
            dateText: parts.slice(1).join(separator).trim(),
            separator
        };
    }

    /**
     * Ajoute le mot-clé de vues si nécessaire pour la colorisation
     * @param {string} text - Texte à traiter
     * @returns {string} Texte avec mot-clé si nécessaire
     */
    function addViewsKeywordIfNeeded(text) {
        const viewsKeywords = getViewsKeywords();
        if (!viewsKeywords || !Array.isArray(viewsKeywords)) return text;

        const lowerText = text.toLowerCase();
        const hasKeyword = viewsKeywords.some(kw => lowerText.includes(kw.toLowerCase()));
        return hasKeyword ? text : text + ' ' + viewsKeywords[0];
    }

    /**
     * Crée et colorise des spans séparés pour vues et date
     * @param {HTMLElement} container - Conteneur parent
     * @param {string} viewsText - Texte des vues
     * @param {string} dateText - Texte de la date
     * @param {string} separator - Séparateur à utiliser
     */
    function createAndColorizeSpans(container, viewsText, dateText, separator = ' • ') {
        container.innerHTML = '';

        const viewsSpan = document.createElement('span');
        viewsSpan.textContent = viewsText;
        container.appendChild(viewsSpan);

        const separatorSpan = document.createElement('span');
        separatorSpan.textContent = separator;
        separatorSpan.style.margin = '0 4px';
        container.appendChild(separatorSpan);

        const dateSpan = document.createElement('span');
        dateSpan.textContent = dateText;
        container.appendChild(dateSpan);

        // Coloriser les vues et la date
        const viewsStyle = colorizeText(addViewsKeywordIfNeeded(viewsText));
        if (viewsStyle?.color) applyStyle(viewsSpan, viewsStyle);

        const dateStyle = colorizeText(dateText);
        if (dateStyle?.color) applyStyle(dateSpan, dateStyle);
    }

    /**
     * Colorise un span existant
     * @param {HTMLElement} span - Span à coloriser
     */
    function colorizeExistingSpan(span) {
        const text = (span.innerText || span.textContent || '').trim();
        if (!text) return;

        const style = colorizeText(addViewsKeywordIfNeeded(text));
        if (style?.color) applyStyle(span, style);
    }

    /**
     * Met à jour les styles de tous les éléments connus
     */
    function updateAllStyles() {
        // Tous les sélecteurs pour vues et dates
        const allSelectors = [
            // Page d'accueil et abonnements
            'span.yt-content-metadata-view-model__metadata-text',
            'span[class*="metadata-text"]',
            'yt-formatted-string span',
            // Pages de chaîne
            'ytd-grid-video-renderer #metadata-line span',
            'ytd-grid-video-renderer span.style-scope',
            'ytd-grid-video-renderer span[class*="style-scope"]',
            // Shorts
            '.shortsLockupViewModelHostMetadataSubhead span',
            '.shortsLockupViewModelHostOutsideMetadataSubhead span',
            'span.yt-core-attributed-string[role="text"]',
            // Posts YouTube
            'yt-formatted-string#published-time-text a',
            'yt-formatted-string[id="published-time-text"] a',
            'ytd-backstage-post-renderer yt-formatted-string a',
            // Page de lecture
            '#view-count yt-formatted-string span',
            '[id*="view-count"] yt-formatted-string span',
            '[id*="viewCount"] yt-formatted-string span',
            '#date-text yt-formatted-string span',
            '[id*="date-text"] yt-formatted-string span',
            '[id*="dateText"] yt-formatted-string span',
            // Blocs de métadonnées vidéo
            'ytd-video-meta-block span.inline-metadata-item',
            // Commentaires
            'a.yt-simple-endpoint.style-scope.ytd-comment-view-model',
            'a[class*="comment-view-model"]',
            'ytd-comment-view-model a'
        ];

        // Traiter tous les sélecteurs de manière unifiée
        allSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (!document.contains(element)) return;
                    if (processedElements.has(element)) return;

                    // Ignorer les éléments déjà traités par les fonctions spéciales
                    if (element.closest('#view-count, #date-text')) {
                        // Ces éléments sont traités par updateVideoPageStyles()
                        return;
                    }

                    const text = extractNormalizedText(element);
                    if (!text) return;

                    const lowerText = text.toLowerCase();
                    const hasDate = hasDateKeyword(text);
                    const hasViews = hasViewsKeyword(lowerText);

                    if (hasDate || hasViews) {
                        const textForColorization = hasViews
                            ? addViewsKeywordIfNeeded(text)
                            : text;

                        applyStyle(element, colorizeText(textForColorization));
                        processedElements.add(element);
                    }
                });
            } catch (e) {
                // Ignorer les sélecteurs invalides
            }
        });
    }

    /**
     * Met à jour les styles sur la page de lecture d'une vidéo
     */
    function updateVideoPageStyles() {
        const viewsKeywords = getViewsKeywords();

        // Traiter le nombre de vues
        const viewCount = safeQuerySelector('#view-count', '[id*="view-count"], [id*="viewCount"]');
        if (viewCount && document.contains(viewCount)) {
            const textSpan = viewCount.querySelector('yt-formatted-string:last-of-type') ||
                viewCount.querySelector('yt-formatted-string');
            if (textSpan && textSpan.textContent && viewsKeywords) {
                const textWithKeyword = textSpan.textContent + ' ' + viewsKeywords[0];
                applyStyle(textSpan, colorizeText(textWithKeyword));
            }

            // Traiter tous les spans enfants
            colorizeElements(
                '#view-count yt-formatted-string span',
                '[id*="view-count"] yt-formatted-string span, [id*="viewCount"] yt-formatted-string span',
                { filter: (span) => hasViewsKeyword((span.textContent || '').toLowerCase()) }
            );
        }

        // Traiter la date de publication
        const dateText = safeQuerySelector('#date-text', '[id*="date-text"], [id*="dateText"]');
        if (dateText && document.contains(dateText)) {
            const dateElements = dateText.querySelectorAll('yt-formatted-string');
            if (dateElements.length > 0) {
                const allText = Array.from(dateElements)
                    .map(el => el.textContent)
                    .filter(Boolean)
                    .join('')
                    .trim();

                if (allText) {
                    const style = colorizeText(allText);
                    dateElements.forEach(el => {
                        if (el.textContent && el.textContent.trim()) {
                            applyStyle(el, style);
                        }
                    });
                }
            }

            // Traiter les spans individuels pour un style plus précis
            colorizeElements(
                '#date-text yt-formatted-string span',
                '[id*="date-text"] yt-formatted-string span, [id*="dateText"] yt-formatted-string span',
                { filter: (span) => hasDateKeyword(span.textContent || '') }
            );
        }
    }

    /**
     * Met à jour les styles des suggestions de vidéos
     */
    function updateVideowallStyles() {
        const videowallSelectors = [
            '.ytp-modern-videowall-still-view-count-and-date-info',
            '[class*="videowall-still-view-count"]',
            '[class*="ytp-modern-videowall"]'
        ];

        let videowallSpans = [];
        for (const selector of videowallSelectors) {
            try {
                const found = document.querySelectorAll(selector);
                if (found.length > 0) {
                    videowallSpans = Array.from(found);
                    break;
                }
            } catch (e) {
                // Ignorer les sélecteurs invalides
            }
        }

        videowallSpans.forEach(span => {
            if (!document.contains(span)) return;

            const normalizedText = extractNormalizedText(span);
            if (!normalizedText) return;

            // Vérifier si déjà séparé en spans
            const existingSpans = Array.from(span.querySelectorAll('span'));
            if (existingSpans.length > 0) {
                existingSpans.forEach(colorizeExistingSpan);
                return;
            }

            // Essayer de séparer vues et date
            const separated = separateViewsAndDate(normalizedText);
            if (separated && separated.viewsText && separated.dateText) {
                createAndColorizeSpans(span, separated.viewsText, separated.dateText, separated.separator);
                return;
            }

            // Fallback : essayer de séparer par mots-clés
            const viewsKeywords = getViewsKeywords();
            const dateKeywords = getDateKeywords();
            if (viewsKeywords && dateKeywords) {
                const lowerText = normalizedText.toLowerCase();
                const firstViewsKeyword = viewsKeywords[0].toLowerCase();
                const firstDateKeyword = dateKeywords[0].toLowerCase();

                if (lowerText.includes(firstViewsKeyword) && lowerText.includes(firstDateKeyword)) {
                    const dateIndex = lowerText.indexOf(firstDateKeyword);
                    if (dateIndex > 0) {
                        const viewsText = normalizedText.substring(0, dateIndex).trim();
                        const dateText = normalizedText.substring(dateIndex).trim();
                        createAndColorizeSpans(span, viewsText, dateText);
                        return;
                    }
                }
            }

            // Dernier recours : coloriser le span entier
            const style = colorizeText(normalizedText);
            if (style?.color) applyStyle(span, style);
        });
    }

    /**
     * Met à jour tous les styles (appelée depuis les observers)
     */
    function updateVideoStyles() {
        // Approche unifiée pour tous les sélecteurs connus
        updateAllStyles();

        // Cas spéciaux nécessitant une logique particulière
        updateVideoPageStyles(); // Traitement spécial pour #view-count et #date-text (éléments parents)
        updateVideowallStyles(); // Cas spécial pour séparer vues et date dans videowall
    }

    // --- Gestion de l'état du mode Quick View ---
    /**
     * Met à jour l'état du mode Quick View selon le type de page
     * Désactive automatiquement le mode sur les pages de chaîne
     */
    function updateQuickViewModeState() {
        const enabled = isEnabled();
        const shouldBeActive = enabled && !isChannelPage();
        document.documentElement.classList.toggle(CLASS_NAME, shouldBeActive);
    }

    // ===================== UTILITAIRES =====================
    /**
     * Sélecteur sécurisé avec fallback en cas d'échec
     * @param {string} selector - Sélecteur CSS principal
     * @param {string|null} fallbackSelector - Sélecteur de secours
     * @returns {HTMLElement|null} Élément trouvé ou null
     */
    function safeQuerySelector(selector, fallbackSelector = null) {
        try {
            const element = document.querySelector(selector);
            if (element) return element;
            if (fallbackSelector) {
                return document.querySelector(fallbackSelector);
            }
        } catch (e) {
            console.warn(`[Quick View] Sélecteur invalide: ${selector}`, e);
        }
        return null;
    }

    /**
     * Sélecteur multiple sécurisé avec fallback
     * @param {string} selector - Sélecteur CSS principal
     * @param {string|null} fallbackSelector - Sélecteur de secours
     * @returns {HTMLElement[]} Tableau d'éléments trouvés
     */
    function safeQuerySelectorAll(selector, fallbackSelector = null) {
        try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) return Array.from(elements);
            if (fallbackSelector) {
                return Array.from(document.querySelectorAll(fallbackSelector));
            }
        } catch (e) {
            console.warn(`[Quick View] Sélecteur invalide: ${selector}`, e);
        }
        return [];
    }

    // ===================== OPTIMISATION =====================
    /**
     * Debounce : exécute la fonction seulement après un délai sans appel
     * Utile pour limiter les appels fréquents (ex: lors des mutations DOM)
     * @param {Function} func - Fonction à débouncer
     * @param {number} delay - Délai en millisecondes
     * @returns {Function} Fonction débouncée
     */
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Throttle : exécute la fonction au maximum une fois par délai
     * Utile pour limiter la fréquence d'exécution
     * @param {Function} func - Fonction à throttler
     * @param {number} delay - Délai en millisecondes
     * @returns {Function} Fonction throttlée
     */
    function throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    }

    // ===================== COOKIE =====================
    /**
     * Lit un cookie par son nom
     * @param {string} name - Nom du cookie
     * @returns {string|null} Valeur du cookie ou null si non trouvé
     */
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }

    /**
     * Définit un cookie
     * @param {string} name - Nom du cookie
     * @param {string} value - Valeur du cookie
     * @param {number} days - Nombre de jours avant expiration (optionnel)
     */
    function setCookie(name, value, days = 365) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=.youtube.com`;
    }

    /**
     * Modifie le cookie PREF pour désactiver le mode "liste" de YouTube
     */
    function fixCookie() {
        const prefCookie = getCookie('PREF');
        if (!prefCookie) return;

        // Vérifier si le cookie contient f6=40000001 (mode liste)
        if (prefCookie.includes('f6=40000001')) {
            // Remplacer f6=40000001 par f6=40000000 (mode par défaut)
            const updatedCookie = prefCookie.replace(/f6=40000001/g, 'f6=40000000');
            setCookie('PREF', updatedCookie);
        }
    }

    // ===================== INIT =====================
    /**
     * Initialise le script : configure les observers et crée le bouton
     */
    function init() {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Appliquer la classe CSS selon l'état sauvegardé (MISE EN PAGE)
        updateQuickViewModeState();

        // Charger l'état d'activation des couleurs (COLORISATION)
        loadColorsEnabledState();

        // Corriger le cookie si nécessaire
        fixCookie();

        // Créer le bouton si le container existe déjà (MISE EN PAGE)
        const container = document.querySelector('ytd-masthead #end');
        if (container) createButton(container);
        else observeMastheadOnce();

        // Écouter les événements de navigation YouTube (SPA)
        window.addEventListener('yt-navigate-finish', () => {
            updateQuickViewModeState();
            observeMastheadOnce();
            updateVideoStyles();
        });

        // Observer les changements d'URL (pour les navigations SPA)
        let lastPath = location.pathname;
        const throttledUrlChange = throttle(() => {
            const currentPath = location.pathname;
            if (currentPath !== lastPath) {
                lastPath = currentPath;
                updateQuickViewModeState();
                observeMastheadOnce();
                updateVideoStyles();
            }
        }, THROTTLE_DELAY);
        new MutationObserver(throttledUrlChange).observe(document, { subtree: true, childList: true });


        // Écouter le raccourci clavier (MISE EN PAGE)
        document.addEventListener('keydown', onKeyDown, true);

        // Observer les changements du DOM pour mettre à jour les styles (COLORISATION)
        const debouncedUpdateVideoStyles = debounce(updateVideoStyles, DEBOUNCE_DELAY);
        const styleObserver = new MutationObserver(debouncedUpdateVideoStyles);
        styleObserver.observe(document.body, { childList: true, subtree: true });

        // Observer les changements de thème (clair/sombre) (COLORISATION)
        const throttledUpdateButtonTheme = throttle(() => {
            invalidateColorCache();
            updateButtonTheme();
        }, THROTTLE_DELAY);
        const themeObserver = new MutationObserver(throttledUpdateButtonTheme);
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['dark', 'class']
        });
        themeObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['dark', 'class']
        });

        // Initialiser les styles et le bouton au démarrage
        updateVideoStyles();
        updateButtonTheme();
    }

    // ===================== POPUP CONFIGURATION =====================
    /**
     * Écoute les messages du popup de configuration pour mettre à jour l'état et les couleurs
     */
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'colorsEnabled') {
            const { enabled } = message.data;
            colorsEnabled = enabled;
            if (enabled) {
                loadCustomColors();
                updateVideoStyles();
            } else {
                clearAllColors();
            }
            sendResponse({ success: true });
        } else if (message.action === 'colorChange') {
            const { key, color } = message.data;
            const baseKey = key.replace(/-dark$|-light$/, '');
            const isDark = key.endsWith('-dark');
            const isLight = key.endsWith('-light');

            const cssVarMap = {
                'date-day': '--quick-view-date-day',
                'date-week': '--quick-view-date-week',
                'date-month': '--quick-view-date-month',
                'date-year-1-3': '--quick-view-date-year-1-3',
                'date-year-3-plus': '--quick-view-date-year-3-plus',
                'date-default': '--quick-view-date-default',
                'views-k': '--quick-view-views-k',
                'views-m': '--quick-view-views-m',
                'views-md': '--quick-view-views-md'
            };

            if (cssVarMap[baseKey]) {
                const currentIsDark = isDarkTheme();

                if ((isDark && currentIsDark) || (isLight && !currentIsDark) || (!isDark && !isLight)) {
                    applyCustomColor(cssVarMap[baseKey], color);
                    invalidateColorCache();
                    updateVideoStyles();
                }
                sendResponse({ success: true });
            } else {
                sendResponse({ success: false });
            }
        } else if (message.action === 'getTheme') {
            sendResponse({ isDark: isDarkTheme() });
        }
        return true;
    });

    init();
})();
