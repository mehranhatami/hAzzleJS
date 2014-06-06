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
        // Temporary hack for opacity
        // Will be fixed soon

        if (property === 'opacity') {

            return value;

        } else {

            return el.style[value] || value;

        }

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

            if (property === 'opacity') {

                return value.style.opacity;
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

    /**
     * Not completed YET!!
     *
     * Ongoing project........
     *
     */

    units: function (val, start, unit) {

        var parts = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i.exec(val),
            end,
            unit;

        if (parts) {

            end = parseFloat(parts[2]);
            unit = parts[3];

            if (unit !== 'px') {
                console.log("Not supported YET!!");
            }

            if (parts[1]) {
                end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
            }

            return {
                value: end,
                unit: unit
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