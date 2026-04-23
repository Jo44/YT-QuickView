///////////////////////////////////////////
// Colorizer.js - Module de colorisation //
///////////////////////////////////////////

// Imports
import { state, YT_SELECTORS, processedElements, styleCache } from './globals.js';
import { safeQuerySelector, safeQuerySelectorAll } from './utils.js';

// Dictionnaire de mots-clés et patterns regex pour les différentes langues supportées
let regexLanguage = null;
const LANGUAGE_PACKS = {
    fr: {
        dateKeywords: ['il y a', 'jour', 'semaine', 'mois', 'an'],
        viewsKeywords: ['vues', 'k vues', 'm de vues', 'md de vues'],
        dateRegexPattern: '(\\d+)\\s+(jour|j\\b|semaine|sem\\b|mois|m\\b|an|a\\b|heure|h\\b|minute|min\\b|seconde|s\\b)'
    },
    en: {
        dateKeywords: ['ago', 'day', 'week', 'month', 'year'],
        viewsKeywords: ['views', 'k views', 'm views', 'b views'],
        dateRegexPattern: '(\\d+)\\s+(day|d\\b|week|w\\b|month|mo\\b|year|y\\b|hour|h\\b|minute|m\\b|second|s\\b)\\s+ago'
    }
};

// Détecte la langue de YouTube
function getYouTubeLanguage() {
    const lang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    if (!lang) return 'en';
    if (lang.startsWith('fr')) return 'fr';
    return 'en';
}

// Récupère le pack de langue actuel
function getLanguagePack() {
    const lang = getYouTubeLanguage();
    return LANGUAGE_PACKS[lang] || LANGUAGE_PACKS.en;
}

// Vérifie que les patterns regex sont à jour avec la langue actuelle de YouTube
function ensureRegexPatternsUpToDate() {
    const lang = getYouTubeLanguage();
    if (!state.viewRegexPatterns || regexLanguage !== lang) {
        initRegexPatterns();
    }
}

/**
 * Initialise les expressions régulières pour la performance du Regex Matcher
 */
export function initRegexPatterns() {

    // Récupération des mots-clés de vues
    const viewsKeywords = getLanguagePack().viewsKeywords;
    const baseKw = viewsKeywords && viewsKeywords[0] ? viewsKeywords[0] : 'views';
    const kKw = viewsKeywords && viewsKeywords[1] ? viewsKeywords[1] : 'k views';
    const mKw = viewsKeywords && viewsKeywords[2] ? viewsKeywords[2] : 'm views';
    const bKw = viewsKeywords && viewsKeywords[3] ? viewsKeywords[3] : 'b views';

    // Regex optimisés pour les formats de vues avec support multilingue et formats courts
    regexLanguage = getYouTubeLanguage();

    // Patterns optimisés avec support multilingue et formatage court (10k, 1M, vues, views, etc.)
    state.viewRegexPatterns = {
        baseCheck: new RegExp(`(${baseKw}|vue|view|spectateur|spectator|watching)`, 'i'),
        billionCheck: new RegExp(`\\b(md|b)\\b|${bKw}`, 'i'),
        millionCheck: new RegExp(`\\bm\\b|m de|${mKw}`, 'i'),
        kiloCheck: new RegExp(`\\bk\\b|mille|${kKw}`, 'i'),
        exactScaleB: /^[\d.,]+(b|md)(?:\||v|$)|\|[\d.,]+(b|md)(?:\||v|$)/i,
        exactScaleM: /^[\d.,]+m(?:\||v|$)|\|[\d.,]+m(?:\||v|$)/i,
        exactScaleK: /^[\d.,]+k(?:\||v|$)|\|[\d.,]+k(?:\||v|$)/i,
        shortMatch: /^\d+(?:[.,]\d+)?(k|m|b|md)?$/i,
        scalePipe: /^[\d.,]+(k|m|b|md)(?:\||$)/i,
        rawNumberMatch: /^[\d.,]+/
    };
}

/**
 * Lit les CSS partagées de date-color pour l'application JS sur les spans
 * @returns {Object} Objet avec références variables (ex: 'var(--quick-view...)')
 */
function getDateColors() {
    return {
        DAY: 'var(--quick-view-date-day)',
        WEEK: 'var(--quick-view-date-week)',
        MONTH: 'var(--quick-view-date-month)',
        YEAR_1_3: 'var(--quick-view-date-year-1-3)',
        YEAR_3_PLUS: 'var(--quick-view-date-year-3-plus)',
        DEFAULT: 'var(--quick-view-date-default)'
    };
}

/**
 * Retourne le style de date à appliquer par ancienneté
 * @param {string} text Le texte à coloriser (ex. "il y a 3 mois")  
 * @returns {Object|null} Objet de style CSS ou null si rejeté
 */
function colorizeDate(text) {

    // Récupération des mots-clés de date
    const dateKeywords = getLanguagePack().dateKeywords;
    if (!dateKeywords) return null;

    // Récupération du texte
    const lower = text.toLowerCase();
    const firstKeyword = dateKeywords[0].toLowerCase(); // Typiquement l'indicateur de base: "il y a" ou "ago"

    // Vérification de la présence du mot-clé de date
    if (!lower.includes(firstKeyword)) return null;
    if (text.length > 150) return null; // Sécurité de longueur

    // Pattern regex basé sur la langue YouTube
    let patternStr = getLanguagePack().dateRegexPattern;
    if (!patternStr) patternStr = LANGUAGE_PACKS.en.dateRegexPattern;

    // Pattern restrictif pour date
    const datePattern = new RegExp(patternStr, "i");
    if (!datePattern.test(lower) && text.length > 100) return null;

    // Application des règles de colorisation selon les unités de temps détectées
    const dateColors = getDateColors();
    if (lower.includes(dateKeywords[1].toLowerCase()) || /\b\d+\s*j\b/i.test(lower) || /\b\d+\s*d\b/i.test(lower)) return { color: dateColors.DAY, fontWeight: 'normal' };
    if (lower.includes(dateKeywords[2].toLowerCase()) || /\b\d+\s*sem\b/i.test(lower) || /\b\d+\s*w\b/i.test(lower)) return { color: dateColors.WEEK, fontWeight: 'normal' };
    if (lower.includes(dateKeywords[3].toLowerCase()) || /\b\d+\s*m\b/i.test(lower) || /\b\d+\s*mo\b/i.test(lower)) return { color: dateColors.MONTH, fontWeight: 'normal' };
    if (lower.includes(dateKeywords[4].toLowerCase()) || /\b\d+\s*a\b/i.test(lower) || /\b\d+\s*y\b/i.test(lower)) {
        const match = lower.match(/(?:il\s+y\s+a\s+)?(\d+)\s*(?:an|a\b|year|y\b)/i) || lower.match(/(\d+)/);
        if (match) {
            const years = parseInt(match[1]);
            return { color: years > 3 ? dateColors.YEAR_3_PLUS : dateColors.YEAR_1_3, fontWeight: 'normal' };
        }
        return { color: dateColors.YEAR_1_3, fontWeight: 'normal' };
    }
    return { color: dateColors.DEFAULT, fontWeight: 'normal' };
}

/**
 * Lit le rendu d'une couleur depuis `:root` document (utilisé si `var(--)` direct échoue sur certains text-nodes)
 * @returns {Object} Couleurs brutes extraites (HEX/RGB)
 */
function getViewsColors() {

    // Cache pour éviter les lectures redondantes de styles
    if (state.cachedViewsColors) return state.cachedViewsColors;

    // Cache des couleurs depuis les variables CSS définies dans le thème (fallbacks inclus)
    const computedStyle = getComputedStyle(document.documentElement);
    state.cachedViewsColors = {
        K: computedStyle.getPropertyValue('--quick-view-views-k').trim() || '#C48938',
        M: computedStyle.getPropertyValue('--quick-view-views-m').trim() || '#FA9717',
        MD: computedStyle.getPropertyValue('--quick-view-views-md').trim() || '#FBA434'
    };

    // Retourne le cache
    return state.cachedViewsColors;
}

/**
 * Retourne le style de vues à appliquer selon plusieurs seuils numériques (k, m, md)
 * @param {string} text Le texte à coloriser (ex: "1.2 M de vues")
 * @returns {Object|null} Objet style CSS ou null si rejeté
 */
function colorizeViews(text) {

    // Initialisation des patterns regex
    ensureRegexPatternsUpToDate();

    // Récupération du texte et nettoyage pour les checks
    const lower = text.toLowerCase();
    const cleanStr = lower.replace(/[\s\u00A0\u2009\u202F]+/g, '').trim(); // Filtres des insécabales

    // Vérification de la présence du mot-clé de vues ou des formats courts (ex: "60K", "1.5M", "2B")
    const shortMatch = state.viewRegexPatterns.shortMatch.test(cleanStr);
    const hasScalePipe = state.viewRegexPatterns.scalePipe.test(cleanStr);
    const hasKeyword = state.viewRegexPatterns.baseCheck.test(lower) || shortMatch || hasScalePipe;
    if (!hasKeyword) return null;

    // Détecte un format compact type "9.6kwatching" / "1.2mviews" / "2bwatching"
    const compactScaleMatch = cleanStr.match(/^[\d.,]+(k|m|b|md)/i) || cleanStr.match(/\|[\d.,]+(k|m|b|md)/i);

    // Nettoyage du texte pour les checks
    const cleanText = lower.replace(/\s+/g, ' ').trim();
    const viewsColors = getViewsColors();
    const hasBScale = state.viewRegexPatterns.exactScaleB.test(cleanStr);
    const hasMScale = state.viewRegexPatterns.exactScaleM.test(cleanStr);
    const hasKScale = state.viewRegexPatterns.exactScaleK.test(cleanStr);

    // Détection de l'unité de vues : Milliards
    const compactB = compactScaleMatch && (compactScaleMatch[1] === 'b' || compactScaleMatch[1] === 'md');
    const isBillion = compactB || state.viewRegexPatterns.billionCheck.test(cleanText) || (shortMatch && (cleanStr.endsWith('b') || cleanStr.endsWith('md'))) || hasBScale;
    if (isBillion) return { color: viewsColors.MD, fontWeight: 'bold' };

    // Détection de l'unité de vues : Millions
    const compactM = compactScaleMatch && compactScaleMatch[1] === 'm';
    const isMillion = compactM || state.viewRegexPatterns.millionCheck.test(cleanText) || (shortMatch && cleanStr.endsWith('m')) || hasMScale;
    if (isMillion) return { color: viewsColors.M, fontWeight: 'normal' };

    // Détection de l'unité de vues : Milliers
    const compactK = compactScaleMatch && compactScaleMatch[1] === 'k';
    const isKilo = compactK || state.viewRegexPatterns.kiloCheck.test(cleanText) || (shortMatch && cleanStr.endsWith('k')) || hasKScale;
    if (isKilo) return { color: viewsColors.K, fontWeight: 'normal' };

    // Capture des nombres exacts sans unité K/M (ex: "82 vues")
    const rawNumberMatch = cleanStr.match(state.viewRegexPatterns.rawNumberMatch);
    if (rawNumberMatch) {
        const exactNumber = parseInt(rawNumberMatch[0].replace(/[.,]/g, ''), 10);
        if (!isNaN(exactNumber)) {
            if (exactNumber >= 1000000000) return { color: viewsColors.MD, fontWeight: 'bold' };
            if (exactNumber >= 1000000) return { color: viewsColors.M, fontWeight: 'normal' };
            if (exactNumber >= 1000) return { color: viewsColors.K, fontWeight: 'normal' };
        }
    }
    return null;
}

/**
 * Applique la logique de colorisation sur un texte donné
 * @param {string} text Le texte à coloriser
 * @return {Object} Objet de style CSS
 */
export function colorizeText(text) {

    // Colorisation prioritaire de la date
    const dateStyle = colorizeDate(text);
    if (dateStyle) return dateStyle;

    // Colorisation secondaire des vues
    const viewsStyle = colorizeViews(text);
    if (viewsStyle) return viewsStyle;

    // Style par défaut (pas de mots-clés détectés)
    return { color: '', fontWeight: 'normal' };
}

/**
 * Applique un style calculé à un élément du DOM
 * @param {HTMLElement} element L'élément DOM à styliser
 * @param {Object} style Objet de style CSS
 */
export function applyStyle(element, style) {

    // Validations de base avant application
    if (!element || !style || !style.color) return; // Pas de style à appliquer
    if (!document.contains(element)) return;        // Protection de rendu
    if (!state.colorsEnabled) return;               // Vérification de l'activation

    // Vérification du cache pour éviter les mutations CSS redondantes
    const cachedStyle = styleCache.get(element);
    if (cachedStyle && cachedStyle.color === style.color && cachedStyle.fontWeight === style.fontWeight) return;

    // Application du style
    element.style.color = style.color;
    element.style.fontWeight = style.fontWeight;

    // Mise à jour du cache de style
    styleCache.set(element, { color: style.color, fontWeight: style.fontWeight });
}

/**
 * Vérifie la présence de mots-clés de date
 * @param {any} text Le texte à analyser
 * @returns {boolean} True si un mot-clé de date est détecté dans le texte, sinon false
 */
export function hasDateKeyword(text) {
    if (!text) return false;
    const keywords = getLanguagePack().dateKeywords;
    if (!keywords || !Array.isArray(keywords)) return false;
    return keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
}

/**
 * Vérifie la présence de mots-clés de vues
 * @param {any} text Le texte à analyser
 * @returns {boolean} True si un mot-clé de vues est détecté dans le texte, sinon false
 */
export function hasViewsKeyword(text) {
    if (!text) return false;
    ensureRegexPatternsUpToDate();
    const lower = text.toLowerCase();
    if (state.viewRegexPatterns.baseCheck.test(lower)) return true;

    // Check patterns non verbaux comme "60K"
    const cleanText = lower.replace(/[\s\u00A0\u2009\u202F]+/g, '').trim();
    if (state.viewRegexPatterns.shortMatch.test(cleanText) || state.viewRegexPatterns.scalePipe.test(cleanText)) return true;
    return false;
}

/**
 * Extrait le texte interne sans balises cachées et tags
 * @param {HTMLElement} element Le noeud DOM à extraire
 * @return {string} Texte normalisé prêt pour l'analyse
 */
export function extractNormalizedText(element) {
    let fullText = element.innerText || element.textContent || '';
    if (!fullText && element.innerHTML) {
        const temp = document.createElement('div');
        temp.innerHTML = element.innerHTML;
        fullText = temp.innerText || temp.textContent || '';
    }
    return fullText.replace(/[\s\u00A0\u2009\u202F]+/g, ' ').trim();
}

/**
 * Récupère le texte à analyser pour la colorisation en combinant `aria-label` et `innerText`
 * @param {HTMLElement} element Le noeud DOM à analyser
 * @return {string} Texte combiné et normalisé pour l'analyse des mots-clés 
 */
export function getTextForAnalysis(element) {

    // Extraction du texte visible normalisé
    const visible = extractNormalizedText(element);

    // Fusion avec aria-label si présent
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
        return `${visible} | ${ariaLabel.replace(/[\s\u00A0\u2009\u202F]+/g, ' ').trim()}`;
    }
    return visible;
}

/**
 * Ajoute le mot-clé de vues manquant si besoin
 * @param {string} text Le texte à vérifier
 * @returns {string} Texte avec mot-clé de vues ajouté si besoin
 */
export function addViewsKeywordIfNeeded(text) {

    // Vérification de la présence d'un mot-clé de vues
    const viewsKeywords = getLanguagePack().viewsKeywords;
    if (!viewsKeywords || !Array.isArray(viewsKeywords)) return text;

    // Mise à jour des regex si nécessaire
    ensureRegexPatternsUpToDate();

    // Vérification de la présence d'un mot-clé de vues ou de formats courts
    const lowerText = text.toLowerCase();
    return state.viewRegexPatterns.baseCheck.test(lowerText) ? text : text + ' ' + viewsKeywords[0];
}

/**
 * Séparation textuelle quand YouTube met "40 vues • il y a 8 mois" dans un même textNode (ex Shorts / videowall)
 * @param {string} text Le texte à séparer
 * @return {Object|null} Objet avec {viewsText, dateText, separator} ou null si la séparation échoue
 */
function separateViewsAndDate(text) {

    // Check séparateur YouTube typique
    const separatorPattern = /\s+[•·]\s+/;
    const match = text.match(separatorPattern);
    if (!match) return null;

    // Séparation du texte en deux parties : avant et après le séparateur
    const separator = match[0];
    const parts = text.split(separatorPattern);
    if (parts.length < 2) return null;

    // Retourne les parties séparées pour une colorisation individuelle
    return { viewsText: parts[0].trim(), dateText: parts.slice(1).join(separator).trim(), separator };
}

/**
 * Scinde un textNode en un container avec 3 spans {View} {Sep} {Date} pour les coloriser unitairement
 * @param {HTMLElement} container Le noeud DOM à transformer
 * @param {string} viewsText Le texte des vues à coloriser
 * @param {string} dateText Le texte de la date à coloriser
 * @param {string} separator Le séparateur textuel entre les deux (ex: "•")
 */
function createAndColorizeSpans(container, viewsText, dateText, separator = ' • ') {
    container.innerHTML = '';

    // Création du span pour vues
    const viewsSpan = document.createElement('span');
    viewsSpan.textContent = viewsText;
    container.appendChild(viewsSpan);

    // Création du span pour séparateur
    const separatorSpan = document.createElement('span');
    separatorSpan.textContent = separator;
    separatorSpan.style.margin = '0 4px';
    container.appendChild(separatorSpan);

    // Création du span pour dates
    const dateSpan = document.createElement('span');
    dateSpan.textContent = dateText;
    container.appendChild(dateSpan);

    // Application du style des vues
    const viewsStyle = colorizeText(addViewsKeywordIfNeeded(viewsText));
    if (viewsStyle?.color) applyStyle(viewsSpan, viewsStyle);

    // Application du style des dates
    const dateStyle = colorizeText(dateText);
    if (dateStyle?.color) applyStyle(dateSpan, dateStyle);
}

/** Colorise un span scindé ou unique existant
 * @param {HTMLElement} span Le span à coloriser
 */
function colorizeExistingSpan(span) {

    // Protection de base
    const text = (span.innerText || span.textContent || '').trim();
    if (!text) return;

    // Application du style si applicable
    const style = colorizeText(addViewsKeywordIfNeeded(text));
    if (style?.color) applyStyle(span, style);
}

/**
 * Applique les styles de date et vues à tous les éléments correspondants
 * @param {HTMLElement[]} rootNodes Liste de conteneurs (par ex. Element[], Document[])
 */
export function updateAllStyles(rootNodes = [document]) {

    // Récupération de tous les sélecteurs DOM cibles
    const allSelectors = Object.keys(YT_SELECTORS).filter(key => key !== 'VIDEOWALL').flatMap(key => YT_SELECTORS[key]);

    // Parcours de tous les rootNodes (ex: Document, Shadow Roots) et application des sélecteurs
    rootNodes.forEach(root => {
        allSelectors.forEach(selector => {
            try {
                // Trouver les enfants qui correspondent
                const children = Array.from(root.querySelectorAll(selector));

                // Vérifier si le root lui-même correspond (Optimisation MutationObserver)
                const elements = (root !== document && root.matches && root.matches(selector))
                    ? [root, ...children]
                    : children;

                // Parcours de tous les éléments trouvés pour l'analyse et la colorisation
                elements.forEach(element => {

                    // Vérifications de base
                    if (!document.contains(element)) return;
                    if (processedElements.has(element)) return;
                    if (element.closest('#view-count, #date-text')) return;
                    if (element.closest('yt-attributed-string#content-text')) return;

                    // Extraction du texte visible normalisé pour l'analyse
                    const visibleText = extractNormalizedText(element);
                    if (!visibleText) return;

                    // Extraction du texte combiné pour l'analyse (visible + aria-label)
                    const analysisText = getTextForAnalysis(element);
                    const lowerText = analysisText.toLowerCase();

                    // Vérification de la présence de mots-clés de date ou de vues
                    const hasDate = hasDateKeyword(analysisText);
                    const hasViews = hasViewsKeyword(lowerText);

                    // Application du style si au moins un des deux types de mots-clés est présent
                    if (hasDate || hasViews) {

                        // Retourne le texte à coloriser en ajoutant le mot-clé de vues si nécessaire
                        const textForColorization = hasViews ? addViewsKeywordIfNeeded(analysisText) : analysisText;

                        // Application du style calculé à l'élément
                        applyStyle(element, colorizeText(textForColorization));

                        // Marquage de l'élément comme traité pour éviter les re-traitements futurs
                        processedElements.add(element);
                    }
                });
            } catch (ex) { }
        });
    });
}

/**
 * Applique les styles spécifiques de la page vidéo (vues et date) en ciblant les sélecteurs dédiés #view-count et #date-text
 * @param {HTMLElement[]} rootNodes Liste de conteneurs (par ex. Element[], Document[]) 
 */
export function updateVideoPageStyles(rootNodes = [document]) {

    // Récupération des mots-clés de vues pour les fallback textuels
    const viewsKeywords = getLanguagePack().viewsKeywords;

    // Parcours de tous les éléments pour appliquer les styles spécifiques
    rootNodes.forEach(root => {

        // Ciblage spécifique de la section de vues #view-count
        const viewCount = safeQuerySelector('#view-count', '[id*="view-count"], [id*="viewCount"]', root);
        if (viewCount && document.contains(viewCount)) {

            // Récupération du texte à coloriser
            const textSpan = viewCount.querySelector('yt-formatted-string:last-of-type') || viewCount.querySelector('yt-formatted-string');
            if (textSpan && textSpan.textContent && viewsKeywords) {

                // Application du style
                applyStyle(textSpan, colorizeText(textSpan.textContent + ' ' + viewsKeywords[0]));
            }

            // Colorisation des spans internes avec filtrage de mots-clés
            colorizeElements('#view-count yt-formatted-string span', '[id*="view-count"] yt-formatted-string span, [id*="viewCount"] yt-formatted-string span', { filter: (span) => hasViewsKeyword(getTextForAnalysis(span).toLowerCase()) }, root);
        }

        // Ciblage spécifique de la section de date #date-text
        const dateText = safeQuerySelector('#date-text', '[id*="date-text"], [id*="dateText"]', root);
        if (dateText && document.contains(dateText)) {

            // Récupération de tous les éléments de texte à coloriser
            const dateElements = dateText.querySelectorAll('yt-formatted-string');
            if (dateElements.length > 0) {

                // Extraction du texte combiné de tous les éléments pour analyse
                const allText = Array.from(dateElements).map(element => element.textContent).filter(Boolean).join('').trim();
                if (allText) {

                    // Application du style
                    const style = colorizeText(allText);
                    dateElements.forEach(element => {
                        if (element.textContent && element.textContent.trim()) applyStyle(element, style);
                    });
                }
            }

            // Colorisation des spans internes avec filtrage de mots-clés
            colorizeElements('#date-text yt-formatted-string span', '[id*="date-text"] yt-formatted-string span, [id*="dateText"] yt-formatted-string span', { filter: (span) => hasDateKeyword(getTextForAnalysis(span)) }, root);
        }
    });
}

/**
 * Applique les styles spécifiques du videowall en ciblant les sélecteurs dédiés
 * @param {HTMLElement[]} rootNodes Liste de conteneurs (par ex. Element[], Document[])
 */
export function updateVideowallStyles(rootNodes = [document]) {

    // Récupération des sélecteurs spécifiques au videowall
    const selectors = YT_SELECTORS.VIDEOWALL;

    // Parcours de tous les éléments pour appliquer les styles spécifiques
    rootNodes.forEach(root => {
        let videowallSpans = [];

        // Recherche des éléments correspondants aux sélecteurs du videowall
        for (const selector of selectors) {
            try {
                const children = Array.from(root.querySelectorAll(selector));
                const elements = (root !== document && root.matches && root.matches(selector))
                    ? [root, ...children]
                    : children;

                if (elements.length > 0) {
                    videowallSpans = elements;
                    break;
                }
            } catch (ex) { }
        }

        // Parcours de tous les éléments trouvés pour l'analyse et la colorisation
        videowallSpans.forEach(span => {

            // Vérifications de base
            if (!document.contains(span)) return;
            const normalizedText = extractNormalizedText(span);
            if (!normalizedText) return;

            // Colorisation directe si des spans internes existent déjà
            const existingSpans = Array.from(span.querySelectorAll('span'));
            if (existingSpans.length > 0) {
                existingSpans.forEach(colorizeExistingSpan);
                return;
            }

            // Séparation textuelle pour les cas où YouTube combine vues et date
            const separated = separateViewsAndDate(normalizedText);
            if (separated && separated.viewsText && separated.dateText) {
                createAndColorizeSpans(span, separated.viewsText, separated.dateText, separated.separator);
                return;
            }

            // Vérification de la présence des mots-clés de vues et de date pour une séparation manuelle
            const viewsKeywords = getLanguagePack().viewsKeywords;
            const dateKeywords = getLanguagePack().dateKeywords;
            if (viewsKeywords && dateKeywords) {
                const lowerText = normalizedText.toLowerCase();
                if (lowerText.includes(viewsKeywords[0].toLowerCase()) && lowerText.includes(dateKeywords[0].toLowerCase())) {
                    const dateIndex = lowerText.indexOf(dateKeywords[0].toLowerCase());
                    if (dateIndex > 0) {
                        createAndColorizeSpans(span, normalizedText.substring(0, dateIndex).trim(), normalizedText.substring(dateIndex).trim());
                        return;
                    }
                }
            }

            // Application du style direct si aucune séparation n'est possible
            const style = colorizeText(normalizedText);
            if (style?.color) applyStyle(span, style);
        });
    });
}

/**
 * Applique les styles de date et vues à tous les éléments cibles sur la page, en incluant les optimisations spécifiques pour la page vidéo et le videowall
 * @param {HTMLElement[]} rootNodes Liste de conteneurs (par ex. Element[], Document[])
 */
export function updateVideoStyles(rootNodes = [document]) {

    // Application des styles généraux à tous les éléments cibles
    updateAllStyles(rootNodes);

    // Application des styles spécifiques à la page vidéo
    updateVideoPageStyles(rootNodes);

    // Application des styles spécifiques au videowall
    updateVideowallStyles(rootNodes);
}
/**
 * Applique les styles de date et vues à tous les éléments correspondants aux sélecteurs fournis
 * @param {any} selectors - Un sélecteur CSS ou un tableau de sélecteurs à tester pour trouver les éléments à coloriser
 * @param {any} fallbackSelector - Un sélecteur CSS de secours à utiliser si le premier ne trouve aucun élément
 * @param {any} options - Un objet d'options pour personnaliser le comportement de la fonction
 * @param {any} root - Le conteneur racine dans lequel effectuer la recherche des éléments
 */
export function colorizeElements(selectors, fallbackSelector = null, options = {}, root = document) {

    // Extraction des options avec valeurs par défaut
    const { normalizeText = false, checkKeywords = false, addViewsKeyword = false, useCache = false, filter = null } = options;

    // Récupération de tous les éléments correspondants aux sélecteurs fournis
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    const elements = safeQuerySelectorAll(selectorArray[0], fallbackSelector || selectorArray[1] || null, root);

    // Parcours de tous les éléments trouvés pour l'analyse et la colorisation
    elements.forEach(element => {

        // Vérifications de base avant traitement
        if (!document.contains(element)) return;
        if (useCache && processedElements.has(element)) return;
        if (filter && !filter(element)) return;

        // Extraction du texte visible à analyser
        const visibleText = normalizeText ? extractNormalizedText(element) : (element.textContent || '').trim();
        if (!visibleText) return;

        // Extraction du texte combiné pour l'analyse (visible + aria-label)
        const textToAnalyze = normalizeText ? getTextForAnalysis(element) : visibleText;
        if (checkKeywords) {
            const lowerText = textToAnalyze.toLowerCase();
            if (!hasDateKeyword(textToAnalyze) && !hasViewsKeyword(lowerText)) return;
        }

        // Récupération du texte à coloriser en ajoutant le mot-clé de vues si nécessaire
        const textForColorization = addViewsKeyword ? addViewsKeywordIfNeeded(textToAnalyze) : textToAnalyze;

        // Application du style calculé à l'élément
        applyStyle(element, colorizeText(textForColorization));

        // Marquage de l'élément comme traité dans le cache pour éviter les re-traitements futurs
        if (useCache) processedElements.add(element);
    });
}
