/*!
 * CSS
 */
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source,
    rrelNum = new RegExp('^([+-])=(' + pnum + ')', 'i'),

    win = this,
    doc = win.document,
    html = doc.documentElement,
    px = 'px',
    elemdisplay = {},

    props = ['backgroundColor',
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor',
        'borderColor',
        'boxShadowColor',
        'color',
        'textShadowColor',
        'columnRuleColor',
        'outlineColor',
        'textDecorationColor',
        'textEmphasisColor'
    ],

    cssPrefixes = ["Webkit", "O", "Moz", "ms"],

    cssProperties = {

        'Webkit': function () {
            return {
                property: '-webkit-transition',
                end: 'webkitTransitionEnd',
                transform: 'WebkitTransform',
                animation: 'WebkitAnimation'
            };
        },
        'Moz': function () {
            return {
                property: '-moz-transition',
                end: 'transitionend',
                transform: 'MozTransform',
                animation: 'MozAnimation'
            };
        },
        'O': function () {
            return {
                property: '-o-transition',
                end: 'oTransitionEnd otransitionend',
                transform: 'OAnimation',
                animation: 'WebkitAnimation'
            };
        },
        'ms': function () {
            return {
                property: 'transition',
                end: 'transitionend',
                transform: 'msTransform',
                animation: 'msAnimation'
            };
        },
        'Khtml': function () {
            return {
                property: '-khtml-transition',
                end: 'transitionend',
                transform: 'transform',
                animation: ''
            };
        },
        '': function () {
            return {
                property: 'transition',
                end: 'transitionend',
                transform: 'transform',
                animation: 'animation'
            };
        }
    };


/**
 * Get CSS3 transition prefix
 */

function getVendorPrefix() {
    var el = doc.createElement("div"),
        i = cssPrefixes.length;

    while (i--) {
        if (cssPrefixes[i] + "Transition" in el.style) {
            return cssPrefixes[i];
        }
    }

    return "transition" in el.style ? "" : false;
}

function actualDisplay(name, doc) {

    var style,
        docbody = doc.body,
        display,
        elem = doc.createElement(name);

    // Vanila solution is the best choice here

    docbody.appendChild(elem);

    display = win.getDefaultComputedStyle && (style = win.getDefaultComputedStyle(elem)) ? style.display : hAzzle.getStyle(elem[0], 'display');

    docbody.removeChild(elem);

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

            var iframe = iframe || doc.documentElement.appendChild('<iframe frameborder="0" width="0" height="0"/>');

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
    return elem.style.display === 'none';
}

/**
 * Show an element
 *
 * @param {Object} elem
 * @return Object}
 *
 *
 * FIXME!! Need a lot of tests and fixes to work correctly everywhere
 *
 */

function show(elem) {

    var style = elem.style;

    if (style.display === 'none') {

        style.display = '';
    }

    if ((style.display === '' && hAzzle.getStyle(elem, 'display') === 'none') || !hAzzle.contains(elem.ownerDocument.documentElement, elem)) {
        hAzzle.data(elem, 'display', defaultDisplay(elem.nodeName));
    }
}

/**
 * Hide an element
 *
 * @param {Object} elem
 * @return Object}
 */

function hide(elem) {
    if (!isHidden(elem)) {
        var display = hAzzle.getStyle(elem, 'display');
        if (display !== 'none') {
            hAzzle.data(elem, 'display', display);
        }

        // Hide the element

        elem.style.display = 'none';
    }
}

/**
 * @param {string} p
 * @return {string}
 */

function styleProperty(p) {

    if (p === 'transform') {

        p = hAzzle.features.transform;

    } else if (/^transform-?[Oo]rigin$/.test(p)) {

        p = hAzzle.features.transform + 'Origin';

    }

    return p ? hAzzle.camelize(p) : null;
}


hAzzle.extend({

    unitless: {
        lineHeight: 1,
        zoom: 1,
        zIndex: 1,
        opacity: 1,
        boxFlex: 1,
        WebkitBoxFlex: 1,
        MozBoxFlex: 1,
        columns: 1,
        fontWeight: 1,
        overflow: 1
    },

    getStyle: function (el, property) {
        var value = null,
            computed;

        if (el.ownerDocument.defaultView.opener) {
            computed = el.ownerDocument.defaultView.getComputedStyle(el, null);
        } else {
            computed = win.getComputedStyle(el, null);
        }

        if (computed) {

            value = computed.getPropertyValue(property) || computed[property];


            if (value === '' && !hAzzle.contains(el.ownerDocument, el)) {
                value = el.style[property];
            }
        }
        return el.style[value] || value;
    }

}, hAzzle);

hAzzle.extend({

    /**
     * Set / get CSS style
     *
     * @param {Object|string} property
     * @param {string} value
     * @return {hAzzle|string}
     */

    css: function (property, value) {

        var p, iter = property,
            color,
            type,
            ret;

        // is this a request for just getting a style?
        if (typeof value === 'undefined' && typeof property === 'string') {

            value = this[0];

            if (!value) {

                return null;
            }

            // Short-cuts for document and window size

            if (value === doc || value === win) {

                p = (value === doc) ? docu() : viewport();

                return property === 'width' ? p.width : property === 'height' ? p.height : '';
            }

            return (property = styleProperty(property)) ? hAzzle.getStyle(value, property) : null;
        }

        if (typeof property === 'string') {
            iter = {};
            iter[property] = value;
        }

        function fn(el, p, v) {

            var k;

            for (k in iter) {

                if (iter.hasOwnProperty(k)) {

                    v = iter[k];
                    type = typeof v;
                    // convert relative number strings

                    if (typeof value === 'string' && (ret = rrelNum.exec(value))) {
                        v = (ret[1] + 1) * ret[2] + parseFloat(hAzzle.getStyle(el, k));
                        type = 'number';
                    }

                    // Make sure that null and NaN values aren't set.

                    if (v === null || v !== v) {

                        return;
                    }

                    if (!hAzzle.features.clearCloneStyle && value === '' && name.indexOf('background') === 0) {

                        el.style[hAzzle.camelize(k)] = 'inherit';
                    }

                    // If a number was passed in, add 'px' to the (except for certain CSS properties)

                    if (type === 'number' && hAzzle.unitless[p]) {

                        v += 'px';
                    }

                    // Camelize the name

                    p = styleProperty(k);

                    // Translate all colors to RGB...

                    if (typeof (color = hAzzle.colorHook[k]) === 'function') {

                        return color(el, v);
                    }

                    el.style[p] = hAzzle.setter(el, v);
                }
            }
        }

        return this.each(fn);
    },

    /**
     * @param {number=} x
     * @param {number=} y
     * @return {hAzzle|number}
     */

    offset: function (x, y) {
        if (x && typeof x === 'object' && (typeof x.top === 'number' || typeof x.left === 'number')) {
            return this.each(function (el) {
                xy(el, x.left, x.top);
            });
        } else if (typeof x === 'number' || typeof y === 'number') {
            return this.each(function (el) {
                xy(el, x, y);
            });
        }
        if (!this[0]) {

            return {
                top: 0,
                left: 0,
                height: 0,
                width: 0
            };
        }
        var el = this[0],
            clientTop = html.clientTop,
            clientLeft = html.clientLeft,
            _win = hAzzle.isWindow(doc) ? doc : doc.nodeType === 9 && doc.defaultView,
            scrollTop = _win.pageYOffset || html.scrollTop,
            scrollLeft = _win.pageXOffset || html.scrollLeft,
            bcr = {
                top: 0,
                left: 0
            };

        if (typeof el.getBoundingClientRect !== typeof undefined) {

            bcr = el.getBoundingClientRect();
        }

        return {
            top: bcr.top + scrollTop - clientTop,
            left: bcr.left + scrollLeft - clientLeft,
            right: bcr.right + scrollLeft - clientLeft,
            bottom: bcr.bottom + scrollTop - clientTop,
            height: bcr.bottom - bcr.top,
            width: bcr.right - bcr.left
        };
    },

    width: function (value) {

        var orig, ret, elem = this[0];
        if (!elem) return '';
        if (hAzzle.isWindow(elem)) {
            return elem.document.documentElement.clientWidth;
        }

        // Get document width or height
        if (elem.nodeType === 9) {
            return Math.max(
                elem.documentElement.clientWidth,
                elem.body.scrollWidth, elem.documentElement.scrollWidth,
                elem.body.clientWidth, elem.documentElement.clientWidth);
        }

        // Get width or height on the element
        if (value === undefined) {
            orig = hAzzle.getStyle(elem, 'width');
            ret = parseFloat(orig);
            return hAzzle.IsNaN(ret) ? ret : orig;
        }

        // Set the width or height on the element

        hAzzle(elem).css('width', value);

    },

    height: function (value) {

        var orig, ret, elem = this[0];

        if (hAzzle.isWindow(elem)) {
            return elem.document.documentElement.clientHeight;
        }

        // Get document width or height
        if (elem.nodeType === 9) {
            return Math.max(
                elem.documentElement.clientHeight,
                elem.body.scrollHeight, elem.documentElement.scrollHeight,
                elem.body.clientHeight, elem.documentElement.clientHeight);
        }

        // Get width or height on the element
        if (value === undefined) {
            orig = hAzzle.getStyle(elem, 'height');
            ret = parseFloat(orig);
            return hAzzle.IsNaN(ret) ? ret : orig;
        }

        // Set the width or height on the element

        hAzzle(elem).css('height', value);
    },

    /**
     * @param {number} y
     */

    scrollTop: function (val) {

        var elem = this[0],
            win = hAzzle.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;

        if (typeof val === 'undefined') {

            return val ? val.pageYOffset : elem.scrollTop;
        }
        if (win) {
            win.scrollTo(window.scrollTop);
        } else {
            elem.scrollTop = val;
        }
    },

    /**
     * @param {number} val
     */

    scrollLeft: function (val) {
        var elem = this[0],
            win = hAzzle.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;

        if (typeof val === 'undefined') {

            return val ? val.pageXOffset : elem.scrollLeft;
        }

        if (win) {

            win.scrollTo(window.scrollLeft);

        } else {

            elem.scrollLeft = val;
        }
    },

    offsetParent: function () {
        return hAzzle(this.map(function (el) {
            var op = el.offsetParent || doc.documentElement;
            while (op && (!hAzzle.nodeName(op, 'html') && hAzzle.getStyle(op, 'position') === 'static')) {
                op = op.offsetParent || doc.documentElement;
            }
            return op;
        }));
    },

    /**
     * Show elements in collection
     *
     * @return {Object}
     */

    show: function () {
        return this.each(function () {
            show(this);
        });
    },

    /**
     * Hide elements in collection
     *
     * @return {Object}
     */

    hide: function () {
        return this.each(function () {
            hide(this);
        });
    },

    /**
     * Toggle show/hide.
     * @return {Object}
     */

    toggle: function (state) {

        var elem;

        if (typeof state === 'boolean') {
            return state ? this.show() : this.hide();
        }

        return this.each(function () {
            elem = this;

            if (isHidden(elem)) {
                show(elem);
            } else {
                hide(elem);

            }
        });
    }
});


// Let us extend the hAzzle Object a litle ...

hAzzle.extend({

    colorHook: {},

    /**
     * hAzzle color names
     *
     * NOTE!! Only the most used RGB colors are listed, if you need more, you have to
     * create a plug-in for it.
     *
     */

    colornames: {
        aliceblue: {
            r: 240,
            g: 248,
            b: 255
        },
        antiquewhite: {
            r: 250,
            g: 235,
            b: 215
        },
        aqua: {
            r: 0,
            g: 255,
            b: 255
        },
        aquamarine: {
            r: 127,
            g: 255,
            b: 212
        },
        azure: {
            r: 240,
            g: 255,
            b: 255
        },
        beige: {
            r: 245,
            g: 245,
            b: 220
        },
        bisque: {
            r: 255,
            g: 228,
            b: 196
        },
        black: {
            r: 0,
            g: 0,
            b: 0
        },
        blue: {
            r: 0,
            g: 0,
            b: 255
        },
        blueviolet: {
            r: 138,
            g: 43,
            b: 226
        },
        brown: {
            r: 165,
            g: 42,
            b: 42
        },
        burlywood: {
            r: 222,
            g: 184,
            b: 135
        },
        cadetblue: {
            r: 95,
            g: 158,
            b: 160
        },
        coral: {
            r: 255,
            g: 127,
            b: 80
        },
        crimson: {
            r: 220,
            g: 20,
            b: 60
        },
        cyan: {
            r: 0,
            g: 255,
            b: 255
        },
        darkblue: {
            r: 0,
            g: 0,
            b: 139
        },
        darkcyan: {
            r: 0,
            g: 139,
            b: 139
        },
        darkgray: {
            r: 169,
            g: 169,
            b: 169
        },
        darkgreen: {
            r: 0,
            g: 100,
            b: 0
        },
        darkgrey: {
            r: 169,
            g: 169,
            b: 169
        },
        darkmagenta: {
            r: 139,
            g: 0,
            b: 139
        },
        darkolivegreen: {
            r: 85,
            g: 107,
            b: 47
        },
        darkred: {
            r: 139,
            g: 0,
            b: 0
        },
        darksalmon: {
            r: 233,
            g: 150,
            b: 122
        },
        darkseagreen: {
            r: 143,
            g: 188,
            b: 143
        },
        darkviolet: {
            r: 148,
            g: 0,
            b: 211
        },

        gold: {
            r: 255,
            g: 215,
            b: 0
        },
        goldenrod: {
            r: 218,
            g: 165,
            b: 32
        },
        green: {
            r: 0,
            g: 128,
            b: 0
        },
        greenyellow: {
            r: 173,
            g: 255,
            b: 47
        },
        grey: {
            r: 128,
            g: 128,
            b: 128
        },
        indianred: {
            r: 205,
            g: 92,
            b: 92
        },
        indigo: {
            r: 75,
            g: 0,
            b: 130
        },
        ivory: {
            r: 255,
            g: 255,
            b: 240
        },
        lavender: {
            r: 230,
            g: 230,
            b: 250
        },
        lightblue: {
            r: 173,
            g: 216,
            b: 230
        },
        lightcoral: {
            r: 240,
            g: 128,
            b: 128
        },
        lightcyan: {
            r: 224,
            g: 255,
            b: 255
        },
        lightgray: {
            r: 211,
            g: 211,
            b: 211
        },
        lightgreen: {
            r: 144,
            g: 238,
            b: 144
        },
        lightgrey: {
            r: 211,
            g: 211,
            b: 211
        },
        lightpink: {
            r: 255,
            g: 182,
            b: 193
        },
        lightyellow: {
            r: 255,
            g: 255,
            b: 224
        },
        lime: {
            r: 0,
            g: 255,
            b: 0
        },
        limegreen: {
            r: 50,
            g: 205,
            b: 50
        },
        linen: {
            r: 250,
            g: 240,
            b: 230
        },
        magenta: {
            r: 255,
            g: 0,
            b: 255
        },
        maroon: {
            r: 128,
            g: 0,
            b: 0
        },
        midnightblue: {
            r: 25,
            g: 25,
            b: 112
        },
        moccasin: {
            r: 255,
            g: 228,
            b: 181
        },
        olive: {
            r: 128,
            g: 128,
            b: 0
        },
        olivedrab: {
            r: 107,
            g: 142,
            b: 35
        },
        orange: {
            r: 255,
            g: 165,
            b: 0
        },
        orangered: {
            r: 255,
            g: 69,
            b: 0
        },
        orchid: {
            r: 218,
            g: 112,
            b: 214
        },
        peru: {
            r: 205,
            g: 133,
            b: 63
        },
        pink: {
            r: 255,
            g: 192,
            b: 203
        },
        plum: {
            r: 221,
            g: 160,
            b: 221
        },
        purple: {
            r: 128,
            g: 0,
            b: 128
        },
        red: {
            r: 255,
            g: 0,
            b: 0
        },
        salmon: {
            r: 250,
            g: 128,
            b: 114
        },
        sandybrown: {
            r: 244,
            g: 164,
            b: 96
        },
        sienna: {
            r: 160,
            g: 82,
            b: 45
        },
        silver: {
            r: 192,
            g: 192,
            b: 192
        },
        skyblue: {
            r: 135,
            g: 206,
            b: 235
        },
        snow: {
            r: 255,
            g: 250,
            b: 250
        },
        tomato: {
            r: 255,
            g: 99,
            b: 71
        },
        turquoise: {
            r: 64,
            g: 224,
            b: 208
        },
        violet: {
            r: 238,
            g: 130,
            b: 238
        },
        wheat: {
            r: 245,
            g: 222,
            b: 179
        },
        white: {
            r: 255,
            g: 255,
            b: 255
        },
        whitesmoke: {
            r: 245,
            g: 245,
            b: 245
        },
        yellow: {
            r: 255,
            g: 255,
            b: 0
        },
        yellowgreen: {
            r: 154,
            g: 205,
            b: 50
        },
        transparent: {
            r: -1,
            g: -1,
            b: -1
        }
    },

    color: {
        normalize: function (input) {

            /**
             * Kenny: 'alpha' are used. See line  904, 914 and some other lines.
             * Not sure what jsHint are thinking with:
             *
             * Mehran: I couldn't find any of uses of 'alpha', please point the exact line out
             * all of the uses of the keyword 'alpha' are just keys or keywords or properties
             * none of them actually use 'alpha' variable???
             */

            var color, /*alpha,*/
                result, name, i, l,
                rhex = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
                rhexshort = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
                rrgb = /rgb(?:a)?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(0*\.?\d+)\s*)?\)/,
                rrgbpercent = /rgb(?:a)?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(0*\.?\d+)\s*)?\)/,
                rhsl = /hsl(?:a)?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(0*\.?\d+)\s*)?\)/;

            // Handle color: #rrggbb
            if ((result = rhex.exec(input))) {
                color = {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16),
                    source: result[0]
                };
            }
            // Handle color: #rgb
            else if ((result = rhexshort.exec(input))) {
                color = {
                    r: parseInt(result[1] + result[1], 16),
                    g: parseInt(result[2] + result[2], 16),
                    b: parseInt(result[3] + result[3], 16),
                    source: result[0]
                };
            }
            // Handle color: rgb[a](r, g, b [, a])
            else if ((result = rrgb.exec(input))) {
                color = {
                    r: parseInt(result[1], 10),
                    g: parseInt(result[2], 10),
                    b: parseInt(result[3], 10),
                    alpha: parseFloat(result[4], 10),
                    source: result[0]
                };
            }
            // Handle color: rgb[a](r%, g%, b% [, a])
            else if ((result = rrgbpercent.exec(input))) {
                color = {
                    r: parseInt(result[1] * 2.55, 10),
                    g: parseInt(result[2] * 2.55, 10),
                    b: parseInt(result[3] * 2.55, 10),
                    alpha: parseFloat(result[4], 10),
                    source: result[0]
                };
            }
            // Handle color: hsl[a](h%, s%, l% [, a])
            else if ((result = rhsl.exec(input))) {
                color = hAzzle.color.hsl_to_rgb(
                    parseFloat(result[1], 10) / 100,
                    parseFloat(result[2], 10) / 100,
                    parseFloat(result[3], 10) / 100
                );
                color.alpha = parseFloat(result[4], 10);
                color.source = result[0];
            }
            // Handle color: name
            else {
                result = input.split(' ');

                i = 0;
                l = result.length;

                for (; i < l; i++) {

                    name = result[i];

                    if (hAzzle.colornames[name]) {
                        break;
                    }
                }

                if (!hAzzle.colornames[name]) {
                    name = 'transparent';
                }

                color = hAzzle.colornames[name];
                color.source = name;
            }

            if (!color.alpha && color.alpha !== 0) {
                delete color.alpha;
            }

            return color;
        },

        hsl_to_rgb: function (h, s, l, a) {
            var r, g, b, m1, m2;

            if (s === 0) {
                r = g = b = l;
            } else {
                if (l <= 0.5) {
                    m2 = l * (s + 1);
                } else {
                    m2 = (l + s) - (l * s);
                }

                m1 = (l * 2) - m2;
                r = parseInt(255 * hAzzle.color.hue2rgb(m1, m2, h + (1 / 3)), 10);
                g = parseInt(255 * hAzzle.color.hue2rgb(m1, m2, h), 10);
                b = parseInt(255 * hAzzle.color.hue2rgb(m1, m2, h - (1 / 3)), 10);
            }

            return {
                r: r,
                g: g,
                b: b,
                alpha: a
            };
        },


        // hsla conversions adapted from:
        // https://code.google.com/p/maashaack/source/browse/packages/graphics/trunk/src/graphics/colors/HUE2RGB.as?r=5021          

        hue2rgb: function (p, q, h) {

            if (h < 0) {

                h++;
            }

            if (h > 1) {

                h--;
            }

            if ((h * 6) < 1) {
                return p + ((q - p) * h * 6);
            } else if ((h * 2) < 1) {
                return q;
            } else if ((h * 3) < 2) {
                return p + ((q - p) * ((2 / 3) - h) * 6);
            } else {
                return p;
            }
        }
    },

    cssProperties: function () {
        return cssProperties[getVendorPrefix()]();
    }

}, hAzzle);


/**
 * sets an element to an explicit x/y position on the page
 * @param {Element} el
 * @param {?number} x
 * @param {?number} y
 */
function xy(el, x, y) {
    var elem = hAzzle(el),
        style = elem.css('position'),
        offset = elem.offset(),
        rel = 'relative',
        isRel = style === rel,
        delta = [parseInt(elem.css('left'), 10), parseInt(elem.css('top'), 10)];

    if (style === 'static') {
        elem.css('position', rel);
        style = rel;
    }

    if (isNaN(delta[0])) {

        delta[0] = isRel ? 0 : el.offsetLeft;

    }

    if (isNaN(delta[1])) {

        delta[1] = isRel ? 0 : el.offsetTop;
    }

    if (x !== null) {

        el.style.left = x - offset.left + delta[0] + px;
    }

    if (y !== null) {

        el.style.top = y - offset.top + delta[1] + px;
    }
}

hAzzle.each(props, function (hook) {

    hAzzle.colorHook[hook] = function (elem, value) {

        value = hAzzle.color.normalize(value);

        if (!value.alpha) {
            value.alpha = 1;
        }

        elem.style[hook] = 'rgba(' + value.r + ',' + value.g + ',' + value.b + ',' + value.alpha + ')';
    };
});




function docu() {
    var vp = viewport();
    return {
        width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width),
        height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
    };
}

function viewport() {
    var self = this;
    return {
        width: self.innerWidth,
        height: self.innerHeight
    };
}