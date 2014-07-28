var
    numbs = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i,
    topBottomRegEx = /Top|Bottom/,
    absoluteRegex = /absolute|fixed/,
    autoRegex = /auto/g,
    leftrightRegex = /Left|Right/,

    // Don't set styles on text and comment nodes

    valid = [3, 8],

    computeStyle = hAzzle.computeStyle,
    cssStyles = hAzzle.cssStyles,
    stylePrefixes = ['', 'Moz', 'Webkit', 'O', 'ms', 'Khtml'],

    /**
     * CSS Normal Transforms
     */

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
            var styles, len,
                map = {},
                i = 0;

            if (hAzzle.isArray(name)) {
                styles = getStyles(elem);
                len = name.length;

                for (; i < len; i++) {
                    map[name[i]] = hAzzle.css(elem, name[i], false, styles);
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

    getStyle: function(elem, value) {

        var hook, computed, style = elem.style;

        if (arguments.length === 2 &&
            (hook = cssStyles.get[name])) {

            value = hook ? hook(style) : style[name];
            if (!computed && !value) {
                style = computeStyle(elem);
                value = hook ? hook(style) : style[name];

                computed = true;
            }

            return value;
        }
    },

    css: function(elem, name, extra, styles) {

        var val, num, hooks,
            origName = hAzzle.camelize(name);

        // Make sure that we're working with the right name
        name = hAzzle.cssProps[origName] || (hAzzle.cssProps[origName] = vendorPropName(elem.style, origName));

        // gets hook for the prefixed version
        // followed by the unprefixed version
        hooks = cssHooks[name];

        // If a hook was provided get the computed value from there
        if (hooks && "get" in hooks) {
            val = hooks.get(elem, true, extra);
        }

        // Otherwise, if a way to get the computed value exists, use that
        if (val === undefined) {
            val = curCSS(elem, name, styles);
        }

        // Convert "normal" to computed value
        if (val === "normal" && name in cssNormalTransform) {
            val = cssNormalTransform[name];
        }

        // Convert the ""|"auto" values in a correct pixel value (for IE and Firefox)
        if (extra !== "auto" && /^margin/.test(name) && /^$|auto/.test(val)) {

            val = calculateCorrect(elem, name, val);

        }
        // Make numeric if forced or a qualifier was provided and val looks numeric

        if (extra === "" || extra) {
            num = parseFloat(val);
            return extra === true || hAzzle.isNumeric(num) ? num || 0 : val;
        }

        return val;
    },


    style: function(elem, name, value, extra) {

        var ret, type, nType = elem.nodeType,
            hooks, style;

        if (!elem || !valid[nType] ||
            !elem.style) {

            return;
        }

        // Make sure that we're working with the right name

        style = elem.style;

        if (value !== undefined) {

            var hook;

            hook = cssStyles.get[name];

            // Check for unprefixed CSS styles

            if (name in cssStyles.set) {

                hook = cssStyles.set[name];

                hook(elem.style, value === null ? "" : value);

                return;
            }

            name = hAzzle.camelize(name) ;
			name = hAzzle.cssProps[name] || (hAzzle.cssProps[name] = vendorPropName(style, name));

            // Check if we're setting a value

            if (value !== undefined) {

                // convert relative number strings

                if (type === 'string' && (ret = numbs.exec(value))) {

                    value = hAzzle.units(parseFloat(hAzzle.css(elem, name)), ret[3], elem, name) + (ret[1] + 1) * ret[2];
                    type = 'number';
                }

                // Make sure that null and NaN values aren't set.

                if (value === null || value !== value) {

                    return;
                }

                // If a number was passed in, add 'px' to the (except for certain CSS properties)

                if (type === 'number' && !hAzzle.unitless[name]) {

                    value += ret && ret[3] ? ret[3] : 'px';
                }

                if (hAzzle.clearCloneStyle && value === '' && name.indexOf('background') === 0) {

                    style[hAzzle.camelize(name)] = 'inherit';
                }

                // If a hook was provided, use that value, otherwise just set the specified value

                if (!hooks || !('set' in hooks) || (value = hooks.set(elem, value)) !== undefined) {
                    style[name] = value;
                }

            }

        } else {

            // Camlize the name

            name = hAzzle.camelize(name);

            // Check for cssHooks

            hooks = cssHooks[name];

            // If a hook was provided get the non-computed value from there

            if (hooks && 'get' in hooks &&
                (ret = hooks.get(elem, false, extra)) !== undefined) {

                return ret;
            }

            // Otherwise just get the value from the style object
            return elem && elem.style[name];
        }


    }

}, hAzzle);




/* =========================== PRIVATE FUNCTIONS ========================== */


/**
 * Get current CSS style on the node. For speed performance - if unprefixed -
 * we get the value from the cssStyle without any extra checks.
 *
 * However there are pro and cons here. Native and native, so example:
 *
 *  style="background-color:rgb(15,99,30);"
 *
 * - for un-prefixed it will return the value as it is
 *
 * - if prefixed, it return "blue" in the jQuery way of doing things.
 *
 * TODO!? Change this to be equal maybe??
 */

var curCSS = hAzzle.curCSS = function(elem, prop, computed) {

    var ret, hook = cssStyles.get[prop];

    // unprefixed?

    if (hook) {

        return hook(elem.style);

        // Prefixed

    } else {

        computed = computed || computeStyle(elem);

        if (computed) {

            ret = computed.getPropertyValue(prop) || computed[prop];
        }

        if (computed && (ret === '' && !hAzzle.contains(elem.ownerDocument, elem))) {

            ret = hAzzle.style(elem, prop);
        }

        return ret !== undefined ?
            ret + '' :
            ret;
    }
};

// Return a css property mapped to a potentially vendor prefixed property

function vendorPropName(style, name) {

    // Shortcut for names that are not vendor prefixed
    if (name in style) {
        return name;
    }

    // Check for vendor prefixed names
    var capName = name[0].toUpperCase() + name.slice(1),
        origName = name,
        i = stylePrefixes.length;

    while (i--) {
        name = stylePrefixes[i] + capName;
        if (name in style) {
            return name;
        }
    }

    return origName;
}




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