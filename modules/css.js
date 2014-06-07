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
        },
    },

    getStyles = hAzzle.features.computedStyle ? function (el) {

        if (el.ownerDocument.defaultView.opener) {
            return el.ownerDocument.defaultView.getComputedStyle(el[0], null);
        }

        return win.getComputedStyle(el, null);

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

    cssProps = {
        // normalize float css property
        "float": "cssFloat"
    };



function vendorPropName(style, name) {

    // shortcut for names that are not vendor prefixed
    if (name in style) {
        return name;
    }

    // check for vendor prefixed names
    var capName = name[0].toUpperCase() + name.slice(1),
        origName = name,
        i = cssPrefixes.length;

    while (i--) {
        name = cssPrefixes[i] + capName;
        if (name in style) {
            return name;
        }
    }

    return origName;
}

var cssNormalTransform = {
    letterSpacing: "0",
    fontWeight: "400"
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

            el;

        // is this a request for just getting a style?
        if (typeof value === 'undefined' && typeof property === 'string') {

            var val,
			hooks,
                origName = hAzzle.camelize(property);

            el = this[0];

            if (!el) {

                return null;
            }

            // Make sure that we're working with the right name

            value = cssProps[origName] || (cssProps[origName] = vendorPropName(el.style, origName));

            // Inspiration from jQuery

            hooks = hAzzle.cssHooks[name] || hAzzle.cssHooks[origName];

            // Short-cuts for document and window size

            if (el === doc || el === win) {

                p = (el === doc) ? docu() : viewport();

                return property === 'width' ? p.width : property === 'height' ? p.height : '';
            }

            // If a hook was provided get the computed value from there

            if (hooks && "get" in hooks) {
                val = hooks.get(el, true);
            }

            // Otherwise, if a way to get the computed value exists, use that

            if (val === undefined) {

                val = hAzzle.getStyle(el, value);
            }

            //convert "normal" to computed value

            if (val === "normal" && name in cssNormalTransform) {

                val = cssNormalTransform[name];
            }

            return (property = styleProperty(property)) ? val : '';
        }

        if (typeof property === 'string') {
            iter = {};
            iter[property] = value;
        }

        function fn(el) {

            for (var k in iter) {

                if (iter.hasOwnProperty(k)) {

                    return hAzzle.style(el, k, iter[k]);
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

        if (hAzzle.style(elem, "position") === "fixed") {
            // we assume that getBoundingClientRect is available when computed position is fixed
            offset = elem.getBoundingClientRect();

        } else {

            // Get *real* offsetParent

            offsetParent = this.offsetParent();

            // Get correct offsets

            offset = this.offset();

            if (!hAzzle.nodeName(offsetParent[0], "html")) {
                parentOffset = offsetParent.offset();
            }

            // parentOffset = /^(?:body|html)$/i.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

            // Subtract element margins
            // note: when an element has margin: auto the offsetLeft and marginLeft
            // are the same in Safari causing offset.left to incorrectly be 0
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
     * Yes, we are now supporting CSS hooks, but not
     * in the same way as jQuery.
     */

    cssHooks: {

        opacity: {
            get: function (el, computed) {

                if (computed) {
                    var ret = hAzzle.getStyle(el, "opacity");
                    return ret === "" ? "1" : ret;
                }
            }
        },
    },

    style: function (elem, name, value, extra) {

      var type, p, hooks, ret;

        // Don't set styles on text and comment nodes
      
        if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {

            return;
        }

        var style = elem.style;

        // Check if we're setting a value

        if (value !== undefined) {

            type = typeof value;

            // Camelize the name

            p = styleProperty(name);

            name = cssProps[p] || (cssProps[p] = vendorPropName(style, p));

            // Props to jQuery

            hooks = hAzzle.cssHooks[name] || hAzzle.cssHooks[p];

            // convert relative number strings

            if (typeof value === 'string' && (ret = rrelNum.exec(value))) {
                value = (ret[1] + 1) * ret[2] + parseFloat(hAzzle.getStyle(elem, name));
                type = 'number';
            }


            // Make sure that null and NaN values aren't set.

            if (value === null || value !== value) {

                return;
            }

            // If a number was passed in, add 'px' to the (except for certain CSS properties)

            if (type === 'number' && !hAzzle.unitless[name]) {

                value += 'px';
            }

            if (!hAzzle.features.clearCloneStyle && value === '' && name.indexOf('background') === 0) {

                style[hAzzle.camelize(name)] = 'inherit';
            }

            // If a hook was provided, use that value, otherwise just set the specified value

            if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
                style[p] = hAzzle.setter(elem, value);
            }
        } else {

            return style[name];
        }

    },

    getStyle: function (elem, prop, computed) {

        var ret,
            value;

        /* FireFox, Chrome/Safari, Opera and IE9+
         * ONLY supports 'getComputedStyle'
         *
         * Some mobile browsers don't support it yet
         *
         * http://caniuse.com/getcomputedstyle
         */

        value = computed || getStyles(elem);

        if (value) {

            ret = value.getPropertyValue(prop) || value[prop];
        }

        if (value) {

            if (ret === "" && !hAzzle.contains(elem.ownerDocument, prop)) {

                ret = hAzzle.style(elem, name);
            }
        }

        return ret !== undefined ?
            // Support: IE
            // IE returns zIndex value as an integer.
            ret + "" :
            ret;
    },

    /**
     * Not completed YET!!
     *
     * Ongoing project........
     *
     */

    units: function (val, start, unit) {

        var parts = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i.exec(val),
            end;

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
            };
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