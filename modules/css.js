/**
 * CSS
 *
 * NOTE!! Some code here is "borrowed" from jQuery because I tried to follow the jQuery API.
 *        Even the cssHooks feature.
 *
 * Still there are minor and major differences between hAzzle API and jQuery API. Examples are many.
 * Here are a few:
 *
 * - Pixels are not rounded up or down - make the position on the screen more accurate
 * - Everything is optimized for speed
 * - Converts %, +=, -= and em to relative numbers ( jQuery only deal with +=, -=)
 *
 */
var
cssNormalTransform = {
    letterSpacing: "0",
    fontWeight: "400"
},
    cached = [],

    cssPrefixes = ["Webkit", "O", "Moz", "ms"],

    cssExpand = ["Top", "Right", "Bottom", "Left"],

    rmargin = (/^margin/),
    rnumnonpx = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$/i,
    rdisplayswap = /^(none|table(?!-c[ea]).+)/,
    pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source,
    rnumsplit = new RegExp("^(" + pnum + ")(.*)$", "i"),
    rrelNum = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i;


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

        document = elem.documentElement;

        // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
        // whichever is greatest
        return Math.max(
            elem.body["scroll" + name], document["scroll" + name],
            elem.body["offset" + name], document["offset" + name],
            document["client" + name]
        );
    }

    return hAzzle.css(elem, name, extra);
}

/*
 * Get styles
 **/

var getStyles = function (elem) {
    return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
};


function setPositiveNumber(elem, value, subtract) {
    var matches = rnumsplit.exec(value);
    return matches ?
    // Guard against undefined "subtract", e.g., when used as in cssHooks
    Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") :
        value;
}

function getWidthOrHeight(elem, name, extra) {
    var valueIsBorderBox = true,
        val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
        styles = getStyles(elem),
        isBorderBox = hAzzle.css(elem, "boxSizing", false, styles) === "border-box";
    if (val <= 0 || val === null) {
        val = curCSS(elem, name, styles);
        if (val < 0 || val === null) val = elem.style[name];
        if (rnumnonpx.test(val)) return val;
        valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]);
        val = parseFloat(val) || 0;
    }
    return val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles) + "px"
};


function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {

    var i = extra === (isBorderBox ? "border" : "content") ? 4 : name === "width" ? 1 : 0,

        val = 0;

    for (; i < 4; i += 2) {
        // both box models exclude margin, so add it if we want it
        if (extra === "margin") {
            val += hAzzle.css(elem, extra + cssExpand[i], true, styles);
        }

        if (isBorderBox) {
            // border-box includes padding, so remove it if we want content
            if (extra === "content") {
                val -= hAzzle.css(elem, "padding" + cssExpand[i], true, styles);
            }

            // at this point, extra isn't border nor margin, so remove border
            if (extra !== "margin") {
                val -= hAzzle.css(elem, "border" + cssExpand[i] + "Width", true, styles);
            }
        } else {
            // at this point, extra isn't content, so add padding
            val += hAzzle.css(elem, "padding" + cssExpand[i], true, styles);

            // at this point, extra isn't content nor padding, so add border
            if (extra !== "padding") {
                val += hAzzle.css(elem, "border" + cssExpand[i] + "Width", true, styles);
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

/*
 * Check if elem contain a spesific nodeType
 *
 * @param {Object} elem
 * @param {Return} Boolean
 */

function commonNodeTypes(elem) {
    return hAzzle.nodeType(3,elem) || hAzzle.nodeType(8,elem) ? true : false;
};

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

        if (rnumnonpx.test(ret) && rmargin.test(name)) {

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
        hAzzle.each(style, function (index, style) {
            if (style === name) return name;
        });

        // check for vendor prefixed names
        var capName = name.charAt(0).toUpperCase() + name.slice(1),
            origName = name,
            i = cssPrefixes.length;

        while (i--) {
            name = cssPrefixes[i] + capName;
            hAzzle.each(style, function (index, style) {
                if (style === name) return name;
            });
        }
        cached[style + name] = origName;

    }
    return cached[style + name];
}


hAzzle.extend({

    cssProps: {

        "float": "cssFloat"
    },

    // Don't automatically add "px" to these possibly-unitless properties
    cssNumber: {
        "columnCount": true,
        "fillOpacity": true,
        "flexGrow": true,
        "flexShrink": true,
        "fontWeight": true,
        "lineHeight": true,
        "opacity": true,
        "order": true,
        "orphans": true,
        "widows": true,
        "zIndex": true,
        "zoom": true
    },

    /**
     * cssHooks similar to hAzzle
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
        // The first time we calculate how many pixels there is in 1 meter
        // for calculate what is 1 inch/cm/mm/etc.
        if (hAzzle.pixelsToUnity.units === undefined) {
            var units = hAzzle.pixelsToUnity.units = {},
                div = document.createElement("div");
            div.style.width = "100cm";
            document.body.appendChild(div); // If we don't link the <div> to something, the offsetWidth attribute will be not set correctly.
            units.mm = div.offsetWidth / 1000;
            document.body.removeChild(div);
            units.cm = units.mm * 10;
            units. in = units.cm * 2.54;
            units.pt = units. in * 1 / 72;
            units.pc = units.pt * 12;
        }
        // If the unity specified is not recognized we return the value.
        unit = hAzzle.pixelsToUnity.units[unit];
        return unit ? px / unit : px;
    },


    // Globalize CSS

    css: function (elem, name, extra, styles) {

        var val, num, hooks, origName = hAzzle.camelCase(name);

        // Make sure that we're working with the right name
        name = hAzzle.cssProps[origName] || (hAzzle.cssProps[origName] = vendorCheckUp(elem.style, origName));

        hooks = hAzzle.cssHooks[name] || hAzzle.cssHooks[origName];

        // If a hook was provided get the computed value from there
        if (hooks && "get" in hooks) {
            val = hooks.get(elem, true, extra);
        }

        // Otherwise, if a way to get the computed value exists, use that
        if (val === undefined) {
            val = curCSS(elem, name, styles);
        }

        //convert "normal" to computed value
        if (val === "normal" && name in cssNormalTransform) {
            val = cssNormalTransform[name];
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
        if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
            return;
        }

        // Make sure that we're working with the right name
        var ret, type, hooks,
            origName = hAzzle.camelCase(name),
            style = elem.style;

        name = hAzzle.cssProps[origName] || (hAzzle.cssProps[origName] = vendorCheckUp(style, origName));

        hooks = hAzzle.cssHooks[name] || hAzzle.cssHooks[origName];

        // Check if we're setting a value
        if (value !== undefined) {
            type = typeof value;

            /**
             * Convert relative numbers to strings.
             * It can handle +=, -=, em or %
             */

            if (type === "string" && (ret = rrelNum.exec(value))) {
                value = hAzzle.css(elem, name, "");
                value = hAzzle.pixelsToUnity(value, ret[3], elem, name) + (ret[1] + 1) * ret[2];
                type = "number";
            }

            // Make sure that null and NaN values aren't set. See: #7116
            if (value === null || value !== value) {
                return;
            }

            // If a number was passed in, add 'px' to the (except for certain CSS properties)
            if (type === "number" && !hAzzle.cssNumber[origName]) {

                value += ret && ret[3] ? ret[3] : "px";
            }

            if (!hAzzle.support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
                style[name] = "inherit";
            }

            // If a hook was provided, use that value, otherwise just set the specified value
            if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
                style[name] = value;
            }

        } else {

            // Get the value from the style object
            return style[name];
        }

    }

});

/**
 * CSS hooks height && width
 */
 
hAzzle.each([ "height", "width" ], function( i, name ) {

hAzzle.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				return elem.offsetWidth === 0 && rdisplayswap.test( hAzzle.css( elem, "display" ) ) ?
					hAzzle.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					hAzzle.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};

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
        if (hAzzle.isDefined(value)) return 1 === this.length ? hAzzle.style(this[0], name, value) : this.each(function () {
            hAzzle.style(this, name, value);
        });
        if (hAzzle.isUndefined(value)) return hAzzle.isString(name) ? this[0] && hAzzle.css(this[0], name) : this.each(function () {
            var elem = this;
            hAzzle.each(name, function (name, value) {
                hAzzle.css(elem, name, value);
            });
        });
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

    /**
     * Read or write an element's height exluding margin, padding and border
     *
     * @param {Integer} value
     * @return {String}
     */

    height: function (value) {
        return hAzzle.isDefined(value) ? this.each(function () {
            hAzzle.style(this, "height", value);
        }) : predefultValue(this[0], "height", "content");
    },

    /**
     * Read an element's height including padding, border and optional margin
     *
     * @param {Boolean} includeMargin
     * @return {String}
     */
    outerHeight: function (margin) {
        return predefultValue(this[0], 'height', typeof margin === "boolean" ? "margin" : "border");
    },

    innerHeight: function () {
        return predefultValue(this[0], 'height', 'padding');
    },

    width: function (value) {
        return hAzzle.isDefined(value) ? this.each(function () {
            hAzzle.style(this, "width", value);
        }) : predefultValue(this[0], "width", "content");
    },

    /**
     * Read an element's width including padding, border and optional margin
     *
     * @param {Boolean} includeMargin
     * @return {String}
     */


    outerWidth: function (margin, value) {
        return predefultValue(this[0], 'width', typeof margin === "boolean" ? "margin" : "border", typeof value === true ? "margin" : "border");
    },

    innerWidth: function () {
        return predefultValue(this[0], 'width', "padding");
    }

});