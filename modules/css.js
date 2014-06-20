/*!
 * CSS
 */
var win = this,
    doc = win.document,
    docElem = hAzzle.docElem,
    numbs = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i,
    lrmp = /^(left$|right$|margin|padding)/,
    reaf = /^(relative|absolute|fixed)$/,
    topbot = /^(top|bottom)$/,
    iframe,
    directions = ['Top', 'Right', 'Bottom', 'Left'],
    elemdisplay = {},

    /**
     * Remove units ( e.g. 'pc, 'px', '%') from values
     * This is an faster alternative then parseFloat
     */

    getStyles = hAzzle.features.computedStyle ? function (el) {

        if (el) {

            if (el.ownerDocument && el.ownerDocument.defaultView.opener) {

                return el.ownerDocument.defaultView.getComputedStyle(el[0], null);
            }
        }

        return el && win.getComputedStyle(el, null);

    } : function (el) {

        /**
         * We will never reach down here unless we are using some old
         * mobile browsers. Anyways. After a few months when all
         * vendors have upgraded their browsers - I guess we
         * can remove this 'hack'
         *
         */

        return el.style || el.currentStyle;
    },

    // Has to be numbers, not strings

    cssNormalTransform = {

        letterSpacing: '0',
        fontWeight: '400'

    };

function actualDisplay(name, doc) {

    var elem = hAzzle(doc.createElement(name)).appendTo(doc.body),
        display,
        gDfCS = win.getDefaultComputedStyle,
        style = gDfCS && gDfCS(elem[0]);

    if (style) {

        display = style.display;

    } else {

        display = hAzzle.css(elem[0], 'display');
    }

    elem.detach();

    return display;
}


// Try to determine the default display value of an element
function defaultDisplay(nodeName) {

    var display = elemdisplay[nodeName];

    if (!display) {

        display = actualDisplay(nodeName, doc);

        // If the simple way fails, read from inside an iframe

        if (display === 'none' || !display) {

            // Use the already-created iframe if possible

            iframe = (iframe || doc.documentElement).appendChild('<iframe frameborder="0" width="0" height="0"/>');

            // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
            doc = iframe[0].contentDocument;

            // Support: IE
            doc.write();
            doc.close();

            display = actualDisplay(nodeName, doc);

            doc.documentElement.removeChild(iframe);
        }

        // Store the correct default display
        elemdisplay[nodeName] = display;
    }

    return display;
}

function vendorPrefixed(style, name) {

    // shortcut for names that are not vendor prefixed
    if (name in style) {
        return name;
    }

    // check for vendor prefixed names
    var capName = name[0].toUpperCase() + name.slice(1),
        origName = name,
        i = hAzzle.cssPrefixes.length;

    while (i--) {
        name = hAzzle.cssPrefixes[i] + capName;
        if (name in style) {
            return name;
        }
    }

    return origName;
}

/**
 * Check if an element is hidden
 *  @return {Boolean}
 */

function isHidden(elem, el) {
    elem = el || elem;
    return hAzzle.style(elem, 'display') === 'none' || !hAzzle.contains(elem.ownerDocument, elem);
}


/**
 * Show / Hide an elements
 *
 * @param {Object} elem
 * @param {Boolean} show
 * @return {Object}
 */

function showHide(elements, show) {
    var display, elem, hidden,
        values = [],
        index = 0,
        length = elements.length;

    for (; index < length; index++) {
        elem = elements[index];
        if (!elem.style) {
            continue;
        }

        values[index] = hAzzle.data(elem, 'olddisplay');
        display = elem.style.display;
        if (show) {
            if (!values[index] && display === 'none') {
                elem.style.display = '';
            }
            if (elem.style.display === '' && isHidden(elem)) {
                values[index] = hAzzle.data(elem, 'olddisplay', defaultDisplay(elem.nodeName));
            }
        } else {
            hidden = isHidden(elem);

            if (display !== 'none' || !hidden) {
                hAzzle.data(elem, 'olddisplay', hidden ? display : hAzzle.css(elem, 'display'));
            }
        }
    }

    // Set the display of most of the elements in a second loop
    // to avoid the constant reflow
    for (index = 0; index < length; index++) {
        elem = elements[index];
        if (!elem.style) {
            continue;
        }
        if (!show || elem.style.display === 'none' || elem.style.display === '') {
            elem.style.display = show ? values[index] || '' : 'none';
        }
    }

    return elements;
}

hAzzle.extend({

    /**
     * Set / get CSS style
     *
     * @param {Object|string} property
     * @param {string} value
     * @return {hAzzle|string}
     */

    css: function (prop, value) {

        var obj = prop, el = this[0];

        if (hAzzle.isArray(prop)) {

            var map = {},
                i = 0,
                styles = getStyles(el),
                len = prop.length;

            for (; i < len; i++) {

                map[prop[i]] = curCSS(el, prop[i], styles);
            }

            return map;
        }

        // is this a request for just getting a style?

        if (value === undefined && typeof prop === 'string') {

            return hAzzle.css(el, prop);
        }

        /**
         * If both prop and value are string values, we
         * create an object out of it, so we can iterate
         * through
         */

        if (typeof prop === 'string') {

            obj = {};
            obj[prop] = value;
        }

        // Loop through, and collect the result

        return this.each(function (el) {
            hAzzle.forOwn(obj, function (key, value) {
                hAzzle.style(el, key, value);
            });
        });
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
            bcr = {
                top: 0,
                left: 0
            };

        if (!hAzzle.contains(docElem, el)) {
            return bcr;
        }

        if (typeof el.getBoundingClientRect !== typeof undefined) {



            bcr = el.getBoundingClientRect();
        }

        // We return all angeles of the 'offset'

        return {
            top: bcr.top + win.pageYOffset - docElem.clientTop,
            left: bcr.left + win.pageXOffset - docElem.clientLeft,
            right: bcr.right + win.pageXOffset - docElem.clientLeft,
            bottom: bcr.bottom + win.pageYOffset - docElem.clientTop,
            height: bcr.bottom - bcr.top,
            width: bcr.right - bcr.left
        };
    },

    offsetParent: function () {
        return hAzzle(this.map(function (el) {
            var docElem = doc.documentElement,
                op = el.offsetParent || docElem;
            while (op && (!hAzzle.nodeName(op, 'html') && hAzzle.css(op, 'position') === 'static')) {
                op = op.offsetParent || docElem;
            }
            return op;
        }));
    },

    position: function () {

        if (!this[0]) {
            return null;
        }

        var offsetParent, offset,
            parentOffset = {
                top: 0,
                left: 0
            },
            elem = this[0];

        if (hAzzle.style(elem, 'position') === 'fixed') {

            // we assume that getBoundingClientRect is available when computed position is fixed

            offset = elem.getBoundingClientRect();

        } else {

            // Get *real* offsetParent

            offsetParent = this.offsetParent();

            // Get correct offsets

            offset = this.offset();

            if (!hAzzle.nodeName(offsetParent[0], 'html')) {
                parentOffset = offsetParent.offset();
            }

            offset.top -= parseFloat(hAzzle(elem).css('margin-top')) || 0;
            offset.left -= parseFloat(hAzzle(elem).css('margin-left')) || 0;

            // Add offsetParent borders
            parentOffset.top += parseFloat(hAzzle(offsetParent[0]).css('border-top-width')) || 0;
            parentOffset.left += parseFloat(hAzzle(offsetParent[0]).css('border-left-width')) || 0;
        }
        // Subtract the two offsets
        return {
            top: offset.top - parentOffset.top,
            left: offset.left - parentOffset.left
        };
    },

    /**
     * Show elements in collection
     *
     * @param {Number} speed
     * @param {String} easing
     * @param {Function} callback
     * @return {hAzzle}
     */

    show: function () {
        return showHide(this, true);
    },

    /**
     * Hide elements in collection
     *
     * @param {Number} speed
     * @param {String} easing
     * @param {Function} callback
     * @return {hAzzle}
     */

    hide: function () {
        return showHide(this);
    },

    /**
     * Toggle show/hide.
     * @return {Object}
     */

    toggle: function (state) {

        if (typeof state === 'boolean') {
            return state ? this.show() : this.hide();
        }
        return this.each(function () {
            if (isHidden(this)) {
                hAzzle(this).show();
            } else {
                hAzzle(this).hide();
            }
        });
    }
});


// Let us extend the hAzzle Object a litle ...

hAzzle.extend({

    // Various supports...

    cssPrefixes: ['', 'Moz', 'Webkit', 'O', 'ms', 'Khtml'],

    // Properties that shouldn't have units behind e.g. 
    // zIndex:33px are not allowed

    unitless: {
        'lineHeight': true,
        'zoom': true,
        'zIndex': true,
        'opacity': true,
        'boxFlex': true,
        'WebkitBoxFlex': true,
        'MozBoxFlex': true,
        'columns': true,
        'fontWeight': true,
        'overflow': true,
        'fillOpacity': true,
        'flexGrow': true,
        'columnCount': true,


        'flexShrink': true,
        'order': true,
        'orphans': true,
        'widows': true,
    },

    /**
     * Yes, we are now supporting CSS hooks
     * Some cssHooks are injected from the
     * cssSupport.js module
     */

    cssHooks: {

        opacity: {
            get: function (el, computed) {

                if (computed) {
                    var ret = hAzzle.css(el, 'opacity');
                    return ret === '' ? '1' : ret;
                }
            }
        },
    },

    /**
     * cssSupport.js OR plug-ins will fill this object with data
     */

    cssProps: {},

    /**
     * cssSupport.js OR plug-ins will fill this object with data
     */

    cssSupport: {},

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

                if (!hAzzle.features.clearCloneStyle && value === '' && name.indexOf('background') === 0) {

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

    /*
     * Set CSS rules on DOM nodes
     *
     * It also converts CSS-style (e.g. box-sizing) to
     * camelCase
     */

    css: function (el, prop) {

        var val,
            hooks,
            origName = hAzzle.camelize(prop);

        // If no element, return

        if (!el) {

            return null;
        }

        // Inspiration from jQuery

        hooks = hAzzle.cssHooks[prop] || hAzzle.cssHooks[origName];

        // If a hook was provided get the computed value from there

        if (hooks && 'get' in hooks) {

            val = hooks.get(el, true);

        }

        // Otherwise, if a way to get the computed value exists, use that

        if (val === undefined) {

            val = curCSS(el, prop);
        }

        //convert 'normal' to computed value

        if (val === 'normal' && prop in cssNormalTransform) {

            val = cssNormalTransform[prop];
        }

        return val;
    },

    /**
     * Converts one unit to another
     *
     * @param {Object} target
     * @param {String} prop
     * @param {String} returnUnit
     *
     */

    units: function (px, unit, elem, prop) {

        var val, num;

        if (unit === '' || unit === 'px') {

            return px; // Return if already 'px' or blank
        }

        if (unit === '%') {

            if (lrmp.test(prop)) {
                prop = 'width';

            } else if (topbot.test(prop)) {

                prop = 'height';
            }

            if (reaf.test(hAzzle.css(elem, 'position'))) {

                elem = elem.offsetParent;

            } else {

                elem = elem.parentNode;
            }

            if (elem) {

                val = hAzzle.css(elem, prop);
                num = num = parseFloat(val);

                prop = hAzzle.isNumeric(num) ? num || 0 : val;

                if (prop !== 0) {

                    return px / prop * 100;
                }
            }
            return 0;
        }

        if (unit === 'em') {

            val = hAzzle.css(elem, 'fontSize');
            num = parseFloat(val);

            prop = hAzzle.isNumeric(num) ? num || 0 : val;

            return px / prop;
        }

        if (hAzzle.units.unity === undefined) {

            var units = hAzzle.units.unity = {},
                div = doc.createElement('div');

            div.style.width = '100cm';

            doc.body.appendChild(div);
            units.mm = div.offsetWidth / 1000;
            doc.body.removeChild(div);
            units.cm = units.mm * 10;
            units.in = units.cm * 2.54;
            units.pt = units.in * 1 / 72;
            units.pc = units.pt * 12;
        }

        // If the unity specified is not recognized we return the value.

        unit = hAzzle.units.unity[unit];

        return unit ? px / unit : px;
    }

}, hAzzle);


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

// Margin and padding cssHooks

hAzzle.each(['margin', 'padding'], function (hook) {
    hAzzle.cssHooks[hook] = {
        get: function (elem) {
            return hAzzle.map(directions, function (dir) {
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
            hAzzle.each(directions, function (dir) {
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

        var orig,
            ret,
            elem = this[0];

        if (!elem) {

            return '';

        }

        if (hAzzle.isWindow(elem)) {

            return elem.document.documentElement['client' + dimensionProperty];
        }

        // Get document width or height
        if (elem.nodeType === 9) {
            return Math.max(
                elem.documentElement['client' + dimensionProperty],
                elem.body['scroll' + dimensionProperty], elem.documentElement['scroll' + dimensionProperty],
                elem.body['client' + dimensionProperty], elem.documentElement['client' + dimensionProperty]);
        }

        // Get width or height on the element
        if (value === undefined) {
            orig = hAzzle.css(elem, name);
            return hAzzle.IsNaN(ret) ? parseFloat(orig) : orig;
        }

        // Set the width or height on the element

        hAzzle(elem).css(name, value);
    };
});




var curCSS = hAzzle.curCSS = function (elem, prop, computed) {

    var ret;

    computed = computed || getStyles(elem);

    if (computed) {

        ret = computed.getPropertyValue(prop) || computed[prop];
    }

    if (computed) {

        if (ret === '' && !hAzzle.contains(elem.ownerDocument, prop)) {

            ret = hAzzle.style(elem, name);
        }
    }

    return ret !== undefined ?

        ret + '' :
        ret;
};




// scrollTop and scrollLeft functions
hAzzle.forOwn({
    scrollLeft: 'pageXOffset',
    scrollTop: 'pageYOffset'
}, function (prop, method) {
    var top = 'pageYOffset' === prop;

    hAzzle.Core[method] = function (val) {
        var elem = this[0],
            win;

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
    };
});