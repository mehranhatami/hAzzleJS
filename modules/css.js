/*!
 * CSS
 */
var docElem = hAzzle.docElem,
    numbs = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i,

    cssCore = {

        directions: ['Top', 'Right', 'Bottom', 'Left'],

        stylePrefixes: ['', 'Moz', 'Webkit', 'O', 'ms', 'Khtml'],

        cssNT: {

            letterSpacing: '0',
            fontWeight: '400'
        },

        has: {

            'api-gCS': !!document.defaultView.getComputedStyle
        }
    },

    getStyles = function (elem) {
        var view = elem.ownerDocument.defaultView;
        return cssCore.has['api-gCS'] ? (view.opener ? view.getComputedStyle(elem, null) :
            window.getComputedStyle(elem, null)) : elem.style;
    };

// Bug detection

hAzzle.assert(function (div) {
    cssCore.has['bug-clearCloneStyle'] = div.style.backgroundClip === "content-box";
});

// Extend the hAzzle Core
hAzzle.extend({

    /**
     * Set / get CSS style
     *
     * @param {Object|string} property
     * @param {string} value
     * @return {hAzzle|string}
     */

    css: function (prop, value) {

        var type = typeof prop,
            i = 0,
            key, l = this.length,
            obj = type === 'string' ? {} : prop,
            el = this[0];

        if (hAzzle.isArray(prop)) {
            var map = {},
                styles = getStyles(el),
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

    /**
     * @param {number=} x
     * @param {number=} y
     * @return {hAzzle|number}
     */

    offset: function (options) {
        if (arguments.length) {
            return options === undefined ?
                this :
                this.each(function (el, i) {
                    xy(el, options, i);
                });
        }

        var el = this[0],
            d = el && el.ownerDocument,
            w = getWindow(d),

            // getBoundingClientRect() are supported from IE9, and all the 
            // other major browsers hAzzle are supposed to support

            bcr = el.getBoundingClientRect();

        // If current element don't exist in the document
        // root, return empty object

        if (!hAzzle.contains(docElem, el)) {

            return {
                top: 0,
                left: 0
            };
        }

        // Return all angeles of the 'offset'

        return {
            top: bcr.top + w.pageYOffset - docElem.clientTop,
            left: bcr.left + w.pageXOffset - docElem.clientLeft,
            right: bcr.right + w.pageXOffset - docElem.clientLeft,
            bottom: bcr.bottom + w.pageYOffset - docElem.clientTop,
            height: bcr.bottom - bcr.top,
            width: bcr.right - bcr.left
        };
    },

    offsetParent: function () {
        return hAzzle(this.map(function (el) {
            var offsetParent = el.offsetParent || docElem;
            if (offsetParent) {
                while ((!hAzzle.nodeName(offsetParent, 'html') && hAzzle.css(offsetParent, 'position') === 'static')) {
                    offsetParent = offsetParent.offsetParent || docElem;
                }
            }
            return offsetParent;
        }));
    },

    position: function () {

        if (this[0]) {


            var offsetParent, offset,
                parentOffset = {
                    top: 0,
                    left: 0
                },
                elem = this[0];

            if (hAzzle.style(elem, 'position') === 'fixed') {

                offset = elem.getBoundingClientRect();

            } else {

                // Get *real* offsetParent

                offsetParent = this.offsetParent();

                // Get correct offsets

                offset = this.offset();

                if (!hAzzle.nodeName(offsetParent[0], 'html')) {

                    parentOffset = offsetParent.offset();
                }

                offset.top -= parseFloat(hAzzle.css(elem, 'margin-top')) || 0;
                offset.left -= parseFloat(hAzzle.css(elem, 'margin-left')) || 0;

                // Add offsetParent borders
                parentOffset.top += parseFloat(hAzzle.css(offsetParent[0], 'border-top-width')) || 0;
                parentOffset.left += parseFloat(hAzzle.css(offsetParent[0], 'border-left-width')) || 0;
            }
            // Subtract the two offsets
            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        }
        return null;
    }
});

// Go globale!

hAzzle.extend({

    // Properties that shouldn't have units behind 

    unitless: {},

    cssHooks: {

        opacity: {
            get: function (el, computed) {

                if (computed) {
                    var ret = curCSS(el, 'opacity');
                    return ret === '' ? '1' : ret;
                }
            }
        }
    },

    cssProps: {

        'float': 'cssFloat'
    },

    /**
     * Set css properties
     *
     * @param {Object} elem
     * @param {String|Object} name
     * @param {String} value
     * @return {String|hAzzle}
     */

    style: function (elem, name, value) {

        // Check if we're setting a value

        if (value !== undefined) {

            if (elem && (elem.nodeType !== 3 || elem.nodeType !== 8)) {

                var type = typeof value,
                    p, hooks, ret, style = elem.style;

                // Camelize the name

                p = hAzzle.camelize(name);

                name = hAzzle.cssProps[p] || (hAzzle.cssProps[p] = vendorPrefixed(style, p));

                // Props to jQuery

                hooks = hAzzle.cssHooks[name] || hAzzle.cssHooks[p];

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
                    style[p] = value;
                }
            }

        } else {

            return elem && elem.style[name];
        }
    },

    /**
     * Set CSS rules on DOM nodes
     *
     * @param {Object} elem
     * @param {String|Object} prop
     * @return {String|Object|Array}
     */

    css: function (elem, prop) {

        var val,
            hooks,
            origName = hAzzle.camelize(prop);

        // If no element, return

        if (!elem) return null;

        hooks = hAzzle.cssHooks[prop] || hAzzle.cssHooks[origName];

        // If a hook was provided get the computed value from there

        if (hooks && 'get' in hooks) {

            val = hooks.get(elem, true);
        }

        // Otherwise, if a way to get the computed value exists, use that

        if (val === undefined) {

            val = curCSS(elem, prop);
        }

        //convert 'normal' to computed value

        if (val === 'normal' && prop in cssCore.cssNT) {

            val = cssCore.cssNT[prop];
        }

        return val;
    },



}, hAzzle);

/* =========================== PRIVATE FUNCTIONS ========================== */



function vendorPrefixed(style, name) {

    // shortcut for names that are not vendor prefixed
    if (name in style) {
        return name;
    }

    // check for vendor prefixed names
    var capName = name[0].toUpperCase() + name.slice(1),
        origName = name,
        i = cssCore.stylePrefixes.length;

    while (i--) {
        name = cssCore.stylePrefixes[i] + capName;
        if (name in style) {
            return name;
        }
    }

    return origName;
}



/**
 * sets an element to an explicit x/y position on the page
 * @param {Element} element
 * @param {Object/Number} options
 * @param {Number} i
 */
function xy(elem, options, i) {

    var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
        position = hAzzle.css(elem, 'position'),
        curElem = hAzzle(elem),
        props = {};

    // Set position first, in-case top/left are set even on static elem
    if (position === 'static') {
        elem.style.position = 'relative';
    }

    curOffset = curElem.offset();

    curCSSTop = hAzzle.css(elem, 'top');
    curCSSLeft = hAzzle.css(elem, 'left');
    calculatePosition = (position === 'absolute' || position === 'fixed') &&
        hAzzle.inArray((curCSSTop + curCSSLeft), 'auto') > -1;

    // Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
    if (calculatePosition) {
        curPosition = curElem.position();
        curTop = curPosition.top;
        curLeft = curPosition.left;



    } else {
        curTop = parseFloat(curCSSTop) || 0;
        curLeft = parseFloat(curCSSLeft) || 0;
    }

    if (hAzzle.isFunction(options)) {
        options = options.call(elem, i, curOffset);
    }

    if (options.top !== null) {
        props.top = (options.top - curOffset.top) + curTop;
    }
    if (options.left !== null) {
        props.left = (options.left - curOffset.left) + curLeft;
    }

    if ('using' in options) {
        options.using.call(elem, props);

    } else {
        curElem.css(props);
    }
}

/**
 * Gets a window from an element
 */

function getWindow(elem) {
    return hAzzle.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
}

function curCSS(elem, prop, computed) {
    var ret;

    computed = computed || getStyles(elem);

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

/* =========================== INTERNAL ========================== */

// scrollTop and scrollLeft functions

hAzzle.forOwn({
    scrollLeft: 'pageXOffset',
    scrollTop: 'pageYOffset'
}, function (prop, method) {

    var top = 'pageYOffset' === prop;

    hAzzle.Core[method] = function (val) {

        var i = 0,
            len = this.len || 1,
            elem, win;

        for (; i < len; i++) {

            elem = this[i];

            if (hAzzle.isWindow(elem)) {

                win = elem;

            } else {

                if (elem.nodeType === 9) {

                    win = elem.defaultView;
                }
            }

            if (val === undefined) {

                return win ? win[prop] : elem[method];
            }

            if (win) {


                win.scrollTo(!top ? val : window.pageXOffset,
                    top ? val : window.pageYOffset
                );

            } else {

                elem[method] = val;

            }
        }
    };
});

// Margin and padding cssHooks

hAzzle.each(['margin', 'padding'], function (hook) {
    hAzzle.cssHooks[hook] = {
        get: function (elem) {
            return hAzzle.map(cssCore.directions, function (dir) {
                return hAzzle.css(elem, hook + dir);
            }).join(' ');
        },
        set: function (elem, value) {
            var parts = value.split(/\s/),
                values = {
                    'Top': parts[0],
                    'Right': parts[1] || parts[0],
                    'Bottom': parts[2] || parts[0],
                    'Left': parts[3] || parts[1] || parts[0]
                };
            hAzzle.each(cssCore.directions, function (dir) {
                elem.style[hook + dir] = values[dir];
            });
        }
    };
});

/**
 * Width and height
 */

hAzzle.each(['width', 'height'], function (name) {

    var dimensionProperty =
        name.replace(/./, function (m) {
            return m[0].toUpperCase();
        });

    hAzzle.Core[name] = function (value) {

        var elem = this[0],
            _doc = elem.documentElement;

        if (!elem) {

            return '';
        }

        if (getWindow(elem)) {

            return _doc['client' + dimensionProperty];
        }

        // Get document width or height
        if (elem.nodeType === 9) {
            return Math.max(
                elem.body['scroll' + dimensionProperty], _doc['scroll' + dimensionProperty],
                elem.body['client' + dimensionProperty], _doc['client' + dimensionProperty],
                _doc['client' + dimensionProperty]
            );
        }

        // Get width or height on the element
        if (value === undefined) {

            return parseFloat(hAzzle.css(elem, name));
        }

        // Set the width or height on the element

        hAzzle(elem).css(name, value);
    };
});

// Unitless properties

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
    function (name) {
        hAzzle.unitless[name] = true;
    });