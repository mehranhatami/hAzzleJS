// tween.js
var cHeightWidth = /^(height|width)$/i,
    cWidthHeight = /^(width|height)$/,
    cToprbLeft = /^(top|right|bottom|left)$/i,
    cTopLeft = /top|left/i,

    callUnitConversionData = {
        parent: null,
        position: null,
        fontSize: null,
        lastpToPW: null,
        lastToPH: null,
        lastEmToPx: null,
        remToPx: null,
        vwToPx: null,
        vhToPx: null
    };

function Tween(elem, options, prop, end, easing) {
    return new Tween.prototype.init(elem, options, prop, end, easing);
}

hAzzle.Tween = Tween;

Tween.prototype = {
    constructor: Tween,
    init: function(elem, options, prop, end, easing, unit) {


        this.elem = elem;
        this.prop = prop;

        // If we dont check the easing this way, it will throw

        this.easing = hAzzle.easing[easing] || hAzzle.easing[hAzzle.defaultEasing];
        this.duration = options.duration;
        this.options = options;
        this.step = options.step;
        this.start = this.now = this.getCSS(this.elem, this.prop);
        this.end = end;
        this.unit = unit || (hAzzle.unitless[prop] ? '' : 'px');
    },
    run: function(tick) {

        var pos;

        if (this.duration) {

            this.pos = pos = this.easing(tick);

        } else {

            this.pos = pos = tick;
        }

        // Current value

        this.now = (this.end - this.start) * pos + this.start;

        if (this.step) {
            this.step.call(this.elem, this.now, this);
        }

        this.setCSS(this.elem, this.prop, this.now + this.unit);

        return this;
    },

    // Set CSS properties

    setCSS: function(elem, prop, value, /* INTERNAL */ root) {

        prop = prop || this.prop;
        value = value || this.now;

        // Set the CSS style values

        elem.style[prop] = value;

        return [prop, value];
    },

    // Get CSS properties

    getCSS: function(elem, prop, root, force) {

        if (!/^[\d-]/.test(prop)) {

            // For SVG elements, dimensional properties (which SVGAttribute() detects) are tweened via
            // their HTML attribute values instead of their CSS style values. */

            if (hAzzle.data(elem) && hAzzle.data(elem).isSVG && hAzzle.SVGAttribute(prop)) {

                if (cHeightWidth.test(prop)) {
                    prop = elem.getBBox()[prop];
                } else {
                    prop = elem.getAttribute(prop);
                }
            } else {
                prop = this.getComputedStyles(elem, prop, force);
            }
        }

        if (hAzzle.isZeroValue(prop)) {
            prop = 0;
        }

        return prop;
    },

    // Get computed style values

    getComputedStyles: function(elem, prop, forceStyleLookup) {

        var computedValue = 0,
            toggleDisplay = false;


        function revertDisplay() {
            if (toggleDisplay) {
                this.setCSS(elem, 'display', 'none');
            }
        }

        if (cWidthHeight.test(prop) && this.getCSS(elem, 'display') === 0) {

            toggleDisplay = true;
            this.setCSS(elem, 'display', hAzzle.getDisplayType(elem));
        }


        if (!forceStyleLookup) {

            if (prop === 'height' &&
                this.getCSS(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {

                var contentBoxHeight = elem.offsetHeight -
                    (parseFloat(this.getCSS(elem, 'borderTopWidth')) || 0) -
                    (parseFloat(this.getCSS(elem, 'borderBottomWidth')) || 0) -
                    (parseFloat(this.getCSS(elem, 'paddingTop')) || 0) -
                    (parseFloat(this.getCSS(elem, 'paddingBottom')) || 0);
                revertDisplay();

                return contentBoxHeight;

            } else if (prop === 'width' &&
                this.getCSS(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {

                var contentBoxWidth = elem.offsetWidth -
                    (parseFloat(this.getCSS(elem, 'borderLeftWidth')) || 0) -
                    (parseFloat(this.getCSS(elem, 'borderRightWidth')) || 0) -
                    (parseFloat(this.getCSS(elem, 'paddingLeft')) || 0) -
                    (parseFloat(this.getCSS(elem, 'paddingRight')) || 0);

                revertDisplay();

                return contentBoxWidth;
            }
        }
         var computedStyle = getStyles(elem);

        // IE and Firefox do not return a value for the generic borderColor -- they only return individual values for each border side's color.
        // As a polyfill for querying individual border side colors, just return the top border's color.

        if ((hAzzle.ie || hAzzle.isFirefox) && prop === 'borderColor') {
            prop = 'borderTopColor';
        }

        if (hAzzle.ie === 9 && prop === 'filter') {
            computedValue = computedStyle.getPropertyValue(prop);
        } else {
            computedValue = computedStyle[prop];
        }

        if (computedValue === '' || computedValue === null) {
            computedValue = elem.style[prop];
        }

        revertDisplay();

        if (computedValue === 'auto' && cToprbLeft.test(prop)) {

            var position = this.getComputedStyles(elem, 'position');

            if (position === 'fixed' || (position === 'absolute' && cTopLeft.test(prop))) {
                computedValue = hAzzle(elem).position()[prop] + 'px';
            }
        }
        return computedValue;
    },

    // Calculate unit ratios

    calculateUnitRatios: function() {

        var sameRatioIndicators = {
                parent: this.elem.parentNode || document.body,
                position: this.getCSS(this.elem, 'position'),
                fontSize: this.getCSS(this.elem, 'fontSize')
            },

            // Determine if the same % ratio can be used. % is based on 
            // the elem's position value and its parent's width and height dimensions.

            samePercentRatio = ((sameRatioIndicators.position === callUnitConversionData.position) &&
                (sameRatioIndicators.parent === callUnitConversionData.parent)),

            // Determine if the same em ratio can be used. em is relative to the elem's fontSize.

            sameEmRatio = (sameRatioIndicators.fontSize === callUnitConversionData.fontSize);

        // Store these ratio indicators call-wide for the next elem to compare against.
        callUnitConversionData.parent = sameRatioIndicators.parent;
        callUnitConversionData.position = sameRatioIndicators.position;
        callUnitConversionData.fontSize = sameRatioIndicators.fontSize;

        var measurement = 100,
            unitRatios = {};

        if (!sameEmRatio || !samePercentRatio) {

            var overflowxy = ['overflow', 'overflowX', 'overflowY'],
                dim = ['minWidth', 'maxWidth', 'width', 'minHeight', 'maxHeight', 'height'],
                i = overflowxy.length,
                x = dim.length,
                dummy = hAzzle.data(this.elem).isSVG ?
                document.createElementNS('http://www.w3.org/TR/SVG/', 'rect') :
                document.createElement('div');

            hAzzle.styleCache(dummy);
            sameRatioIndicators.parent.appendChild(dummy);

            // To accurately and consistently calculate conversion ratios, the element's cascaded overflow and box-sizing are stripped.
            // Similarly, since width/height can be artificially constrained by their min-/max- equivalents, these are controlled for as well.
            // Note: Overflow must be also be controlled for per-axis since the overflow property overwrites its per-axis values.

            while (i--) {
                this.setCSS(dummy, overflowxy[i], 'hidden');
            }

            this.setCSS(dummy, 'position', sameRatioIndicators.position);
            this.setCSS(dummy, 'fontSize', sameRatioIndicators.fontSize);
            this.setCSS(dummy, 'boxSizing', 'content-box');

            // Width and height act as our proxy properties for measuring the horizontal and vertical % ratios.

            while (x--) {
                this.setCSS(dummy, dim[x], measurement + '%');
            }

            // PaddingLeft arbitrarily acts as our proxy property for the em ratio.

            this.setCSS(dummy, 'paddingLeft', measurement + 'em');

            // Divide the returned value by the measurement to get the ratio between 1% and 1px. Default to 1 since working with 0 can produce Infinite.

            unitRatios.pToPW = callUnitConversionData.lastpToPW = (parseFloat(this.getCSS(dummy, 'width', null, true)) || 1) / measurement;
            unitRatios.percentToPxHeight = callUnitConversionData.lastToPH = (parseFloat(this.getCSS(dummy, 'height', null, true)) || 1) / measurement;
            unitRatios.emToPx = callUnitConversionData.lastEmToPx = (parseFloat(this.getCSS(dummy, 'paddingLeft')) || 1) / measurement;

            sameRatioIndicators.parent.removeChild(dummy);
        } else {
            unitRatios.emToPx = callUnitConversionData.lastEmToPx;
            unitRatios.pToPW = callUnitConversionData.lastpToPW;
            unitRatios.percentToPxHeight = callUnitConversionData.lastToPH;
        }

        // Whereas % and em ratios are determined on a per-element basis, the rem unit only needs to be checked
        // once per call since it's exclusively dependant upon document.body's fontSize. If this is the first time
        // that calculateUnitRatios() is being run during this call, remToPx will still be set to its default value of null,
        // so we calculate it now.

        if (callUnitConversionData.remToPx === null) {
            // Default to browsers' default fontSize of 16px in the case of 0.
            callUnitConversionData.remToPx = parseFloat(this.getCSS(document.body, 'fontSize')) || 16;
        }

        // Similarly, viewport units are %-relative to the window's inner dimensions.

        if (callUnitConversionData.vwToPx === null) {
            callUnitConversionData.vwToPx = parseFloat(window.innerWidth) / 100;
            callUnitConversionData.vhToPx = parseFloat(window.innerHeight) / 100;
        }

        unitRatios.remToPx = callUnitConversionData.remToPx;
        unitRatios.vwToPx = callUnitConversionData.vwToPx;
        unitRatios.vhToPx = callUnitConversionData.vhToPx;

        // Avoid memory leak in IE

        dummy = null;

        return unitRatios;
    }
};

Tween.prototype.init.prototype = Tween.prototype;

hAzzle.fx = Tween.prototype.init;