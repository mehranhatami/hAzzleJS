var
    numbs = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i,
    topBottomRegEx = /Top|Bottom/,
    absoluteRegex = /absolute|fixed/,
    autoRegex = /auto/g,
    rotskew = /^(rotate|skew)/i,
    zerovalue = /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i,
    leftrightRegex = /Left|Right/,


    // Create a cached element for re-use when checking for CSS property prefixes.

    prefixElement = document.createElement('div'),

    prefixMatches = {},

    // Don't set styles on text and comment nodes

    excludedProps = [
        'zoom',
        'box-flex',
        'columns',
        'counter-reset',
        'volume',
        'stress',
        'overflow',
        'flex-grow',
        'column-count',
        'flex-shrink',
        'order',
        'orphans',
        'widows',
        'rotate3d',
        'flipped',
        'transform',
        'transform-origin',
        'transform-style',
        'perspective',
        'perspective-origin',
        'backface-visibility'
    ],

    // CSS Normal Transforms

    cssNormalTransform = {

        letterSpacing: '0',
        fontWeight: '400'
    };


hAzzle.extend({

    /**
     * Set / get CSS style
     *
     * @param {Object|string} property
     * @param {string} value
     * @return {hAzzle|string}
     */

    css: function(name, value) {

        return hAzzle.setter(this, function(elem, name, value) {
            var map = {},
                i = 0;

            if (hAzzle.isArray(name)) {

                i = name.length;

                while (i--) {

                    map[name[i]] = hAzzle.css(elem, name[i], false);
                }

                return map;
            }

            return value !== undefined ?
                hAzzle.style(elem, name, value) :
                hAzzle.css(elem, name);
        }, name, value, arguments.length > 1);
    }
});

hAzzle.extend({

    unitless: {},

    cssHooks: {

        opacity: {

            get: function(elem, computed) {

                if (computed) {
                    // We should always get a number back from opacity
                    var ret = curCSS(elem, 'opacity');
                    return ret === '' ? '1' : ret;
                }
            }
        }
    },

    getUnitType: function(prop) {

        if (rotskew.test(prop)) {

            return 'deg';

        } else if (hAzzle.inArray(excludedProps, prop) >= 0) {

            // Unitless properties
            return '';

        } else {

            // Return px as default
            return 'px';
        }
    },

    isZeroValue: function(value) {

        // The browser defaults CSS values that have not been set to either 0 or 
        // one of several possible null-value strings. Thus, we check for both falsiness and these special strings. 
        // Note: Chrome returns 'rgba(0, 0, 0, 0)' for an undefined color whereas IE returns 'transparent'.
        return (value == 0 || zerovalue.test(value));
    },

    prefixCheck: function(prop) {

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
    },

    css: function(elem, name, extra, styles) {

        var val, num, hooks;

        // Create cache for new elements

        hAzzle.styleCache(elem);

        name = hAzzle.camelize(hAzzle.prefixCheck(name)[0]);

        //  Check if this is a hooked property

        hooks = hAzzle.cssHooks[name];

        // If a hook was provided get the computed value from there

        if (hooks && 'get' in hooks) {
            val = hooks.get(elem, true, extra);
        }

        // Otherwise, if a way to get the computed value exists, use that

        if (val === undefined) {

            val = hAzzle.curCSS(elem, name, styles);
        }

        // Convert 'normal' to computed value

        if (val === 'normal' && name in cssNormalTransform) {
            val = cssNormalTransform[name];
        }

        // Convert the ''|'auto' values in a correct pixel value (for IE and Firefox)
        if (extra !== 'auto' && /^margin/.test(name) && /^$|auto/.test(val)) {

            val = calculateCorrect(elem, name, val);

        }
        // Make numeric if forced or a qualifier was provided and val looks numeric

        if (extra === '' || extra) {
            num = parseFloat(val);
            return extra === true || hAzzle.isNumeric(num) ? num || 0 : val;
        }

        return val;
    },

    style: function(elem, name, value, extra) {

        if (!elem) {
            return;
        }

        var ret, type, hooks, origName,
            style, nType = elem.nodeType;

        // Don't set styles on text and comment nodes
        if (nType === 3 || nType === 8 || !elem.style) {
            return;
        }

        // Create cache for new elements

        hAzzle.styleCache(elem);

        origName = hAzzle.camelize(name);

        style = elem.style;

        // Auto-add vendor prefix if needed. 

        name = hAzzle.prefixCheck(origName)[0];

        // Gets hook

        hooks = hAzzle.cssHooks[name];

        if (value !== undefined) {

            type = typeof value;

            // convert relative number strings

            if (type === 'string' && (ret = numbs.exec(value))) {
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

            if (hAzzle.cssCore.has['bug-clearCloneStyle'] && value === '' && name.indexOf('background') === 0) {

                style[hAzzle.camelize(name)] = 'inherit';
            }

            // If a hook was provided, use that value, otherwise just set the specified value

            if (!hooks || !('set' in hooks) || (value = hooks.set(elem, value)) !== undefined) {

                style[name] = value;
            }

        } else {

            // If a hook was provided get the non-computed value from there

            if (hooks && 'get' in hooks &&
                (ret = hooks.get(elem, false, extra)) !== undefined) {

                return ret;
            }

            // Otherwise just get the value from the style object
            return style[name];
        }

    }
}, hAzzle);

/* ============================ UTILITY METHODS =========================== */

/**
 * Detect correct margin properties for IE9 and Firefox
 *
 * @param {Object} elem
 * @param {String} val
 * @param {String} name
 * @param {Object}
 */


function calculateCorrect(elem, name, val) {

    var mTop, mRight, mBottom, mLeft;

    if (topBottomRegEx.test(name)) {
        val = '0px';
    } else if (val !== '' && absoluteRegex.test(hAzzle.css(elem, 'position'))) {
        val = val.replace(autoRegex, '0px');
    } else if (leftrightRegex.test(name)) {
        mTop = hAzzle.css(elem, name === 'marginLeft' ? 'marginRight' : 'marginLeft', 'auto');
        val = hAzzle.css(elem.parentNode, 'width', '') - hAzzle(elem).outerWidth();
        val = (mTop === 'auto' ? parseInt(val / 2) : val - mTop) + 'px';
    } else {
        val =
            mTop = hAzzle.css(elem, 'marginTop');
        mRight = hAzzle.css(elem, 'marginRight');
        mBottom = hAzzle.css(elem, 'marginBottom');
        mLeft = hAzzle.css(elem, 'marginLeft');
        if (mLeft !== mRight) {
            val += ' ' + mRight + ' ' + mBottom + ' ' + mLeft;
        } else if (mTop !== mBottom) {
            val += ' ' + mLeft + ' ' + mBottom;
        } else if (mTop !== mLeft) {
            val += ' ' + mLeft;
        }
    }
    return val;
}



// Populate the unitless list

hAzzle.each(excludedProps, function(name) {
    hAzzle.unitless[hAzzle.camelize(name)] = true;
});