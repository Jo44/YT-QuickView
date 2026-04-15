///////////////////////////////////////////////////
// Shared.js - Constantes et fonctions partagées //
///////////////////////////////////////////////////
window.YTQuickViewShared = (() => {
    'use strict';

    // Constantes communes
    const COLOR_STORAGE_PREFIX = 'quickViewColor_';
    const COLORS_ENABLED_KEY = 'quickViewColorsEnabled';

    // Constantes SVG
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const SVG_SIZE = '20';
    const SVG_VIEWBOX = '0 0 24 24';
    const STROKE_WIDTH = '2.0';

    // Map des variables CSS pour les couleurs
    const CSS_VAR_MAP = {
        'youtube-marker': '--quick-view-youtube-marker',
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

    // Expose les fonctions et constantes nécessaires
    return {
        COLOR_STORAGE_PREFIX,
        COLORS_ENABLED_KEY,
        CSS_VAR_MAP,
        createListIcon,
        createGridIcon
    };
})();
