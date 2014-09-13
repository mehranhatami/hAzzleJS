// styles.js
var i,

    // Create a cached element for re-use when checking for CSS property prefixes.

    prefixElement = document.createElement('div'),

    prefixMatches = {},

    // CSS Normal Transforms

    cssNormalTransform = {

        letterSpacing: '0',
        fontWeight: '400'
    },

    cssProperties = ['textShadow', 'opacity', 'clip', 'zIndex',
        'flex', 'order', 'borderCollapse', 'animation', 'animationFillMode', 'animationDirection',
        'animatioName', 'animationTimingFunction', 'animationPlayState', 'perspective', 'boxSizing',
        'textOverflow', 'columns', 'borderRadius', 'boxshadow', 'borderImage', 'columnCount', 'boxReflect',
        'columnSpan', 'columnCount', 'columnGap', 'columnWidth', 'columnRuleColor', 'columnRuleStyle', 'columnRuleWidth'
    ],

    cssCore = {

        regEx: {

            inlineregex: /^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i,
            listitemregex: /^(li)$/i,
            tablerowregex: /^(tr)$/i,
            zerovalue: /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i,
            leftrightRegex: /Left|Right/,
            numbs: /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i,
            gCSSVal: /^[\d-]/,
            cHeightWidth: /^(height|width)$/i
        },

        cssProps: {},

        unitless: {},

        has: {},

        support: {},

        hooks: {

            // Special hooks for animation

            animation: {},

            opacity: {
                name: 'opacity',
                set: function(elem, prop, value) {
                    return value;
                },
                get: function(elem, value) {

                    if (value) {

                        // We should always get a number back from opacity
                        var ret = curCSS(elem, 'opacity');
                        return ret === '' ? '1' : ret;
                    }
                }
            }
        }
    };

// Expose

var cssHook = hAzzle.cssHooks = cssCore.hooks;

hAzzle.cssCore = cssCore;
hAzzle.unitless = cssCore.unitless;
hAzzle.cssProperties = cssProperties;
hAzzle.cssSupport = cssCore.support;
hAzzle.cssProps = cssCore.cssProps;

hAzzle.extend({

    css: function(name, value) {

        return hAzzle.setter(this, function(elem, name, value) {
            var map = {},
                i = 0;

            if (hAzzle.isArray(name)) {

                i = name.length;

                while (i--) {

                    map[name[i]] = getCSS(elem, name[i], false);
                }

                return map;
            }

            return value !== undefined ?
                setCSS(elem, name, value) :
                getCSS(elem, name);
        }, name, value, arguments.length > 1);
    }
});

hAzzle.isZeroValue = function(value) {

    // The browser defaults CSS values that have not been set to either 0 or 
    // one of several possible null-value strings. Thus, we check for both falsiness and these special strings. 
    // Note: Chrome returns 'rgba(0, 0, 0, 0)' for an undefined color whereas IE returns 'transparent'.
    return (value === 0 || cssCore.regEx.zerovalue.test(value));
};

hAzzle.prefixCheck = function(prop) {

    // If this property has already been checked, return the cached value.

    if (prefixMatches[prop]) {

        return [prefixMatches[prop], true];

    } else {

        var vendors = ['', 'Webkit', 'Moz', 'ms', 'O'],
            i = 0,
            vendorsLength = vendors.length,
            propPrefixed;

        for (; i < vendorsLength; i++) {

            if (i === 0) {

                propPrefixed = prop;

            } else {

                // Capitalize the first letter of the property to conform to JavaScript vendor 
                //prefix notation (e.g. webkitFilter). 

                propPrefixed = vendors[i] + prop.replace(/^\w/, function(match) {
                    return match.toUpperCase();
                });
            }

            // Check if the browser supports this property as prefixed.

            if (typeof prefixElement.style[propPrefixed] === 'string') {

                // Cache the match.

                prefixMatches[prop] = propPrefixed;

                return [propPrefixed, true];
            }
        }

        // If the browser doesn't support this property in any form, include a 
        // false flag so that the caller can decide how to proceed.

        return [prop, false];
    }
};

hAzzle.getDisplayType = function(element) {
    var tagName = element.tagName.toString().toLowerCase();
    if (cssCore.regEx.inlineregex.test(tagName)) {
        return 'inline';
    } else if (cssCore.regEx.listitemregex.test(tagName)) {
        return 'list-item';
    } else if (cssCore.regEx.tablerowregex.test(tagName)) {
        return 'table-row';
        // Default to 'block' when no match is found.
    } else {
        return 'block';
    }
};

// The names in this two functions are kept due to compability
// with the jQuery API.

var getCSS = hAzzle.css = function(elem, prop, extra, force) {

    var value, num;

    if (cssHook[prop]) {
        value = cssHook[prop].get(elem, prop);
    }

    if (!cssCore.regEx.gCSSVal.test(value)) {

        // SVG elements

        if (hAzzle.data(elem) && hAzzle.data(elem).isSVG && hAzzle.SVGAttribute(prop)) {

            if (cssCore.regEx.cHeightWidth.test(prop)) {
                value = elem.getBBox()[prop];
            } else {
                value = elem.getAttribute(prop);
            }
        } else {
            value = curCSS(elem, prop, null, force);
        }
    }

    if (extra === '' || extra) {
        num = parseFloat(value);
        return extra === true || hAzzle.isNumeric(num) ? num || 0 : value;
    }

    return value;
};

var setCSS = hAzzle.style = function(elem, prop, value, animate) {

    // Don't set styles on text and comment nodes
    if (elem.nodeType === 3 || elem.nodeType === 8 || !elem) {
        return;
    }

    var type, ret, oldValue;

    if (value !== undefined) {
        // Check for 'cssHook'

        if (cssHook[prop]) {
            value = cssHook[prop].set(elem, prop, value);
            prop = cssHook[prop].name;

        } else { // Only 'camelize' if no hook exist
            prop = hAzzle.camelize(prop);
        }

        // Assign the appropriate vendor prefix before perform an official style update.

        prop = hAzzle.prefixCheck(prop)[0];

        // If animation - no need to set / get relative values and other
        // things that kills the performance

        if (!animate) {

            type = typeof value;

            // Convert relative number strings

            if (type === 'string' && (ret = cssCore.regEx.numbs.exec(value))) {
                value = hAzzle.css(elem, name, '');
                value = hAzzle.units(value, ret[3], elem, name) + (ret[1] + 1) * ret[2];
                type = 'number';
            }

            // Make sure that null and NaN values aren't set.

            if (value === null || value !== value) {

                return;
            }

            // If a number was passed in, add 'px' to the number (except for certain CSS properties)

            if (type === 'number' && !hAzzle.unitless[name]) {

                value += ret && ret[3] ? ret[3] : 'px';
            }

            if (hAzzle.cssCore.has['bug-clearCloneStyle'] &&
                value === '' && name.indexOf('background') === 0) {

                elem.style[hAzzle.camelize(name)] = 'inherit';
            }

            oldValue = elem.style[name];
            elem.style[name] = value;

            // Revert to the old value if the browser didn't accept the new rule to
            // not break the cascade.

            if (value && !elem.style[name]) {
                elem.style[name] = oldValue;
            }
        }

        if (hAzzle.data(elem) && hAzzle.data(elem).isSVG && hAzzle.SVGAttribute(prop)) {

            // Note: For SVG attributes, vendor-prefixed property names are never used

            elem.setAttribute(prop, value);

        } else {
            elem.style[prop] = value;
        }

    } else {

        // If a hook was provided get the non-computed value from there

        if (cssHook[prop]) {
            return cssHook[prop].get(elem, prop);
        }

        // Otherwise just get the value from the style object
        return elem.style[prop];
    }
};

/* ============================ FEATURE / BUG DETECTION =========================== */

// Check for getComputedStyle support

cssCore.has['api-gCS'] = !!document.defaultView.getComputedStyle;

// Bug detection

hAzzle.assert(function(div) {

    var pixelPositionVal, boxSizingReliableVal;

    div.style.backgroundClip = 'content-box';
    div.cloneNode(true).style.backgroundClip = '';

    cssCore.has['bug-clearCloneStyle'] = div.style.backgroundClip === 'content-box';

    if (cssCore.has['api-gCS']) {

        div.style.cssText = 'border:1px;padding:1px;width:4px;position:absolute';
        var divStyle = window.getComputedStyle(div, null);

        cssCore.has['api-boxSizing'] = divStyle.boxSizing === 'border-box';

        pixelPositionVal = divStyle.top !== '1%';
        boxSizingReliableVal = divStyle.width === '4px';
        cssCore.has['api-pixelPosition'] = pixelPositionVal;
        cssCore.has['api-boxSizingReliable'] = boxSizingReliableVal;
    }
});

hAzzle.assert(function(div) {

    var support = {};

    // Helper function to get the proper vendor property name.
    // (`transition` => `WebkitTransition`)
    function getVendorPropertyName(prop) {
        // Handle unprefixed versions (FF16+, for example)
        if (prop in div.style) return prop;

        var prefixes = ['Moz', 'Webkit', 'O', 'ms'],
            vendorProp, i = prefixes.length,
            prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

        while (i--) {
            vendorProp = prefixes[i] + prop_;
            if (vendorProp in div.style) {
                return vendorProp;
            }
        }
    }

    // Helper function to check if transform3D is supported.
    // Should return true for Webkits and Firefox 10+.

    function checkTransform3dSupport() {
        div.style[support.transform] = '';
        div.style[support.transform] = 'rotateY(90deg)';
        return div.style[support.transform] !== '';
    }

    // Check for the browser's transitions support.
    support.transition = getVendorPropertyName('transition');
    support.transitionDelay = getVendorPropertyName('transitionDelay');
    support.transform = getVendorPropertyName('transform');
    support.transformOrigin = getVendorPropertyName('transformOrigin');
    support.filter = getVendorPropertyName('Filter');
    support.transform3d = checkTransform3dSupport();

    // Detect the 'transitionend' event needed.
    var key;

    for (key in support) {
        if (support.hasOwnProperty(key) && typeof cssCore[key] === 'undefined') {
            hAzzle.cssSupport[key] = support[key];
        }
    }

    // Detect support for other CSS properties

    while (i--) {
        if (getVendorPropertyName(cssProperties[i])) {
            hAzzle.cssSupport[cssProperties[i]] = getVendorPropertyName(cssProperties[i]);
        }
    }
});

// BackgroundPosition

hAzzle.assert(function(div) {

    div.style.backgroundPosition = '3px 5px';
    hAzzle.cssSupport.backgroundPosition = hAzzle.curCSS(div, 'backgroundPosition') === '3px 5px' ? true : false;
    hAzzle.cssSupport.backgroundPositionXY = hAzzle.curCSS('backgroundPositionX') === '3px' ? true : false;
});

// Check if support translate3d

hAzzle.assert(function(div) {

    var has3d, t, transforms = {
        'webkitTransform': '-webkit-transform',
        'OTransform': '-o-transform',
        'msTransform': '-ms-transform',
        'MozTransform': '-moz-transform',
        'transform': 'transform'
    };

    for (t in transforms) {

        if (div.style[t] !== undefined) {
            div.style[t] = 'translate3d(1px,1px,1px)';
            has3d = window.getComputedStyle(div).getPropertyValue(transforms[t]);
        }
    }
    hAzzle.cssSupport.translate3d = (has3d !== undefined && has3d.length > 0 && has3d !== 'none');
});

hAzzle.cssProps.transform = hAzzle.cssCore.transform;
hAzzle.cssProps.transformOrigin = hAzzle.cssCore.transformOrigin;

// Populate the unitless properties list

hAzzle.each(('zoom box-flex columns counter-reset volume stress overflow flex-grow ' +
    'column-count flex-shrink flex-height order orphans widows rotate3d flipped ' +
    'transform ms-flex-order transform-origin perspective transform-style ' +
    'ms-flex-negative ms-flex-positive transform-origin perspective ' +
    'perspective-origin backface-visibility scale scale-x scale-y scale-z ' +
    'scale3d reflect-x-y reflect-z reflect-y reflect ' +
    'alpha z-index font-weight opacity red green blue').split(' '), function(name) {
    hAzzle.unitless[hAzzle.camelize(name)] = true;
});