// CSS
;
(function ($) {

    var doc = document,
        html = window.document.documentElement,
        background = /background/i,
        rnum = /^[\-+]?(?:\d*\.)?\d+$/i,

        cached = [],

        isFunction = $.isFunction,
        isUndefined = $.isUndefined,

        rnumsplit = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)$/i,
        cssDirection = ["Top", "Right", "Bottom", "Left"],

        cssShow = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        },
        relNum = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i;

    $.extend($, {

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

        },

        cssNormalTransform: {
            letterSpacing: "0",
            fontWeight: "400"
        },

        cssProps: {

            "float": "cssFloat"
        },

        curCSS: function (elem, name, computed) {

            var ret;

            computed = computed || elem.ownerDocument.defaultView.getComputedStyle(elem, null);

            if (computed) {

                ret = computed.getPropertyValue(name) || computed[name];

                if (ret === "" && !$.contains(elem.ownerDocument, elem)) {

                    ret = $.style(elem, name);
                }
            }
            return isUndefined(ret) ? ret + "" : ret;
        },
        css: function (element, name, extra) {

            var computed, val;

            name = $.camelCase(name);

            // Do we have any cssHooks available?

            var hooks = $.cssHooks[name];

            // If a hook was provided get the computed value from there

            if ($.cssHooks[name] && ("get" in hooks)) {

                val = hooks['get'](element, true, extra);
            }

            if (val === undefined) {

                computed = element.ownerDocument.defaultView.getComputedStyle(element, null);

                if (computed) {

                    val = computed.getPropertyValue(name) || computed[name];
                }

                if (val === "" && !$.contains(element.ownerDocument, element)) {

                    val = $.style(elem, name);
                }
            }

            if (extra === "" || extra) {
                num = parseFloat(val);
                return extra === true || $.isNumeric(num) ? num || 0 : val;
            }


            return $.isUndefined(val) ? val + "" : val;
        },

        /**
         * CSS properties accessor for an element
         */

        style: function (element, property, value, extra) {

            value = $.cssProps[value] || ($.cssProps[property] = (value in element.style ? value : $.prefix(property)) || value);

            // Do we have any cssHooks available?

            var hooks = $.cssHooks[property];

            var ret = relNum.exec(value);

            if (ret) {
				
				value = $.css(elem, name);
                value = $.pixelsToUnity(value, ret[3], elem, name) + (ret[1] + 1) * ret[2];
				
                value = (ret[1] + 1) * ret[2] + parseFloat($.css(element, property));
            }

            // If a number was passed in, add 'px' to the (except for certain CSS properties)

            if (typeof value === 'number' && !$.cssNumber[property]) {

				value += ret && ret[3] ? ret[3] : "px";
            }

            // Check for background

            if (value === "" && background.test(property)) {

                value = "inherit";
            }

            if (!hooks || !("set" in hooks) || (value = hooks.set(element, value, extra)) !== undefined) {

                element.style[(value === null || value === ' ') ? 'remove' : 'set' + 'Property'](property, '' + value)
                return element

            }
        },

        swap: function (elem, options, callback, args) {
            var ret, name,
                old = {};

            // Remember the old values, and insert the new ones
            for (name in options) {
                old[name] = elem.style[name];
                elem.style[name] = options[name];
            }

            ret = callback.apply(elem, args || []);

            // Revert the old values
            for (name in options) {
                elem.style[name] = old[name];
            }

            return ret;
        },
		
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

            if (isUndefined($.pixelsToUnity.units)) {
                var units = $.pixelsToUnity.units = {},
                    div = doc.createElement("div");
                div.style.width = "100cm";
                docbody.appendChild(div); // If we don't link the <div> to something, the offsetWidth attribute will be not set correctly.
                units.mm = div.offsetWidth / 1000;
                docbody.removeChild(div);
                units.cm = units.mm * 10;
                units.inn = units.cm * 2.54;
                units.pt = units.inn * 1 / 72;
                units.pc = units.pt * 12;
            }
            // If the unity specified is not recognized we return the value.
            unit = $.pixelsToUnity.units[unit];
            return unit ? px / unit : px;
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

            if (!$.isNull(coordinates.top)) {

                props.top = (coordinates.top - curOffset.top) + curTop;
            }
            if (!$.isNull(coordinates.left)) {

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

            if (value == null) {
                if (typeof property == 'string') {
                    return this.elems[0] && $.css(this.elems[0], property)
                }

                for (var key in property) {


                    this.each(function () {
                        $.style(this, key, property[key]);
                    });
                }
                return this;
            }
            return this.each(function (i, element) {
                $.style(element, property, value)
            })
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

            if (!this[0]) return null;

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
        },

        /**  
         * Get the closest ancestor element that is positioned.
         */

        offsetParent: function () {
            return this.map(function (elem) {
                var op = elem.offsetParent || doc.documentElement;
                while (op && (!$.nodeName(op, "html") && $.css(op, "position") === "static")) {
                    op = op.offsetParent || doc.documentElement;
                }
                return op;
            });
        }
    });



    $.each({
        "Height": "height",
        "Width": "width"
    }, function (name, type) {

        $.fn["inner" + name] = function () {

            var elem = this[0];
            return elem ?
                elem.style ?
                parseFloat($.css(elem, type, "padding")) :
                this[type]() :
                null;

        };
        $.fn["outer" + name] = function (margin) {

            var elem = this[0];
            return elem ?
                elem.style ?
                parseFloat($.css(elem, type, margin ? "margin" : "border")) :
                this[type]() :
                null;
        };
        $.fn[type] = function (size) {
            var el = this[0];
            if (!el) return size === null ? null : this;
            if (isFunction(size))
                return this.each(function (i) {
                    var self = $(this);
                    self[type](size.call(this, i, self[type]()));
                });
            if ($.isWindow(el)) {
                return el.document.documentElement["client" + name];
            } else if ($.nodeType(9, el)) {
                return Math.max(
                    el.documentElement["client" + name],
                    el.body["scroll" + name], el.documentElement["scroll" + name],
                    el.body["offset" + name], el.documentElement["offset" + name]);
            } else if (isUndefined(size)) {
                var orig = $.css(el, type),
                    ret = parseFloat(orig);
                return $.IsNaN(ret) ? orig : ret;
            } else return this.css(type, $.isString(size) ? size : size + "px");
        };
    });



    function getWH(elem, name, extra) {

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

            if (isUndefined(val)) return val ? val[dir] : elem[name];
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

    $.each(["height", "width"], function (i, name) {
        $.cssHooks[name] = {
            get: function (elem, computed, extra) {
                return (cached[elem] ? cached[elem] : cached[elem] = /^(none|table(?!-c[ea]).+)/.test($.css(elem, "display"))) && elem.offsetWidth === 0 ?
                    $.swap(elem, cssShow, function () {
                        return getWH(elem, name, extra);
                    }) :
                    getWH(elem, name, extra);
            },
            set: function (elem, value, extra) {
                var styles = extra && getStyles(elem);
                return setPositiveNumber(elem, value, extra ?
                    augmentWidthOrHeight(
                        elem,
                        name,
                        extra,
                        $.css(elem, "boxSizing", false, styles) === "border-box",
                        styles
                    ) : 0
                );
            }
        };
    });

    function setPositiveNumber(elem, value, subtract) {
        var matches = rnumsplit.exec(value);
        return matches ?
            Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") :
            value;
    }

})(hAzzle);