/*!
 * attributes.js
 */
 
var doc = this.document,
    ssv = /\S+/g,
    inseteb = /^(?:input|select|textarea|button)$/i,
    boolAttr = {}, // Boolean attributes
    boolElem = {}, // Boolean elements
    attrSupport = {},

    concat = Array.prototype.concat,

    // Booleans

    bools = [
        'multiple', 'selected', 'checked', 'disabled', 'readOnly', 'required',
        'async', 'autofocus', 'compact', 'nowrap', 'declare', 'noshade',
        'noresize', 'defaultChecked', 'autoplay', 'controls', 'defer',
        'hidden', 'ismap', 'loop', 'scoped', 'open'
    ];

/* ============================ BUG / FEATURE DETECTION =========================== */

(function() {
    var input = doc.createElement('input'),
        select = doc.createElement('select'),
        opt = select.appendChild(doc.createElement('option'));

    input.type = 'checkbox';

    attrSupport['bug-checkbox'] = input.value !== '';

    // Support: IE<=11+
    // Must access selectedIndex to make default options select
    attrSupport['bug-optSelected'] = opt.selected;

    // Support: IE<=11+
    // An input loses its value after becoming a radio
    input = doc.createElement('input');
    input.setAttribute('type', 'radio');
    input.setAttribute('name', 't');

    attrSupport['bug-radioValue'] = input.value === 't';

})();

hAzzle.extend({

    /**
     * Get / set attribute value
     *
     * @param {String} name
     * @param {String|Object} value
     *
     * @return {Object|String}
     */

    attr: function(name, value) {
        return hAzzle.setter(this, hAzzle.attr, name, value, arguments.length > 1);
    },

    /**
     * Remove a given attribute from an element
     *
     * @param {String} value
     * @return {hAzzle}
     */

    removeAttr: function(value) {
        return this.each(function() {
            hAzzle.removeAttr(this, value);
        });
    },

    /**
     * Check if  element has an attribute
     *
     * @param{String} name
     * @return {Boolean}
     */

    hasAttr: function(name) {
        return name && typeof this.attr(name) !== 'undefined';
    },

    /**
     * Read or set properties of DOM elements
     *
     * @param {String/Object} name
     * @param {String/Null} value
     * @return {hAzzle}
     */

    prop: function(name, value) {
        return hAzzle.setter(this, hAzzle.prop, name, value, arguments.length > 1);
    },

    /**
     * Toggle properties on DOM elements
     */

    toggleProp: function(prop) {
        return this.each(function() {
            return this.prop(prop, !this.prop(prop));
        });
    },

    /*
     * Remove properties from DOM elements
     *
     * @param {String} name
     * @return {hAzzle}
     */

    removeProp: function(name) {
        return this.each(function() {
            delete this[hAzzle.propMap[name] || name];
        });
    }
});

hAzzle.extend({

    // properties renamed to avoid clashes with reserved words

    propMap: {},

    nodeHook: {},

    propHooks: {

        tabIndex: {
            get: function(elem) {
                return elem.hasAttribute('tabindex') ||
                    inseteb.test(elem.nodeName) ||
                    elem.href ? elem.tabIndex : -1;
            }
        }
    },

    boolHook: {

        set: function(elem, value, name) {

            if (value === false) {
                // Remove boolean attributes when set to false
                hAzzle.removeAttr(elem, name);

            } else {

                elem.setAttribute(name, name);
            }

            return name;
        }

    },
    attrHooks: {

        type: {
            set: function(elem, value) {

                if (!attrSupport['bug-radioValue'] &&
                    value === 'radio' &&
                    hAzzle.nodeName(elem, 'input')) {

                    var val = elem.value;

                    elem.setAttribute('type', value);

                    if (val) {

                        elem.value = val;
                    }

                    return value;
                }
            }
        }
    },

    /**
     * Removes an attribute from an HTML element
     *
     * @param {Object} el
     * @param {Array|string} value
     */

    removeAttr: function(el, value) {

        var name, propName, i = 0,

            keys = typeof value == 'string' ?

            // string

            value.match(ssv) :

            // merge arrays

            concat(value),

            l = keys.length;

        for (; i < l; i++) {

            name = keys[i];

            propName = hAzzle.propMap[name] || name;

            if (getBooleanAttrName(el, name)) {

                el[propName] = false;

            } else {

                el.removeAttribute(name);
            }
        }
    },

    /**
     * Set / Get attributes
     *
     * @param {Object} elem
     * @param {String|String|Object} name
     * @param {String|Boolean|Null} value
     */

    attr: function(elem, name, value) {

        var hooks, ret,
            nType = elem.nodeType;

        if (!elem || nType === 2 || nType === 3 || nType === 8) {

            return;
        }

        if (!elem.getAttribute) {

            return hAzzle.prop(elem, name, value);
        }

        if (nType !== 1 || hAzzle.isXML(elem)) {

            name = name.toLowerCase();

            hooks = hAzzle.attrHooks[name] ||
                getBooleanAttrName(elem, name) ? hAzzle.boolHook : hAzzle.nodeHook;
        }

        // Get attribute

        if (value === undefined) {

            // Set document vars if needed
            if ((elem.ownerDocument || elem) !== document) {

                hAzzle.setDocument(elem);

            }

            if (hooks && 'get' in hooks) {
                ret = hooks.get(elem, name);
                if (ret !== null) {
                    return ret;
                }
            }

            ret = !hAzzle.documentIsHTML ? elem.getAttribute(name, 2) :

                ret = elem.getAttribute(name, 2);

            return ret === null ?
                undefined :
                ret;

            // Set attribute

        }
        if (value === null) {

            hAzzle.removeAttr(elem, name);

        } else {

            if (hooks && 'set' in hooks) {

                ret = hooks.set(elem, value, name);

                if (ret) {

                    return ret;
                }
            }

            elem.setAttribute(name, value + '');
            return value;
        }
    },

    // Props to jQuery

    prop: function(elem, name, value) {

        var ret, hooks,
            nType = elem.nodeType;

        // don't get/set properties on text, comment and attribute nodes
        if (!elem || nType === 2 || nType === 3 || nType === 8) {
            return;
        }

        if (nType !== 1 || hAzzle.documentIsHTML) {

            // Fix name and attach hooks
            name = hAzzle.propMap[name] || name;
            hooks = hAzzle.propHooks[name];
        }

        if (typeof value !== 'undefined') {

            return hooks && 'set' in hooks && (ret = hooks.set(elem, value, name)) !== undefined ?
                ret :
                (elem[name] = value);

        } else {

            return hooks && 'get' in hooks && (ret = hooks.get(elem, name)) !== null ?
                ret :
                elem[name];
        }
    },

    /**
     * Count (or iterate) an element's attributes.
     *
     * @param {Object} elem
     * @param {Function|number} fn
     * @param {String} scope
     * @return {Number}
     */

    anyAttr: function(elem, fn, scope) {

        var a, ela = elem.attributes,
            l = ela && ela.length,
            i = 0;

        if (typeof fn !== 'function') {
            return +l || 0;
        }

        scope = scope || elem;

        while (i < l) {
            if (fn.call(scope, (a = ela[i++]).value, a.name, a)) {
                return i;
            }
        }
        return 0;
    }

}, hAzzle);

/* =========================== PRIVATE FUNCTIONS ========================== */

// Get names on the boolean attributes

function getBooleanAttrName(element, name) {
    // check dom last since we will most likely fail on name
    var booleanAttr = boolAttr[name.toLowerCase()];
    // booleanAttr is here twice to minimize DOM access
    return booleanAttr && boolElem[element.nodeName] && booleanAttr;
}

/* =========================== INTERNAL ========================== */

// Support: IE9+

if (!attrSupport['bug-optSelected']) {
    hAzzle.propHooks.selected = {
        get: function(elem) {
            var parent = elem.parentNode;
            if (parent && parent.parentNode) {
                parent.parentNode.selectedIndex;
            }
            return null;
        }
    };
}

// Boolean attributes and elements

hAzzle.each(bools, function() {
    boolAttr[this] = this;
});

hAzzle.each(['input', 'select', 'option', 'textarea', 'button', 'form', 'details'], function() {
    boolElem[this.toUpperCase()] = true;
});

hAzzle.each(['htmlFor', 'className', 'cellPadding', 'cellSpacing', 'maxLength', 'rowSpan',
    'colSpan', 'useMap', 'frameBorder', 'contentEditable', 'textContent', 'valueType',
    'tabIndex', 'readOnly', 'type', 'accessKey', 'tabIndex'
], function() {
    hAzzle.propMap[this.toLowerCase()] = this;
});