// attributes.js
var doc = this.document,
    ssv = /\S+/g,
    inseteb = /^(?:input|select|textarea|button)$/i,
    SVGAttributes = "width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2",
    boolAttr = hAzzle.boolAttr, // Boolean attributes
    boolElem = hAzzle.boolElem; // Boolean elements

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
        return this.each(function(elem) {
            return elem.prop(prop, !elem.prop(prop));
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

hAzzle.propMap = hAzzle.nodeHook = {
    'class': 'className',
    'for': 'htmlFor'
};

hAzzle.extend({

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

                if (!hAzzle.features['bug-radioValue'] &&
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

            // String

            value.match(ssv) :

            // Merge arrays

            concat(value),

            l = keys.length;

        for (; i < l; i++) {

            name = keys[i];

            // Get the properties

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

        var hooks, ret, notxml,
            nType = elem.nodeType;

        if (!elem || nType === 3 || nType === 8 || nType === 2) {
            return;
        }

        if (typeof elem.getAttribute === 'undefined') {
            return hAzzle.prop(elem, name, value);
        }

        notxml = nType !== 1 || !features.isXML(elem);

        if (notxml) {

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
    prop: function(elem, name, value) {

        var ret, hooks,
            nType = elem.nodeType;

        if (!elem ||
            nType === 2 ||
            nType === 3 ||
            nType === 8) {

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

    SVGAttribute: function(property) {

        if (hAzzle.ie || (hAzzle.isAndroid && !hAzzle.isChrome)) {
            SVGAttributes += "|transform";
        }

        return new RegExp("^(" + SVGAttributes + ")$", "i").test(property);
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

if (!hAzzle.features['bug-optSelected']) {
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

hAzzle.each(['cellPadding', 'cellSpacing', 'maxLength', 'rowSpan',
    'colSpan', 'useMap', 'frameBorder', 'contentEditable', 'textContent', 'valueType',
    'tabIndex', 'readOnly', 'type', 'accessKey', 'tabIndex', 'dropZone', 'spellCheck',
    'hrefLang', 'isMap', 'srcDoc', 'mediaGroup', 'autoComplete', 'noValidate',
    'radioGroup'
], function() {
    hAzzle.propMap[this.toLowerCase()] = this;
});