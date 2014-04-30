// CSS
;
(function ($) {

    var html = window.document.documentElement,
        doc = document,
        docbody = doc.body,
        important = /\s+(!important)/g,
        background = /background/i,
        numberOrPx = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$/i,
        rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,
        margin = (/^margin/),
        relNum = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i,
        cssDirection = ["Top", "Right", "Bottom", "Left"],

        isFunction = $.isFunction;

    /**
     * Dasherize the name
     *
     * NOTE!! This is 'ONLY' used when we are using the
     * the slower cssText because of the '!Important' property
     *
     */

    function dasherize(str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase();
    }

    // Extend the $ object

    $.extend({


        cssNumber: {
            'column-count': 1,
            'columns': 1,
            'font-weight': 1,
            'line-height': 1,
            'opacity': 1,
            'z-index': 1,
            'zoom': 1
        },

        cssHooks: {

            opacity: {
                get: function (elem, computed) {
                    if (computed) {
                        // We should always get a number back from opacity
                        var ret = $.curCSS(elem, "opacity");
                        return ret === "" ? "1" : ret;
                    }
                }
            }

        },

        cssNormalTransform: {
            letterSpacing: "0",
            fontWeight: "400"
        },

        cssProps: {

            "float": "cssFloat"
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
                elem = /^(relative|absolute|fixed)$/.test($.css(elem, "position")) ?
                    elem.offsetParent : elem.parentNode;
                if (elem) {
                    prop = $.css(elem, prop, true);
                    if (prop !== 0) {
                        return px / prop * 100;
                    }
                }
                return 0;
            }

            if ($.pixelsToUnity.units === undefined) {
                var units = $.pixelsToUnity.units = {},
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
            unit = $.pixelsToUnity.units[unit];
            return unit ? px / unit : px;
        },

	    curCSS: function(elem, name, computed) {

        var ret,
            style = elem.style;

        computed = computed || elem.ownerDocument.defaultView.getComputedStyle(elem, null);

        if (computed) {

            var ret = computed.getPropertyValue(name) || computed[name];

            if (ret === "" && !$.contains(elem.ownerDocument, elem)) {
                ret = $.style(elem, name);
            }
        }
        return $.isUndefined(ret) ? ret + "" : ret;
    },

        // Globalize CSS

        css: function (elem, name, extra, styles, normalized) {

            var val,
                num,
                style = elem.style;
            /**
             * If this function are called from within hAzzle.style(), we don't
             * need to normalize the name again.
             */

            if (!normalized) {

                // Normalize the name

                name = $.camelCase(name);

                // Transform to normal properties - vendor or not

                name = $.cssProps[name] || ($.cssProps[name] = (name in style ? name : $.prefix(name)));

            }

            // Do we have any cssHooks available?

            var hooks = $.cssHooks[name];

            // If a hook was provided get the computed value from there

            if (hooks) {

                val = hooks['get'](elem, true, extra);
            }

            // Otherwise, if a way to get the computed value exists, use that

            if (val === undefined) {

                val = $.curCSS(elem, name, styles, style);
            }

            // Convert "normal" to computed value

            if (val === "normal" && name in $.cssNormalTransform) {
                val = $.cssNormalTransform[name];
            }

            // Return, converting to number if forced or a qualifier was provided and val looks numeric

            if (extra === "" || extra) {
                num = parseFloat(val);
                return extra === true || $.isNumeric(num) ? num || 0 : val;
            }

            return val;
        },

        /**
         * CSS properties accessor for an element
         */

        style: function (elem, name, value, extra, hook) {

            // Don't set styles on text and comment nodes

            if (!elem || $.nodeType(3, elem) || $.nodeType(8, elem)) {

                return;
            }

            var style = elem.style,
                hooks = '',
                ret,
                digit = false;

            if (!style) {

                return;
            }

            name = $.cssProps[name] || ($.cssProps[name] = (name in style ? name : $.prefix(name)) || name);

            if (extra) {

                name = dasherize(name);

            } else { // Normalize the name

                name = $.camelCase(name);
            }

            // Do we have any cssHooks available?

            hooks = hook || $.cssHooks[name];

            /**
             * Convert relative numbers to strings.
             * It can handle +=, -=, em or %
             */

            if (typeof value === "string" && (ret = relNum.exec(value))) {
                value = $.css(elem, name, "", "", name);
                value = $.pixelsToUnity(value, ret[3], elem, name) + (ret[1] + 1) * ret[2];

                // We are dealing with relative numbers, set till true

                digit = true;
            }

            // Make sure that null and NaN values aren't set.

            if (value === null || value !== value) {
                return;
            }

            // If a number was passed in, add 'px' to the (except for certain CSS properties)

            if (digit && !$.cssNumber[name]) {

                value += ret && ret[3] ? ret[3] : "px";
            }

            // Check for background

            if (value === "" && background.test(name)) {

                if (extra) {

                    return name + ":" + "inherit";
                }

                style[name] = "inherit";
            }

            if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {

                if (extra) {

                    return name + ":" + value;
                }

                style[name] = value;
            }

            if (extra) {

                return name + ":" + value;
            }

            style[name] = value;

        },


        setOffset: function (elem, coordinates, i) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
                position = $.css(elem, "position"),
                curElem = $(elem),
                props = {};

            // Set position first, in-case top/left are set even on static elem
            if (position === "static") {
                elem.style.position = "relative";
            }

            curOffset = curElem.offset();
            curCSSTop = $.css(elem, "top");
            curCSSLeft = $.css(elem, "left");
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

            if (isFunction(coordinates)) {
                coordinates = coordinates.call(elem, i, curOffset);
            }

            if (coordinates.top !== null) {
                props.top = (coordinates.top - curOffset.top) + curTop;
            }
            if (coordinates.left !== null) {
                props.left = (coordinates.left - curOffset.left) + curLeft;
            }

            if ("using" in coordinates) {
                coordinates.using.call(elem, props);

            } else {
                curElem.css(props);
            }
        }
    });


    $.extend($.fn, {

        css: function (property, value) {

            if (arguments.length === 1) {

                if (typeof property === 'string') {

                    return this[0] && $.css(this[0], property);
                }

                for (var key in property) {

                    this.each(function () {

                        // !Important property check

                        if (important.test(property[key])) {

                            this.style.cssText += $.style(this, key, property[key], true);

                        } else {

                            $.style(this, key, property[key]);
                        }
                    });
                }

            } else {

                return this.each(function () {

                    // !Important property check

                    if (important.test(value)) {

                        this.style.cssText += $.style(this, property, value, true);

                    } else {

                        $.style(this, property, value);
                    }
                });
            }
        },

        /**
         * Sets the opacity for given element
         *
         * @param {elem}
         * @param {int} level range (0 .. 100)
         */

        setOpacity: function (value) {
            if ($.isNumber) {
                return this.each(function () {
                    this.style.opacity = value / 100;
                });
            }
        },

        /**
         * Calculates offset of the current element
         * @param{coordinates}
         * @return object with left, top, bottom, right, width and height properties
         */

        offset: function (coordinates) {

            if (arguments.length) {
                return coordinates === undefined ?
                    this :
                    this.each(function (i) {
                        $.setOffset(this, coordinates, i);
                    });
            }

            var elem = this[0],
                _win,
                clientTop = html.clientTop,
                clientLeft = html.clientLeft,
                doc = elem && elem.ownerDocument;

            if (!doc) {

                return;

            }

            _win = $.isWindow(doc) ? doc : $.nodeType(9, doc) && doc.defaultView;

            var scrollTop = _win.pageYOffset || html.scrollTop,
                scrollLeft = _win.pageXOffset || html.scrollLeft,
                boundingRect = {
                    top: 0,
                    left: 0
                };

            if (elem && elem.ownerDocument) {

                // Make sure it's not a disconnected DOM node

                if (!$.contains(html, elem)) {
                    return boundingRect;
                }

                if (typeof elem.getBoundingClientRect !== typeof undefined) {
                    boundingRect = elem.getBoundingClientRect();
                }

                return {
                    top: boundingRect.top + scrollTop - clientTop,
                    left: boundingRect.left + scrollLeft - clientLeft,
                    right: boundingRect.right + scrollLeft - clientLeft,
                    bottom: boundingRect.bottom + scrollTop - clientTop,
                    width: boundingRect.right - boundingRect.left,
                    height: boundingRect.bottom - boundingRect.top
                };
            }
        },

        position: function () {

            if (this.length) {

                var offsetParent, offset,
                    elem = this[0],
                    parentOffset = {
                        top: 0,
                        left: 0
                    };

                if ($.css(elem, "position") === "fixed") {

                    offset = elem.getBoundingClientRect();

                } else {

                    // Get *real* offsetParent

                    offsetParent = this.offsetParent();

                    // Get correct offsets
                    offset = this.offset();

                    if (!$.nodeName(offsetParent[0], "html")) {
                        parentOffset = offsetParent.offset();
                    }

                    // Subtract element margins

                    parentOffset.top += $.css(offsetParent[0], "borderTopWidth", true);
                    parentOffset.left += $.css(offsetParent[0], "borderLeftWidth", true);
                }

                // Subtract parent offsets and element margins
                return {
                    top: offset.top - parentOffset.top - $.css(elem, "marginTop", true),
                    left: offset.left - parentOffset.left - $.css(elem, "marginLeft", true)
                };
            }
        },

        /**  
         * Get the closest ancestor element that is positioned.
         */

        offsetParent: function () {
            return this.map(function (elem) {
                var offsetParent = elem.offsetParent || html;
                while (offsetParent && (!$.nodeName(offsetParent, "html") && $.css(offsetParent, "position") === "static")) {
                    offsetParent = offsetParent.offsetParent;
                }
                return offsetParent || html;
            });
        }

    });

    // Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
    $.each(["Height", "Width"], function (i, name) {

        var type = name.toLowerCase();

        // innerHeight and innerWidth
        $.fn["inner" + name] = function () {
            var elem = this[0];
            return elem ?
                elem.style ?
                parseFloat($.css(elem, type, "padding")) :
                this[type]() :
                null;
        };

        // outerHeight and outerWidth

        $.fn["outer" + name] = function (margin) {
            var elem = this[0];
            return elem ?
                elem.style ?
                parseFloat($.css(elem, type, margin ? "margin" : "border")) :
                this[type]() :
                null;
        };

        $.fn[type] = function (value) {

            if (isFunction(value)) {
                return this.each(function (i) {
                    var self = $(this);
                    self[type](value.call(this, i, self[type]()));
                });
            }

            var elem = this[0],
                _doc;

            if ($.isWindow(elem)) {
                return elem.document.documentElement["client" + name];
            }

            // Get document width or height

            if ($.nodeType(9, elem)) {

                _doc = elem.documentElement;

                // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest

                return Math.max(
                    elem.body["scroll" + name], _doc["scroll" + name],
                    elem.body["offset" + name], _doc["offset" + name],
                    _doc["client" + name]
                );

                // Get or set width or height on the element
            } else if ($.isUndefined(value)) {

                return parseFloat($.css(elem, type));

                // Set the width or height on the element (default to pixels if value is unitless)
            } else {

                // Set the width or height on the element
                $.style(elem, type, value);
            }
            return this;

        };

    });

    $.each(["height", "width"], function (i, name) {

        $.cssHooks[name] = {

            displaySwap: /^(none|table(?!-c[ea]).+)/,
            numsplit: /^([\-+]?(?:\d*\.)?\d+)(.*)$/i,

            cssShow: {
                position: "absolute",
                visibility: "hidden",
                display: "block"
            },

            get: function (elem, computed, extra) {

                if (computed) {
                    if (elem.offsetWidth === 0 && this.displaySwap.test(hAzzle.css(elem, "display"))) {

                        var ret, name,
                            old = {};

                        // Remember the old values, and insert the new ones
                        for (name in this.cssShow) {
                            old[name] = elem.style[name];
                            elem.style[name] = this.cssShow[name];
                        }

                        ret = getWH(elem);

                        // Revert the old values
                        for (name in this.cssShow) {
                            elem.style[name] = old[name];
                        }

                        return ret;

                    } else {

                        getWH(elem, name, extra);
                    }

                }
            },

            setPositiveNumber: function (value, subs) {
                var matches = this.numsplit.exec(value);
                return matches ? Math.max(0, matches[1] - (subs || 0)) + (matches[2] || "px") : value;
            },

            set: function (elem, value, extra) {
                
                var styles = extra && elem.ownerDocument.defaultView.getComputedStyle(elem, null);
                return this.setPositiveNumber(value, extra ?
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


    function getWH(elem, name, extra) {

        // Start with offset property, which is equivalent to the border-box value
        var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
            valueIsBorderBox = true,
            isBorderBox = $.support.boxSizing && $.css(elem, "boxSizing") === "border-box";

        if (val <= 0) {
            // Fall back to computed then uncomputed css if necessary
            val = $.curCSS(elem, name);
            if (val < 0 || val === null) {
                val = elem.style[name];
            }

            // Computed unit is not pixels. Stop here and return.
            if (rnumnonpx.test(val)) {
                return val;
            }

            // we need the check for style in case a browser which returns unreliable values
            // for getComputedStyle silently falls back to the reliable elem.style
            valueIsBorderBox = isBorderBox && ($.support.boxSizingReliable || val === elem.style[name]);

            // Normalize "", auto, and prepare for extra
            val = parseFloat(val) || 0;
        }

        // use the active box-sizing model to add/subtract irrelevant styles
        return (val +
            augmentWidthOrHeight(
                elem,
                name,
                extra || (isBorderBox ? "border" : "content"),
                valueIsBorderBox
            )
        ) + "px";
    }

    function augmentWidthOrHeight(elem, name, extra, isBorderBox) {

        var i = extra === (isBorderBox ? "border" : "content") ? 4 : name === "width" ? 1 : 0,
            val = 0;

        for (; i < 4; i += 2) {

            if (extra === "margin") {
                val += $.css(elem, extra + cssDirection[i], true);
            }
            if (isBorderBox) {
                // border-box includes padding, so remove it if we want content
                if (extra === "content") {
                    val -= parseFloat($.curCSS(elem, "padding" + cssDirection[i])) || 0;
                }

                if (extra !== "margin") {
                    val -= parseFloat($.curCSS(elem, "border" + cssDirection[i] + "Width")) || 0;
                }
            } else {
                // at this point, extra isnt content, so add padding
                val += parseFloat($.curCSS(elem, "padding" + cssDirection[i])) || 0;

                // at this point, extra isnt content nor padding, so add border
                if (extra !== "padding") {
                    val += parseFloat($.curCSS(elem, "border" + cssDirection[i] + "Width")) || 0;
                }
            }
        }

        return val;
    }

    /**
     * Process scrollTop and scrollLeft
     */

    $.each({
        'scrollTop': 'pageYOffset',
        'scrollLeft': 'pageXOffset'
    }, function (name, dir) {
        $.fn[name] = function (val) {
            var elem = this[0],
                win = $.isWindow(elem) ? elem : $.nodeType(9, elem) && elem.defaultView;

            if (typeof val === "undefined") return val ? val[dir] : elem[name];
            win ? win.scrollTo(window[name]) : elem[name] = val;
        };
    });


    /**
     * CSS hooks - margin and padding
     */

    $.each(["margin", "padding"], function (i, hook) {
        $.cssHooks[hook] = {
            get: function (elem, computed, extra) {
                return $.map(cssDirection, function (dir) {
                    return $.css(elem, hook + dir);
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
                $.each(cssDirection, function (i, dir) {
                    elem.style[hook + dir] = values[dir];
                });
            }
        };
    });

})(hAzzle);