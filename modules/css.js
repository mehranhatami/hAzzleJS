/**
 * CSS Module
 *
 * hAzzle supports cssHooks in the same way as jQuery, and there is possibilities to add
 * extra set of rules for CSS.
 *
 * 'boxSizing' is the only property hAzzle support for now, because a lot of the other
 * CSS properties requires IE 10 or newer etc.
 *
 * hAzzle supports both width / height and padding / margin short-hand.
 *
 * Example:  hAzzle('div').css('margin')  ( Output margin for all directions)
 *
 * There are also support for Objects. CSS properties can be set in a serie, like this:
 *
 * hAzzle('div').css({ 'top': 10px, 'left': 20px, 'bottom': '300px' });
 *
 * This for faster development and the CSS selector only need to be requested
 * once. This increase the performance.
 *
 */
var html = window.document.documentElement,

    cssNormalTransform = {
        letterSpacing: "0",
        fontWeight: "400"
    },

    // Used for cache some functions for better performance

    cached = [],

    cssDirection = ["Top", "Right", "Bottom", "Left"],

    cssShow = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
    },

    // Some regEx we are using

    numberOrPx = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$/i,
    displaySwap = /^(none|table(?!-c[ea]).+)/,
    margin = (/^margin/),
    numSplit = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)$/i,
    relNum = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i;


/**
 * Get the documents width or height
 * margin / padding are optional
 */

function predefultValue(elem, name, extra) {

    if (!elem) return;

    if (hAzzle.isWindow(elem)) {

        return elem.document.documentElement.clientHeight;
    }

    // Get document width or height

    if (hAzzle.nodeType(9, elem)) {

        var doc = elem.documentElement;

        // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
        // whichever is greatest
        return Math.max(
            elem.body["scroll" + name], doc["scroll" + name],
            elem.body["offset" + name], doc["offset" + name],
            doc["client" + name]
        );
    }

    return hAzzle.css(elem, name, extra);
}

/**
 * Gets a window from an element
 */
function getWindow(elem) {
    return hAzzle.isWindow(elem) ? elem : hAzzle.nodeType(9, elem) && elem.defaultView;
}


/**
 * Get styles
 */

var getStyles = function (elem) {
    return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
};

function setPositiveNumber(value, subs) {
    var matches = numSplit.exec(value);
    return matches ? Math.max(0, matches[1] - (subs || 0)) + (matches[2] || "px") : value
}

function getWidthOrHeight(elem, name, extra) {
    var valueIsBorderBox = true,
        val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
        styles = getStyles(elem),
        isBorderBox = hAzzle.css(elem, "boxSizing", false, styles) === "border-box";

    if (val <= 0 || val === null) {
        val = curCSS(elem, name, styles);

        if (val < 0 || val === null) val = elem.style[name];

        if (numberOrPx.test(val)) return val;

        valueIsBorderBox = isBorderBox && (hAzzle.support.boxSizingReliable() || val === elem.style[name]);
        val = parseFloat(val) || 0;

    }
    return val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles) + "px";
}


function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {

    var i = extra === (isBorderBox ? "border" : "content") ? 4 : name === "width" ? 1 : 0,

        val = 0;

    for (; i < 4; i += 2) {

        // both box models exclude margin, so add it if we want it
        if (extra === "margin") {
            val += hAzzle.css(elem, extra + cssDirection[i], true, styles);
        }

        if (isBorderBox) {
            // border-box includes padding, so remove it if we want content
            if (extra === "content") {
                val -= hAzzle.css(elem, "padding" + cssDirection[i], true, styles);
            }

            // at this point, extra isn't border nor margin, so remove border
            if (extra !== "margin") {
                val -= hAzzle.css(elem, "border" + cssDirection[i] + "Width", true, styles);
            }
        } else {
            // at this point, extra isn't content, so add padding
            val += hAzzle.css(elem, "padding" + cssDirection[i], true, styles);

            // at this point, extra isn't content nor padding, so add border
            if (extra !== "padding") {
                val += hAzzle.css(elem, "border" + cssDirection[i] + "Width", true, styles);
            }
        }
    }

    return val;
}

/**
 * Check if an element is hidden
 *  @return {Boolean}

 */

function isHidden(elem, el) {
    elem = el || elem;
    return elem.style.display === "none";
}

/**
 * Show an element
 *
 * @param {Object} elem
 * @return Object}
 */

function show(elem) {

    if (isHidden(elem))
        return hAzzle.style(elem, 'display', hAzzle.data(elem, 'display') || 'block');
}

/**
 * Hide an element
 *
 * @param {Object} elem
 * @return Object}
 */

function hide(elem) {

    if (!isHidden(elem)) {

        var display = hAzzle.css(elem, 'display');
        if (display !== 'none') {
            hAzzle.data(elem, 'display', display);
        }

        // Hide the element
        hAzzle.style(elem, 'display', 'none');
    }
}


/**
 * Set and get CSS properties
 * @param {Object} elem
 * @param {String} name
 * @param {String} computed
 * @return {Object}
 *
 */

function curCSS(elem, name, computed) {
    var width, minWidth, maxWidth, ret,
        style = elem.style;

    computed = computed || getStyles(elem);

    if (computed) {
        ret = computed.getPropertyValue(name) || computed[name];
    }

    if (computed) {

        if (ret === "" && !hAzzle.contains(elem.ownerDocument, elem)) {
            ret = hAzzle.style(elem, name);
        }

        if (numberOrPx.test(ret) && margin.test(name)) {

            // Remember the original values
            width = style.width;
            minWidth = style.minWidth;
            maxWidth = style.maxWidth;

            // Put in the new values to get a computed value out
            style.minWidth = style.maxWidth = style.width = ret;
            ret = computed.width;

            // Revert the changed values
            style.width = width;
            style.minWidth = minWidth;
            style.maxWidth = maxWidth;
        }
    }
    return ret !== undefined ? ret + "" : ret;
}
/*
 * Check up for vendor prefixed names
 * This function is cached so we can gain better speed
 */

function vendorCheckUp(style, name) {

    if (!cached[style + name]) {

        // Shortcut for names that are not vendor prefixed

        if (name in style) {
            return name;
        }

        // check for vendor prefixed names

        var origName = name,
            name = hAzzle.prefix(name);

        if (name in style) {
            return name;
        }

        cached[style + name] = origName;
    }
    return cached[style + name];
}


hAzzle.extend({

    cssProps: {

        "float": "cssFloat"
    },

    // Don't add 'px' on certain CSS properties

    cssNumber: hAzzle.makeMap("fillOpacity, flexGrow, flexShrink, fontWeight, lineHeight, opacity, orphans, widows, zIndex, zoom"),

    /**
     * cssHooks similar to jQuery
     *
     * We are in 2014 and hAzzle supports cssHooks because we need to
     * support short-hands, and a lot of HTML5 features
     * supported by IE9 and newer browsers
     */

    cssHooks: {
        'opacity': {
            get: function (elem, computed) {
                if (computed) {
                    // We should always get a number back from opacity
                    var ret = curCSS(elem, "opacity");
                    return ret === "" ? "1" : ret;
                }
            }
        }
    },

    offset: {
        setOffset: function (elem, coordinates, i) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
                position = hAzzle.css(elem, "position"),
                curElem = hAzzle(elem),
                props = {};

            // Set position first, in-case top/left are set even on static elem
            if (position === "static") {
                elem.style.position = "relative";
            }

            curOffset = curElem.offset();
            curCSSTop = hAzzle.css(elem, "top");
            curCSSLeft = hAzzle.css(elem, "left");
            calculatePosition = (position === "absolute" || position === "fixed") &&
                (curCSSTop + curCSSLeft).indexOf("auto") > -1;

            // Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
            if (calculatePosition) {
                curPosition = curElem.position();
                curTop = curPosition.top;
                curLeft = curPosition.left;

            } else {
                curTop = parseFloat(curCSSTop) || 0;
                curLeft = parseFloat(curCSSLeft) || 0;
            }

            if (hAzzle.isFunction(coordinates)) {
                coordinates = coordinates.call(elem, i, curOffset);
            }

            if (coordinates.top != null) {
                props.top = (coordinates.top - curOffset.top) + curTop;
            }
            if (coordinates.left != null) {
                props.left = (coordinates.left - curOffset.left) + curLeft;
            }

            if ("using" in coordinates) {
                coordinates.using.call(elem, props);

            } else {
                curElem.css(props);
            }
        }
    },

    // Convert some pixels into another CSS unity.
    // It's used in $.style() for the += or -=.
    // * px   : Number.
    // * unit : String, like "%", "em", "px", ...
    // * elem : Node, the current element.
    // * prop : String, the CSS property.
    pixelsToUnity: function (px, unit, elem, prop) {

        if (unit === "" || unit === "px") return px; // Don't waste our time if there is no conversion to do.
        else if (unit === "em") return px / hAzzle.css(elem, "fontSize", ""); // "em" refers to the fontSize of the current element.
        else if (unit === "%") {

            if (/^(left$|right$|margin|padding)/.test(prop)) {
                prop = "width";
            } else if (/^(top|bottom)$/.test(prop)) {
                prop = "height";
            }
            elem = /^(relative|absolute|fixed)$/.test(hAzzle.css(elem, "position")) ?
                elem.offsetParent : elem.parentNode;
            if (elem) {
                prop = hAzzle.css(elem, prop, true);
                if (prop !== 0) {
                    return px / prop * 100;
                }
            }
            return 0;
        }

        if (hAzzle.pixelsToUnity.units === undefined) {
            var units = hAzzle.pixelsToUnity.units = {},
                div = document.createElement("div");
            div.style.width = "100cm";
            document.body.appendChild(div); // If we don't link the <div> to something, the offsetWidth attribute will be not set correctly.
            units.mm = div.offsetWidth / 1000;
            document.body.removeChild(div);
            units.cm = units.mm * 10;
            units.inn = units.cm * 2.54;
            units.pt = units.inn * 1 / 72;

            units.pc = units.pt * 12;
        }
        // If the unity specified is not recognized we return the value.
        unit = hAzzle.pixelsToUnity.units[unit];
        return unit ? px / unit : px;
    },


    // Globalize CSS

    css: function (elem, name, extra, styles, normalized) {

        var val;

        /**
         * If this function are called from within hAzzle.style(), we don't
         * need to normalize the name again.
         */

        if (!normalized) {

            // Normalize the name

            name = hAzzle.camelCase(name)

            // Transform to normal properties - vendor or not

            name = hAzzle.cssProps[name] || (hAzzle.cssProps[name] = vendorCheckUp(elem.style, name));

        }

        // Do we have any cssHooks available?

        var hooks = hAzzle.cssHooks[name] || hAzzle.cssHooks[name]

        // If a hook was provided get the computed value from there
        if (hooks) {
            val = hooks['get'](elem, true, extra);
        }

        // Otherwise, if a way to get the computed value exists, use that

        if (typeof val === "undefined") {

            val = curCSS(elem, name, styles);
        }

        // Convert "normal" to computed value

        if (val === "normal" && name in hAzzle.cssNormalTransform) {

            val = hAzzle.cssNormalTransform[name];
        }

        // Return, converting to number if forced or a qualifier was provided and val looks numeric

        if (extra === "" || extra) {
            num = parseFloat(val);
            return extra === true || hAzzle.isNumeric(num) ? num || 0 : val;
        }
        return val;
    },

    style: function (elem, name, value, extra) {

        // Don't set styles on text and comment nodes

        if (!elem || hAzzle.nodeType(3, elem) || hAzzle.nodeType(8, elem) || !elem.style) {
            return;
        }

        // Normalize the name

        name = hAzzle.camelCase(name)

        // Transform to normal properties - vendor or not

        name = hAzzle.cssProps[name] || (hAzzle.cssProps[name] = vendorCheckUp(elem.style, name));

        // Do we have any cssHooks available?

        var hooks = hAzzle.cssHooks[name],
            style = elem.style,
            digit = false;

        // Check if we're setting a value
        if (typeof value !== "undefined") {

            /**
             * Convert relative numbers to strings.
             * It can handle +=, -=, em or %
             */

            if (typeof value === "string" && (ret = relNum.exec(value))) {
                value = hAzzle.css(elem, name, "", "", name);
                value = hAzzle.pixelsToUnity(value, ret[3], elem, name) + (ret[1] + 1) * ret[2];

                // We are dealing with relative numbers

                digit = true;
            }

            // Make sure that null and NaN values aren't set.

            if (value === null || value !== value) {
                return;
            }

            // If a number was passed in, add 'px' to the (except for certain CSS properties)

            if (digit && !hAzzle.cssNumber[name]) {

                value += ret && ret[3] ? ret[3] : "px";
            }

            // Check for background

            if (value === "" && /background/i.test(name)) {

                style[name] = "inherit";
            }

            // If a cssHook was provided, use that value, otherwise just set the specified value

            if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
                style[name] = value;
            }

        } else {

            // Get the value from the style object
            return style[name];
        }

    }

});


hAzzle.fn.extend({

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
        if (typeof state === "boolean") {
            return state ? this.show() : this.hide();
        }
        return this.each(function () {

            if (isHidden(this)) show(this);
            else hide(this);
        });
    },

    /**
     * Get css property
     * Set css properties
     *
     * @param {String|Object} name
     * @param {String} value
     * @return {String|Object}
     */

    css: function (name, value) {
        if (typeof value === "undefined") return typeof name === 'string' ? this[0] && hAzzle.css(this[0], name) : this.each(function () {
            var elem = this;
            hAzzle.each(name, function (name, value) {
                hAzzle.style(elem, name, value);
            });
        });
        else {
            return this.each(function () {
                hAzzle.style(this, name, value);
            });
        }
    },

    /**
     * Sets the opacity for given element
     *
     * @param elem
     * @param {int} level range (0 .. 100)
     */

    setOpacity: function (value) {
        if (hAzzle.isNumber) {
            return this.each(function () {
                this.style.opacity = value / 100;
            });
        }
    },

    innerHeight: function () {
        return predefultValue(this[0], 'height', 'padding');
    },

    innerWidth: function () {
        return predefultValue(this[0], 'width', "padding");
    },

    /**
     *  ScrollTop
     */

    scrollTop: function (val) {
        var elem = this[0],
            win = getWindow(elem);
        if (val === undefined) return val ? val.pageYOffset : elem.scrollTop;
        win ? win.scrollTo(window.pageYOffset) : elem.scrollTop = val;
    },

    /**
     *  ScrollLeft
     */

    scrollLeft: function (val) {
        var elem = this[0],
            win = getWindow(elem);
        if (val === undefined) return val ? val.pageXOffset : elem.scrollLeft;
        win ? win.scrollTo(window.pageXOffset) : elem.scrollLeft = val;

    },

    offset: function (coordinates) {
        if (arguments.length) {
            return coordinates === undefined ?
                this :
                this.each(function (i) {
                    hAzzle.offset.setOffset(this, coordinates, i);
                });
        }

        var html, win,
            elem = this[0],
            box = {
                top: 0,
                left: 0
            },
            doc = elem && elem.ownerDocument;

        if (!doc) {
            return;
        }

        html = doc.documentElement;

        // Make sure it's not a disconnected DOM node
        if (!hAzzle.contains(html, elem)) {
            return box;
        }
        if (typeof elem.getBoundingClientRect !== typeof undefined) {
            box = elem.getBoundingClientRect();
        }
        win = getWindow(doc);
        return {
            top: box.top + win.pageYOffset - html.clientTop,
            left: box.left + win.pageXOffset - html.clientLeft
        };
    },

    position: function () {

        if (this.length) {

            var offsetParent, offset,
                elem = this[0],
                parentOffset = {
                    top: 0,
                    left: 0
                };

            if (hAzzle.css(elem, "position") === "fixed") {

                offset = elem.getBoundingClientRect();

            } else {

                // Get *real* offsetParent

                offsetParent = this.offsetParent();

                // Get correct offsets
                offset = this.offset();

                if (!hAzzle.nodeName(offsetParent[0], "html")) {
                    parentOffset = offsetParent.offset();
                }

                // Subtract element margins

                parentOffset.top += hAzzle.css(offsetParent[0], "borderTopWidth", true);
                parentOffset.left += hAzzle.css(offsetParent[0], "borderLeftWidth", true);
            }

            // Subtract parent offsets and element margins
            return {
                top: offset.top - parentOffset.top - hAzzle.css(elem, "marginTop", true),
                left: offset.left - parentOffset.left - hAzzle.css(elem, "marginLeft", true)
            };
        }
    },

    /**  
     * Get the closest ancestor element that is positioned.
     */

    offsetParent: function () {
        return this.map(function () {
            var offsetParent = this.offsetParent || html;
            while (offsetParent && (!hAzzle.nodeName(offsetParent, "html") && hAzzle.css(offsetParent, "position") === "static")) {
                offsetParent = offsetParent.offsetParent;
            }
            return offsetParent || html;
        });
    }
});



/**
 * Process Width and height
 */

hAzzle.each(["height", "width"], function (_, name) {
    hAzzle.fn[name] = function (value) {
        return hAzzle.isDefined(value) ? this.each(function () {
            hAzzle.style(this, name, value);
        }) : predefultValue(this[0], name, "content");
    }
});

/**
 * Process Outerwidth and Outerheight
 */

hAzzle.each({
    outerHeight: "height",
    outerWidth: "width"
}, function (name, type) {
    hAzzle.fn[name] = function (margin, value) {
        return predefultValue(this[0], type, typeof margin === "boolean" ? "margin" : "border", typeof value === true ? "margin" : "border");
    }
});



/**
 * Process scrollTop and scrollLeft
 */

hAzzle.each({
    'scrollTop': 'pageYOffset',
    'scrollLeft': 'pageXOffset'
}, function (name, dir) {
    hAzzle.fn[name] = function (val) {
        var elem = this[0],
            win = getWindow(elem);
        if (typeof val === "undefined") return val ? val[dir] : elem[name];
        win ? win.scrollTo(window[name]) : elem[name] = val;
    };
});




/***********************************************************************************
 *
 * CSS HOOKS
 *
 ***********************************************************************************/

/**
 * CSS hooks height && width
 */

hAzzle.each(["height", "width"], function (i, name) {

    hAzzle.cssHooks[name] = {
        get: function (elem, computed, extra) {
            if (computed) {
                return elem.offsetWidth === 0 && displaySwap.test(hAzzle.css(elem, "display")) ?
                    hAzzle.swap(elem, cssShow, function () {
                        return getWidthOrHeight(elem, name, extra);
                    }) :
                    getWidthOrHeight(elem, name, extra);
            }
        },

        set: function (elem, value, extra) {
            var styles = extra && getStyles(elem);
            return setPositiveNumber(value, extra ?
                augmentWidthOrHeight(
                    elem,
                    name,
                    extra,
                    hAzzle.css(elem, "boxSizing", false, styles) === "border-box",
                    styles
                ) : 0
            );
        }
    };
});


/**
 * CSS hooks - margin and padding
 */

hAzzle.each(["margin", "padding"], function (i, hook) {
    hAzzle.cssHooks[hook] = {
        get: function (elem, computed, extra) {
            return hAzzle.map(cssDirection, function (dir) {
                return hAzzle.css(elem, hook + dir);
            }).join(" ");
        },
        set: function (elem, value) {
            var parts = value.split(/\s/),
                values = {
                    "Top": parts[0],
                    "Right": parts[1] || parts[0],
                    "Bottom": parts[2] || parts[0],
                    "Left": parts[3] || parts[1] || parts[0]
                };
            hAzzle.each(cssDirection, function (i, dir) {
                elem.style[hook + dir] = values[dir];
            });
        }
    };
});

/**
 * BoxSizing
 *
 * Not fully supported in all browsers
 *
 */

var div = document.createElement("div"),
    divStyle = div.style;

hAzzle.support.boxSizing =
    divStyle.boxSizing === '' ? 'boxSizing' :
    (divStyle.MozBoxSizing === '' ? 'MozBoxSizing' :
    (divStyle.WebkitBoxSizing === '' ? 'WebkitBoxSizing' :
        (divStyle.MsBoxSizing === '' ? 'msBoxSizing' : false)));

if (hAzzle.support.boxSizing && hAzzle.support.boxSizing !== "boxSizing") {

    hAzzle.cssHooks.boxSizing = {
        get: function (elem, computed, extra) {
            return hAzzle.css(elem, hAzzle.support.boxSizing);
        },
        set: function (elem, value) {
            elem.style[hAzzle.support.boxSizing] = value;
        }
    };
}

div = divStyle = null;