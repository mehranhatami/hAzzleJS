// CSS
var cssNumber = 'fill-opacity font-weight line-height opacity orphans widows z-index zoom'.split(' ');

function getCSS(element, property) {
    return element.style.getPropertyValue(property) || window.getComputedStyle(element, null).getPropertyValue(property)
}

function setCSS(element, property, value) {
    // If a number was passed in, add 'px' to the (except for certain CSS properties)
    if (typeof value == 'number' && cssNumber.indexOf(property) === -1) {
        value += 'px'
    }
    var action = (value === null || value === '') ? 'remove' : 'set'
    element.style[action + 'Property'](property, '' + value)
    return element
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
  if(hAzzle.nodeTypes[3](elem) || hAzzle.nodeTypes[8](elem)) return true;
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

         *
         * @param {Boolean} state
         * @return {Object}
         */

    toggle: function (state) {

        return this.each(function () {
            if (isHidden(this)) show(this);
            else hide(this);
        });
    },

    /**
     * Get css property
     * Set css properties
     *
     * @param {String|Object} prop
     * @param {String} value
     * @return {String|Object}
     */

    css: function (property, value) {
        if (value == null) {
            if (hAzzle.isString(property)) {
                return this.elems[0] && getCSS(this.elems[0], property);
            };

            return this.each(function (element) {
                hAzzle.each(property, function (value, key) {
                    setCSS(element, key, value);
                });
            });
        }
        return this.each(function () {
            setCSS(this, property, value);
        })
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