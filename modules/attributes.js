/*!
 * Attributes
 */
var win = this,
    doc = win.document,
    ssv = /\S+/g,

    // Boolean attributes

    boolAttr = {},

    // Boolean elements

    boolElem = {},

    attrCore = {},

    concat = Array.prototype.concat;

// Bug / feature detection

(function () {
    var input = doc.createElement("input"),
        select = doc.createElement("select"),
        opt = select.appendChild(doc.createElement("option"));

    input.type = "checkbox";

    // Support: iOS<=5.1, Android<=4.2+
    // Default value for a checkbox should be "on"
    attrCore['bug-checkbox'] = input.value !== "";

    // Support: IE<=11+
    // Must access selectedIndex to make default options select
    attrCore['bug-optSelected'] = opt.selected;

    // Support: IE<=11+
    // An input loses its value after becoming a radio
    input = doc.createElement("input");
    input.setAttribute("type", "radio");
    input.setAttribute("name", "t");

    attrCore['bug-radioValue'] = input.value === "t";

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

    attr: function (name, value) {
        return hAzzle.setter(this, hAzzle.attr, name, value, true);
    },

    /**
     * Remove a given attribute from an element
     *
     * @param {String} value
     * @return {hAzzle}
     */

    removeAttr: function (value) {
        return this.each(function (el) {
            hAzzle.removeAttr(el, value);
        });
    },

    /**
     * Check if  element has an attribute
     *
     * @param{String} name
     * @return {Boolean}
     */

    hasAttr: function (value, name) {
		
    // Shortcut for checking attr classNames
	
    if(typeof name !== 'undefined' && value === 'class') {
		
	   return this[0].className === name ? true : false;
	}
        if (name) {
            return typeof this.attr(name) !== 'undefined';
        }
    },

    /**
     * Toggle attributes
     *
     * @param{String} attr
     * @param{Boolean} toggle
     * @return {hAzzle}
     */

    toggleAttr: function (attr, toggle) {

        var self = this,
            args = arguments.length;

        // Do nothing if no params provided: (ie fail safely)
        if (args === 0) {

            return self;

            // When toggle arg not provided, add attribute where not present, remove it where prosent:

        } else if (args === 1) {

            return self.each(function (el) {

                hAzzle(el)[hAzzle(el).attr(attr) ? 'removeAttr' : 'addAttr'](attr, attr);
            });

            // Otherwise when both attr & toggle arguments have been provided:
        } else {

            // When toggle is a function, apply it to each element:

            if (typeof toggle === 'function') {

                return self.each(function (el) {

                    hAzzle(el)[toggle.call(el) ? 'addAttr' : 'removeAttr'](attr, attr);

                });

                // Or add attr if toggle is true, remove attr if toggle is false:
            } else {

                return self[toggle ? 'addAttr' : 'removeAttr'](attr, attr);
            }
        }
    },

    /**
     * Read or set properties of DOM elements
     *
     * @param {String/Object} name
     * @param {String/Null} value
     * @return {hAzzle}
     */

    prop: function (name, value) {
        return hAzzle.setter(this, hAzzle.prop, name, value, true);
    },

    /**
     * Toggle properties on DOM elements
     */

    toggleProp: function (prop) {
        return this.each(function (el) {
            return el.prop(prop, !el.prop(prop));
        });
    },

    /*
     * Remove properties from DOM elements
     *
     * @param {String} name
     * @return {hAzzle}
     */

    removeProp: function (name) {
        return this.each(function () {
            delete this[hAzzle.propFix[name] || name];
        });
    }
});


// Extend the globale hAzzle Object

hAzzle.extend({

    propHooks: {

        tabIndex: {
            get: function (elem) {
                return elem.hasAttribute('tabindex') ||
                    /^(?:input|select|textarea|button)$/i.test(elem.nodeName) ||
                    elem.href ? elem.tabIndex : -1;
            }
        }
    },

    propFix: {
        'for': 'htmlFor',
        'class': 'className'
    },

    nodeHook: {},

    boolHook: {

        set: function (elem, value, name) {
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
            set: function (elem, value) {

                if (!attrCore['bug-radioValue'] && value === 'radio' &&
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
     * Remove attributes for each element in a collection
     *
     * @param {Object} el
     * @param {Array|string} value
     */

    removeAttr: function (el, value) {

        var name, propName, i = 0,

            keys = typeof value == 'string' ?

            // string

            value.match(ssv) :

            // merge arrays

            concat(value),

            l = keys.length;

        for (; i < l; i++) {

            name = keys[i];

            propName = hAzzle.propFix[name] || name;

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
     * @param {string|String|Object} name
     * @param {string|boolean|null} value
     */    

    attr: function (elem, name, value) {

        var hooks, ret,
            valid = [2, 3, 8],
            nType = elem.nodeType;

        if (elem && (valid[nType])) {

            // Fallback to prop when attributes are not supported
            if (typeof elem.getAttribute === undefined) {
                return hAzzle.prop(elem, name, value);
            }

            if (nType !== 1 || hAzzle.documentIsHTML) {

                name = name.toLowerCase();

                hooks = hAzzle.attrHooks[name] ||
                    getBooleanAttrName(elem, name) ? hAzzle.boolHook : hAzzle.nodeHook;
            }

            if (value !== undefined) {

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

            } else {

                if (hooks && 'get' in hooks) {
                    ret = hooks.get(elem, name);
                    if (ret !== null) {
                        return ret;
                    }
                }
                ret = elem.getAttribute(name, 2);

                return ret === null ?
                    undefined :
                    ret;

            }
        }
    },

    // Props to jQuery

    prop: function (elem, name, value) {

        var ret, hooks,
            nType = elem.nodeType;

        // don't get/set properties on text, comment and attribute nodes
        if (!elem || nType === 2 || nType === 3 || nType === 8) {
            return;
        }

        if (nType !== 1 || hAzzle.documentIsHTML) {

            // Fix name and attach hooks
            name = hAzzle.propFix[name] || name;
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
	 
	anyAttr: function (elem, fn, scope) {

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

if (!attrCore['bug-optSelected']) {
    hAzzle.propHooks.selected = {
        get: function (elem) {
            var parent = elem.parentNode;
            if (parent && parent.parentNode) {
                parent.parentNode.selectedIndex;
            }
            return null;
        }
    };
}

// Boolean attributes and elements

hAzzle.each(('multiple selected checked disabled readOnly required async autofocus ' +
    'autoplay controls defer hidden ismap loop scoped open').split(' '), function (value) {
    boolAttr[value] = value;
});

hAzzle.each('input select option textarea button form details'.split(' '), function (value) {
    boolElem[value.toUpperCase()] = true;
});