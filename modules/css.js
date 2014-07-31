var
    numbs = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i,
    topBottomRegEx = /Top|Bottom/,
    absoluteRegex = /absolute|fixed/,
    autoRegex = /auto/g,
    leftrightRegex = /Left|Right/,

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

    stylePrefixes = ['', 'Moz', 'Webkit', 'O', 'ms', 'Khtml'],

    /**
     * CSS Normal Transforms
     */

    cssNormalTransform = {

        letterSpacing: '0',
        fontWeight: '400'
    };

var computeStyle = hAzzle.computeStyle = function(elem) {
    var view = elem.ownerDocument.defaultView;
    return hAzzle.ComputedStyle ? (view.opener ? view.getComputedStyle(elem, null) :
        window.getComputedStyle(elem, null)) : elem.style;
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

        return hAzzle.setter( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( hAzzle.isArray( name ) ) {
				styles = computeStyle( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = hAzzle.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				hAzzle.style( elem, name, value ) :
				hAzzle.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
});

hAzzle.extend({

    cssProps: {

        'float': 'cssFloat'
    },

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

    css: function(elem, name, extra, styles) {

        var val, num, hooks,
            origName = hAzzle.camelize(name);

        // Make sure that we're working with the right name
        name = hAzzle.cssProps[origName] || (hAzzle.cssProps[origName] = vendorPropName(elem.style, origName));

        // gets hook for the prefixed version
        // followed by the unprefixed version
        hooks = hAzzle.cssHooks[name];

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

        var ret, type, hooks, origName,
            style, nType = elem.nodeType;


        // Don't set styles on text and comment nodes
        if (!elem || nType === 3 || nType === 8 || !elem.style) {
            return;
        }
        origName = hAzzle.camelize(name);
        style = elem.style;
        // Make sure that we're working with the right name

        name = hAzzle.cssProps[origName] ||
            (hAzzle.cssProps[origName] = vendorPropName(style, origName));

        // Gets hook for the prefixed version, then unprefixed version
        hooks = hAzzle.cssHooks[name] || hAzzle.cssHooks[origName];

        if (value !== undefined) {
            type = typeof value;
            // convert relative number strings

            if (type === 'string' && (ret = numbs.exec(value))) {
				value = hAzzle.css( elem, name, "" );
				value = hAzzle.units( value, ret[3], elem, name ) + ( ret[1] + 1 ) * ret[2];
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

            if (hAzzle.cssSupport.clearCloneStyle && value === '' && name.indexOf('background') === 0) {

                style[hAzzle.camelize(name)] = 'inherit';
            }

            // If a hook was provided, use that value, otherwise just set the specified value

            if (!hooks || !('set' in hooks) || (value = hooks.set(elem, value)) !== undefined) {
                style[name] = value;
            }

        } else {

            // If a hook was provided get the non-computed value from there
            if (hooks && "get" in hooks &&
                (ret = hooks.get(elem, false, extra)) !== undefined) {

                return ret;
            }

            // Otherwise just get the value from the style object
            return style[name];
        }


    }

}, hAzzle);




/* =========================== PRIVATE FUNCTIONS ========================== */

var curCSS = hAzzle.curCSS = function(elem, prop, computed) {

    var ret;


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



// Populate the unitless list

hAzzle.each(excludedProps, function(name) {
    hAzzle.unitless[hAzzle.camelize(name)] = true;
});