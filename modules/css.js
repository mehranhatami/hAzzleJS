var docElem = hAzzle.docElem,

    numbs = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i,
    topBottomRegEx = /Top|Bottom/,
    absoluteRegex = /absolute|fixed/,
    autoRegex = /auto/g,
    leftrightRegex = /Left|Right/,

    stylePrefixes = ['', 'Moz', 'Webkit', 'O', 'ms', 'Khtml'],

    /**
     * CSS Normal Transforms
     */

    cssNormalTransform = {

        letterSpacing: '0',
        fontWeight: '400'
    },

    reDash = /\-./g,

    directions = ["Top", "Right", "Bottom", "Left"],

    cssCore = {

        // Feature / bug detection

        has: {

            // Check for getComputedStyle support

            'api-gCS': !!document.defaultView.getComputedStyle
        }
    };

/* ============================ FEATURE / BUG DETECTION =========================== */

/**
 * Quick function for adding supported CSS properties
 * to the 'cssCore'
 *
 * @param {String} name
 * @param {String} value
 *
 */

hAzzle.applyCSSSupport = function(name, value) {

    cssCore.has[name] = value;

    // Expost to the global hAzzle object

    hAzzle[name] = cssCore.has[name];
};

// Expose to the global hAzzle Object

hAzzle.transition = cssCore.has.transition;

// Bug detection

hAzzle.assert(function(div) {

    // Support: IE9-11+

    cssCore.has['bug-clearCloneStyle'] = div.style.backgroundClip === 'content-box';

    var pixelPositionVal, boxSizingReliableVal,
        container = document.createElement('div');

    container.style.cssText = 'border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;' +
        'position:absolute';

    container.appendChild(div);

    function computePixelPositionAndBoxSizingReliable() {
        div.style.cssText =
            // Support: Firefox<29, Android 2.3
            // Vendor-prefix box-sizing
            '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;' +
            'box-sizing:border-box;display:block;margin-top:1%;top:1%;' +
            'border:1px;padding:1px;width:4px;position:absolute';
        div.innerHTML = '';
        docElem.appendChild(container);

        var divStyle = window.getComputedStyle(div, null);
        pixelPositionVal = divStyle.top !== '1%';
        boxSizingReliableVal = divStyle.width === '4px';

        docElem.removeChild(container);
    }

    // Check if we support getComputedStyle

    if (cssCore.has['api-gCS']) {

        cssCore.has['api-pixelPosition'] = (function() {
            computePixelPositionAndBoxSizingReliable();
            return pixelPositionVal;
        })();

        cssCore.has['api-boxSizingReliable'] = (function() {
            if (boxSizingReliableVal === null) {
                computePixelPositionAndBoxSizingReliable();
            }
            return boxSizingReliableVal;
        })();

        cssCore.has['api-reliableMarginRight'] = (function() {
            var ret, marginDiv = div.appendChild(document.createElement('div'));
            marginDiv.style.cssText = div.style.cssText =
                '-webkit-box-sizing:content-box;-moz-box-sizing:content-box;' +
                'box-sizing:content-box;display:block;margin:0;border:0;padding:0';
            marginDiv.style.marginRight = marginDiv.style.width = '0';
            div.style.width = '1px';
            docElem.appendChild(container);
            ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);
            docElem.removeChild(container);
            return ret;
        })();
    }
});

// Expose to the global hAzzle Object

hAzzle.clearCloneStyle = cssCore.has['bug-clearCloneStyle'];
hAzzle.pixelPosition = cssCore.has['api-pixelPosition'];
hAzzle.boxSizingReliable = cssCore.has['api-boxSizingReliable'];
hAzzle.reliableMarginRight = cssCore.has['api-reliableMarginRight'];



hAzzle.extend({

    cssHooks: {


    },

    /**
     * Set / get CSS style
     *
     * @param {Object|string} property
     * @param {string} value
     * @return {hAzzle|string}
     */

    css: function(prop, value) {

        var type = typeof prop,
            i = 0,
            key, l = this.length,
            obj = type === 'string' ? {} : prop,
            el = this[0];

        if (hAzzle.isArray(prop)) {
            var map = {},
                styles = computeStyle(el),
                len = prop.length;
            i = 0;
            for (; i < len; i++) {

                map[prop[i]] = curCSS(el, prop[i], styles);
            }
            return map;
        }

        // Both values set, get CSS value

        if (typeof value === 'undefined' && type === 'string') {

            return hAzzle.css(el, prop);
        }

        if (type === 'string') {
            obj[prop] = value;
        }

        for (; i < l; i++) {

            for (key in obj) {

                hAzzle.style(this[i], key, obj[key]);
            }
        }
        return this;
    },
});

hAzzle.extend({


    // Properties that shouldn't have units behind 

    unitless: {},

    cssHooks: {

        opacity: {
            get: function(elem, computed) {

                if (computed) {

                    var opacity = elem.style.opacity ||
                        curCSS(elem, 'opacity');

                    return (opacity === '') ? 1 : opacity.toFloat();
                }
            },
            set: function(el, value) {

                if (typeof value !== 'number') {

                    value = 1;
                }

                if (value == 1 || value === '') {

                    value = '';

                } else if (value < 0.00001) {

                    value = 0;
                }

                el.style.opacity = value;


            }
        }
    },

    cssProps: {

        'float': 'cssFloat'
    },

    css: function(elem, name, extra, styles) {

        var val, num, hooks,
            origName, hook,
            style = elem.style;

        // No extra, no styles
        /*   
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
	 */
        // Prefixed

        origName = hAzzle.camelize(name)

        // Make sure that we're working with the right name

        name = hAzzle.cssProps[origName] ||
            (hAzzle.cssProps[origName] = vendorPropName(style, origName));

        // gets hook for the prefixed version
        // followed by the unprefixed version
        hooks = hAzzle.cssHooks[name] ||
            hAzzle.cssHooks[origName];

        // If a hook was provided get the computed value from there
        if (hooks && 'get' in hooks) {
            val = hooks.get(elem, true, extra);
        }

        // Otherwise, if a way to get the computed value exists, use that
        if (val === undefined) {
            val = curCSS(elem, name, styles);
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

        // Don't set styles on text and comment nodes

        if (!elem || elem.nodeType === 3 ||
            elem.nodeType === 8 ||
            !elem.style) {

            return;
        }

        // Make sure that we're working with the right name

        var hooks,
            style = elem.style;

        if (value !== undefined) {

            var ret, type,
                style, hook;

            style = elem.style;

            hook = cssStyles.get[name];

            // Check for unprefixed CSS styles

            if (name in cssStyles.set) {

                hook = cssStyles.set[name];

                hook(elem.style, value === null ? "" : value);

                return;
            }

            // camelize the name	

            name = hAzzle.camelize(name);

            name = hAzzle.cssProps[name] ||
                (hAzzle.cssProps[name] = vendorPropName(style, name));

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

                if (!cssCore.has['bug-clearCloneStyle'] && value === '' && name.indexOf('background') === 0) {

                    style[hAzzle.camelize(name)] = 'inherit';
                }

                // If a hook was provided, use that value, otherwise just set the specified value

                if (!hooks || !('set' in hooks) || (value = hooks.set(elem, value)) !== undefined) {
                    style[name] = value;
                    //  }

                } else {

                    // If a hook was provided get the non-computed value from there
                    if (hooks && 'get' in hooks &&
                        (ret = hooks.get(elem, false, extra)) !== undefined) {

                        return ret;
                    }

                    // Otherwise just get the value from the style object
                    return elem && elem.style[name];
                }
            }

        } else {

            // Camlize the name

            name = hAzzle.camelize(name);

            // Check for cssHooks

            hooks = hAzzle.cssHooks[name];

            // If a hook was provided get the non-computed value from there
            var ret;
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
}

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



/* =========================== INTERNAL ========================== */

// Populate the unitless list

hAzzle.each(['lineHeight', 'zoom', 'zIndex', 'opacity', 'boxFlex',
        'WebkitBoxFlex', 'MozBoxFlex',
        'columns', 'counterReset', 'counterIncrement',
        'fontWeight', 'float', 'volume', 'stress',
        'overflow', 'fillOpacity',
        'flexGrow', 'columnCount',
        'flexShrink', 'order',
        'orphans', 'widows',
        'transform', 'transformOrigin',
        'transformStyle', 'perspective',
        'perspectiveOrigin', 'backfaceVisibility'
    ],
    function(name) {
        hAzzle.unitless[name] = true;
    });