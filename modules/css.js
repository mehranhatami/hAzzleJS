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

function getCSS(elem, name) {

    name = hAzzle.camelCase(name);

    // Make sure that we're working with the right name
    name = cssProps[name] || (cssProps[name] = vendorPropName(elem.style, name));

    return elem.style.getPropertyValue(name) || window.getComputedStyle(elem, null).getPropertyValue(name);
}

function setCSS(element, name, value) {
    // If a number was passed in, add 'px' to the (except for certain CSS properties)
    if (typeof value === 'number' && cssNumber.indexOf(name) === -1) {
        value += 'px';
    }
    var action = (value === null || value === '') ? 'remove' : 'set';
    element.style[action + 'Property'](name, '' + value);
    return element;
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
    var _display = getCSS(elem, 'display');
    if (_display !== 'none') {
        hAzzle.data(elem, '_display', _display);
    }
    setCSS(elem, 'display', 'none');
}

function show(elem) {

    return setCSS(elem, 'display', hAzzle.data(elem, '_display') || 'block');
}

function commonNodeTypes(elem) {
    if (hAzzle.nodeTypes[3](elem) || hAzzle.nodeTypes[8](elem)) return true;
    return false;
}



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

        if (hAzzle.isUndefined(value)) {
            if (hAzzle.isString(name)) {
                return this[0] && getCSS(this[0], name);
            }

            // Object

            return this.each(function () {
                var element = this;
                hAzzle.each(name, function (key, value) {
                    setCSS(element, key, value);
                });
            });
        }

        return this.each(function () {
            setCSS(this, name, value);
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
                for (var old = {}, i = 0, prop; prop = nativeKeys(props)[i]; i += 1) old[prop] = el.style[prop], el.style[prop] = props[prop];
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
                for (var i = 0, prop; prop = nativeKeys(props)[i]; i += 1) el.style[prop] = props[prop];
            }
        });
    },

    /**
     * Finds the Left position of an element
     * to the entire document
     *
     * @param elem
     * @returns {Number}
     */
    pageX: function (elem) {
        var el = this[0];
        return el.offsetParent ? el.offsetLeft + this.pageX(el.offsetParent) : el.offsetLeft;
    },

    /**
     * Finds the Top position of an element
     * to the entire document
     *
     * @param elem
     * @returns {Number}
     */

    pageY: function (elem) {
        var el = this[0];
        return el.offsetParent ? el.offsetTop + this.pageX(el.offsetParent) : el.offsetTop;
    },

    /**
     * Finds the Horizontal position of an element within its parent
     *
     * @param elem
     * @returns {Number}
     */

    parentX: function (elem) {
        var el = this[0];
        return el.offsetParent === el.parentNode ? el.offsetLeft : doc.css.pageX(el) - doc.pageX(el.parentNode);
    },

    /**
     * Finds the Vertical position of an element within its parent
     *
     * @param elem
     * @returns {Number}
     */

    parentY: function (elem) {
        var el = this[0];
        return el.offsetParent === el.parentNode ? el.offsetTop : doc.pageY(elem) - doc.pageY(el.parentNode);
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
                el.style.left = parseNum(pos) + 'px';
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
                el.style.top = parseNum(pos) + 'px';
            }
        });
    },

});