// CSS
var

cssNormalTransform = {
    letterSpacing: "0",
    fontWeight: "400"
},

    cached = [],

    cssPrefixes = ["Webkit", "O", "Moz", "ms"],

    rmargin = (/^margin/),
    rnumnonpx = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$/i,
    rrelNum = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i;



/**
 * Check if an element is hidden
 *  @return {Boolean}
 */

function isHidden(elem, el) {
    elem = el || elem;
    return elem.style.display === "none";
}

function hide(elem) {
    var _display = hAzzle.css(elem, 'display');
    if (_display !== 'none') {
        hAzzle.data(elem, '_display', _display);
    }
    hAzzle.style(elem, 'display', 'none');
}

function show(elem) {

    return hAzzle.style(elem, 'display', hAzzle.data(elem, '_display') || 'block');
}

function commonNodeTypes(elem) {
    if (hAzzle.nodeTypes[3](elem) || hAzzle.nodeTypes[8](elem)) return true;
    return false;
}

function curCSS(elem, name, computed) {
    var width, minWidth, maxWidth, ret,
        style = elem.style;

    computed = computed || elem.ownerDocument.defaultView.getComputedStyle(elem, null);

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

    return ret !== undefined ?
        ret + "" :
        ret;
}


function vendorPropName(style, name) {
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

    // Convert some pixels into another CSS unity.
    // It's used in $.style() for the += or -=.
    // * px   : Number.
    // * unit : String, like "%", "em", "px", ...
    // * elem : Node, the current element.
    // * prop : String, the CSS property.
    pixelsToUnity: function (px, unit, elem, prop) {
        switch (unit) {
        case "":
        case "px":
            return px; // Don't waste our time if there is no conversion to do.
        case "em":
            return px / hAzzle.css(elem, "fontSize", ""); // "em" refers to the fontSize of the current element.
        case "%":
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

        var val, num, origName = hAzzle.camelCase(name);

        // Make sure that we're working with the right name
        name = hAzzle.cssProps[origName] || (hAzzle.cssProps[origName] = vendorPropName(elem.style, origName));

        val = curCSS(elem, name, styles);

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
        var ret, type
            origName = hAzzle.camelCase(name),
            style = elem.style;

        name = hAzzle.cssProps[origName] || (hAzzle.cssProps[origName] = vendorPropName(style, origName));

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
            style[name] = value;

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

    toggle: function () {

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
        if (value !== undefined) return 1 === this.length ? hAzzle.style(this[0], name, value) : this.each(function () {
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
     * Reset styles with given, remember old ones and return them
     * @param {Object} props
     * @returns {Object}
     */

    resetCSS: function (props) {
        return this.each(function () {
            if (commonNodeTypes(this)) {
                for (var old = {}, i = 0, prop; prop = Object.keys(props)[i]; i += 1) old[prop] = this.style[prop], this.style[prop] = props[prop];
                return old;
            }
        });
    },

    /**
     * Sets the opacity for given element
     *
     * @param elem
     * @param {int} level range (0 .. 100)
     */

    setOpacity: function (value) {
        return this.each(function () {
            commonNodeTypes(this) && (this.style.opacity = value / 100);
        });
    },

    /**
     * Restores element's styles with given properties
     *
     * @param {Object} props
     */

    restoreCSS: function (props) {
        return this.each(function () {
            if (commonNodeTypes(this))
                for (var i = 0, prop; prop = Object.keys(props)[i]; i += 1) this.style[prop] = props[prop];
        });
    },

    /**
     * Sets element's horizontal postion
     *
     * @param elem
     * @param pos
     */
    setX: function (pos) {
        return this.each(function () {
            commonNodeTypes(this) && (this.style.left = parseInt(pos, 10) + "px");
        });
    },

    /**
     * Sets element's vertical postion
     *
     * @param elem
     * @param pos
     */
    setY: function (pos) {
        return this.each(function () {
            commonNodeTypes(this) && (this.style.top = parseInt(pos, 10) + "px");
        });
    }
});