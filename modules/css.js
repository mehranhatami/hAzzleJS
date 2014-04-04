// CSS
var

// Don't automatically add "px" to these possibly-unitless properties
cssNumber = {
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

    cached = [],

    cssProps = {
        "float": "cssFloat"
    },

    cssPrefixes = ["Webkit", "O", "Moz", "ms"];

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



/**
 * camelCase CSS string
 * - we are using our prefixCache for faster speed
 *
 * @param{String} str
 * @return{String}
 */

function camelCase(str) {

    return str.replace(/^-ms-/, "ms-").replace(/^.|-./g, function (letter, index) {
        return index === 0 ? letter.toLowerCase() : letter.substr(1).toUpperCase();
    });
}

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


hAzzle.extend({

    // Globalize CSS

    css: function (elem, name) {

        name = camelCase(name);

        // Make sure that we're working with the right name
        name = cssProps[name] || (cssProps[name] = vendorPropName(elem.style, name));

        return elem.style.getPropertyValue(name) || window.getComputedStyle(elem, null).getPropertyValue(name);
    },

    style: function (elem, name, value) {

        // If a number was passed in, add 'px' to the (except for certain CSS properties)
        if (typeof value === 'number' && cssNumber.indexOf(name) === -1) {
            value += 'px';
        }
        var action = (value === null || value === '') ? 'remove' : 'set';
        elem.style[action + 'Property'](name, '' + value);
        return elem;
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
            var el = this;
            if (commonNodeTypes(el)) {
                for (var old = {}, i = 0, prop; prop = Object.keys(props)[i]; i += 1) old[prop] = el.style[prop], el.style[prop] = props[prop];
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
            var el = this;
            if (commonNodeTypes(el)) {
                el.style.opacity = value / 100;
            }

        });
    },

    /**
     * Restores element's styles with given properties
     *
     * @param {Object} props
     */

    restoreCSS: function (props) {
        return this.each(function () {
            var el = this;
            if (commonNodeTypes(el)) {
                for (var i = 0, prop; prop = Object.keys(props)[i]; i += 1) el.style[prop] = props[prop];
            }
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
            var el = this;
            if (commonNodeTypes(el)) {
                el.style.left = parseInt(pos, 10) + 'px';
            }
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
            var el = this;
            if (commonNodeTypes(el)) {
                el.style.top = parseInt(pos, 10) + 'px';
            }
        });
    }
});