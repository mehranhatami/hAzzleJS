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
    reDash = /\-./g,
    reCamel = /[A-Z]/g,
    directions = ['Top', 'Right', 'Bottom', 'Left'],
    computed,
    props,

    /*!
     * Holds an array with all CSS unitless attributes
     *
     * TODO!!
     *
     * Make sure this list are correct, and contains all
     * unitless attributes
     *
     */
    unitless = [

        'opacity',
        'box-flex',
        'webkit-box-flex',
        'moz-box-flex',
        'columns',
        'overflow',
        'flexGrow',
        'flexShrink',
        'order',
        'orphans',
        'widows',
        'float',
        'fillOpacity',
        'font-weight',
        'line-height',
        'columnCount',
        'zoom',
        'zIndex',
        'fontWeight',
        'fillOpacity',
        'lineHeight',
        'fontWeight',
        'flexShrink',
        'flexGrow',
        'fillOpacity',
        'counter-increment',
        'volume',
        'stress',
        'pitch-range',
        'richness',
        'font',
        'table-layout',
        'white-space',
        'visibility',
        'background-color',
        'text-alignborder-color',
        'word-break',
        'word-spacing',
        'word-wrap',
        'writing-mode',
        'pause',
        'font-size-adjust',
        'list-style',
        'background-position',
        'transform',
        'background ',
        'backgroundImage',
        'font-size-adjust',
        'font-stretch',
        'font-style',
        'font-variant',
        'font-weight'
    ],

    cssNormalTransform = {

        letterSpacing: '0',
        fontWeight: '400'
    },

    elemdisplay = {},

    getStyle = hAzzle.features.computedStyle ? function (el) {

        if (el) {

            if (el.ownerDocument && el.ownerDocument.defaultView.opener) {

                return el.ownerDocument.defaultView.getComputedStyle(el[0], null);
            }
        }

        return el && window.getComputedStyle(el, null);

    } : function (el) {

        /**
         * We will never reach down here unless we are using some old
         * mobile browsers. Anyways. After a few months when all
         * vendors have upgraded their browsers - I guess we
         * can remove this 'hack'
         *
         */

        return el.style || el.currentStyle;
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
        len = elements.length;

    for (; index < len; index++) {
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
    for (index = 0; index < len; index++) {
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

    zIndex: function (zIndex) {
        if (zIndex !== undefined) {
            return this.css('zIndex', zIndex);
        }

        if (this.length) {
            var elem = hAzzle(this[0]),
                position, value;
            while (elem.length && elem[0] !== document) {
                position = elem.css('position');
                if (position === 'absolute' || position === 'relative' || position === 'fixed') {
                    value = parseInt(elem.css('zIndex'), 10);
                    if (!isNaN(value) && value !== 0) {
                        return value;
                    }
                }
                elem = elem.parent();
            }
        }

        return 0;
    },

    /**
     * Set / get CSS style
     *
     * @param {Object|string} property
     * @param {string} value
     * @return {hAzzle|string}
     */

    css: function (prop, value) {

        var obj = prop,
            el = this[0];

        if (hAzzle.isArray(prop)) {

            var map = {},
                i = 0,
                styles = getStyle(el),
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
            hAzzle.forOwn(obj, function (value, key) {
                hAzzle.style(el, key, value);
            });
        });
    },

    /**
     * Calculates offset of the current element
     *
     * @param {number=} x
     * @param {number=} y
     * @return {object}
     */

    offset: function (opts) {
        if (arguments.length) {
            return opts === undefined ?
                this :
                this.each(function (el, i) {
                    xy(el, opts, i);
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

    cssStyles: {

        // Get properties

        get: {},

        // Set properties

        set: {}

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

    style: function (elem, name, value) {

        if (value !== undefined) {

            if (elem && (elem.nodeType !== 3 || elem.nodeType !== 8)) {

                var type = typeof value,
                    style = elem.style,
                    ret,
                    hooks = hAzzle.cssHooks[name],
                    CSS = hAzzle.cssStyles.set[name];

                if (value === null) {

                    value = '';
                }

                if (CSS) {

                    CSS(style, value, elem);

                } else {

                    if (type === 'string' && (ret = numbs.exec(value))) {

                        value = relativeCalculation(elem, name, ret);
                        type = 'number';
                    }

                    // Make sure that null and NaN values aren't set.

                    if (type === 'number') {

                        value += ret && ret[3] ? ret[3] : 'px';
                    }

                    if (!hAzzle.features.clearCloneStyle && value === '' && name.indexOf('background') === 0) {

                        style[hAzzle.camelize(name)] = 'inherit';
                    }

                    // If a hook was provided, use that value, otherwise just set the specified value

                    if (!hooks || !('set' in hooks) || (value = hooks.set(elem, value)) !== undefined) {

                        style[name] = value;
                    }
                }
            }

        } else {

            return elem && elem.style[name];
        }
    },

    /*
     * Set CSS rules on DOM nodes
     */

    css: function (el, prop) {

        var val, style, CSS, hooks, computed;

        // If element, continue...

        if (el) {

            style = el.style;

            CSS = hAzzle.cssStyles.get[prop];
            val = CSS ? CSS(style) : style[prop];

            hooks = hAzzle.cssHooks[prop];

            if (hooks && 'get' in hooks) {

                val = hooks.get(el, true);
            }

            if (!computed && val === undefined) {

                style = curCSS(el);
                val = CSS ? CSS(style) : style[prop];

                computed = true;
            }

            // Convert 'normal' to computed value

            if (val === 'normal' && name in cssNormalTransform) {

                val = cssNormalTransform[name];

            }

            return val;
        }
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

/* =========================== PRIVATE FUNCTIONS ========================== */


function relativeCalculation(elem, name, ret) {
    return hAzzle.units(parseFloat(curCSS(elem, name)), ret[3], elem, name) + (ret[1] + 1) * ret[2];
}

/**
 * sets an element to an explicit x/y position on the page
 * @param {Element} element
 * @param {Object/Number} options
 * @param {Number} i
 */
function xy(elem, opts, i) {

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

    if (hAzzle.isFunction(opts)) {
        opts = opts.call(elem, i, curOffset);
    }

    if (opts.top !== null) {
        props.top = (opts.top - curOffset.top) + curTop;
    }
    if (opts.left !== null) {
        props.left = (opts.left - curOffset.left) + curLeft;
    }

    if ('using' in opts) {
        opts.using.call(elem, props);

    } else {
        curElem.css(props);
    }
}

var curCSS = hAzzle.curCSS = function (elem, prop, computed) {

    var ret;

    computed = computed || getStyle(elem);

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

/* =========================== INTERNAL ========================== */

// Margin and padding cssHooks

hAzzle.each(['margin', 'padding'], function (hook) {
    hAzzle.cssHooks[hook] = {
        get: function (elem) {
            return hAzzle.map(directions, function (dir) {
                return hAzzle.curCSS(elem, hook + dir);
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

// Get all computed values 

computed = getStyle(hAzzle.docElem);

// In Opera CSSStyleDeclaration objects returned by 'getComputeStyle' have length 0

if (computed.length) {

    props = slice.call(computed, 0);

} else {

    props = hAzzle.map(computed, function (key) {

        return key.replace(reCamel, function (str) {
            return '-' + str.toLowerCase();
        });
    });
}

// Add to the hAzzle.cssStyles object

hAzzle.each(props, function (nameProps) {
    var pfx = nameProps[0] === '-' ? nameProps.substr(1, nameProps.indexOf('-', 1) - 1) : null,
        unprefixedName = pfx ? nameProps.substr(pfx.length + 2) : nameProps,
        styleProps = nameProps.replace(reDash, function (str) {
            return str[1].toUpperCase();
        });

    // most of browsers starts vendor specific props in lowercase

    if (!(styleProps in computed)) {

        styleProps = styleProps[0].toLowerCase() + styleProps.substr(1);
    }

    if (styleProps !== nameProps) {

        hAzzle.cssStyles.get[unprefixedName] = function (style) {
            return style[styleProps];
        };

        hAzzle.cssStyles.set[unprefixedName] = function (style, value, /* optional */ elem) {

            var ret,
                type = typeof value;

            if (type === 'string' && (ret = numbs.exec(value))) {

                value = relativeCalculation(elem, name, ret);
                type = 'number';
            }

            if (type === 'number') {

                value += ret && ret[3] ? ret[3] : 'px';

            } else {

                value = value.toString();
            }

            // use cssText property to determine DOM.importStyles call

            style['cssText' in style ? styleProps : nameProps] = value;
        };
    }
});

// Exclude the css attribues inside the unitless.js module 
// from adding px

hAzzle.each(unitless, function (nameProps) {
    var styleProps = nameProps.replace(reDash, function (str) {
        return str[1].toUpperCase();
    });

    hAzzle.cssStyles.set[nameProps] = function (style, value) {
        style['cssText' in style ? styleProps : nameProps] = value;
    };
});

// normalize property shortcuts

hAzzle.forOwn({
    font: ['fontStyle', 'fontSize', '/', 'lineHeight', 'fontFamily'],
    padding: hAzzle.map(directions, function (dir) {
        return 'padding' + dir;
    }),
    margin: hAzzle.map(directions, function (dir) {
        return 'margin' + dir;
    }),
    'border-width': hAzzle.map(directions, function (dir) {
        return 'border' + dir + 'Width';
    }),
    'border-style': hAzzle.map(directions, function (dir) {
        return 'border' + dir + 'Style';
    })

}, function (props, key) {

    hAzzle.cssStyles.get[key] = function (style) {

        var result = [],
            hasEmptyStyleValue = function (prop, index) {

                result.push(prop === '/' ? prop : style[prop]);

                return !result[index];
            };

        return props.some(hasEmptyStyleValue) ? '' : result.join(' ');
    };

    hAzzle.cssStyles.set[key] = function (style, value, /* optional */ elem) {

        if (value && 'cssText' in style) {

            // normalize setting complex property across browsers

            style.cssText += ';' + key + ':' + value;

        } else {

            var ret,
                type = typeof value;

            hAzzle.each(props, function (name) {

                if (type === 'string' && (ret = numbs.exec(value))) {

                    value = relativeCalculation(elem, name, ret);
                    type = 'number';
                }

                if (type === 'number') {

                    value += ret && ret[3] ? ret[3] : 'px';

                } else {

                    value = value.toString();
                }

                style[name] = value;
            });
        }
    };
});