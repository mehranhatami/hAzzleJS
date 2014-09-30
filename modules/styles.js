// styles.js
var sHeightWidth = /^(height|width)$/i,
    sDigit = /^[\d-]/,

    cssNormalTransform = {
        letterSpacing: '0',
        fontWeight: '400'
    },

    /**
     * Get CSS property values
     *
     * @param {Object} elem
     * @param {String|Function|Array} prop
     * @param {String} extra
     * @param {String} styles
     * @return {hAzzle|String|Function}
     */

    getCSS = function(elem, prop, extra, styles) {

        var val, num;

        if ((prop = cssCore.cssCamelized[prop]))
            prop = cssCore.cssCamelized[prop] || prop;

        if (cssHook[prop] && cssHook[prop].get) {
            val = cssHook[prop].get(elem, prop);
        }

        // Otherwise, if a way to get the computed value exists, use that

        if (val === undefined) {
            val = curCSS(elem, prop, true, styles);
        }

        // Convert 'normal' to computed value
        if (val === 'normal' && prop in cssNormalTransform) {
            val = cssNormalTransform[prop];
        }

        if (extra === '' || extra) {
            num = parseFloat(val);
            return extra === true || hAzzle.isNumeric(num) ? num || 0 : val;
        }

        return val;
    },

    /**
     * Set CSS property values
     *
     * @param {Object} elem
     * @param {String|Function|Array} prop
     * @param {String} value
     * @param {String} extra
     * @return {hAzzle|String|Function}
     */

    setCSS = function(elem, prop, value, extra) {
        if (elem) {
            var type, ret, oldValue, oldProp,
                nType = elem.nodeType,
                style = elem.style;

            // Don't set styles on text and comment nodes
            if (nType === 3 ||
                nType === 8) {
                return;
            }

            // Check if we're setting a value

            if (value !== undefined) {

                // Check for 'cssHook'

                if (cssHook[prop] && cssHook[prop].set) {
                    value = cssHook[prop].set(elem, value, extra);
                }

                // Pre-camelize 
                // E.g. Firefox don't understand border-color

                if ((oldProp = cssCore.cssCamelized[prop])) {
                    prop = oldProp
                } else {
                    prop = oldProp = hAzzle.camelize(prop);
                }

                // Assign the appropriate vendor prefix before perform an official style update.

                prop = hAzzle.prefixCheck(prop)[0];

                type = typeof value;

                // Convert relative number strings

                if (type === 'string' && (ret = cssCore.RegEx.sNumbs.exec(value))) {
                    value = hAzzle.units(hAzzle.css(elem, prop, ''), ret[3], elem, name) + (ret[1] + 1) * ret[2];
                    type = 'number';
                }

                // Make sure that null and NaN values aren't set.

                if (value === null || value !== value) {
                    return;
                }

                // If a number was passed in, add 'px' to the number (except for certain CSS properties)

                if (type === 'number' && !hAzzle.unitless[prop]) {
                    value += ret && ret[3] ? ret[3] : 'px';
                }

                if (cssCore.has['bug-clearCloneStyle'] &&
                    value === '' && prop.indexOf('background') === 0) {
                    style[cssCore.cssCamelized[prop]] = 'inherit';
                }

                oldValue = elem.style[name];
                style[name] = value;

                // Revert to the old value if the browser didn't accept the new rule to
                // not break the cascade.

                if (value && !elem.style[name]) {
                    style[name] = oldValue;
                }

                style[prop] = value;

            } else {

                // If a hook was provided get the non-computed value from there

                if (cssHook[prop]) {
                    return cssHook[prop].get(elem, prop);
                }

                // Otherwise just get the value from the style object
                return style[prop];
            }
        }
    };

hAzzle.extend({

    css: function(name, value) {

        return setter(this, function(elem, name, value) {

            if (hAzzle.isArray(name)) {

                var map = {},
                    i = name.length;

                while (i--) {

                    map[name[i]] = getCSS(elem, name[i], false);
                }

                return map;
            }

            return value !== undefined ?
                setCSS(elem, name, value) :
                getCSS(elem, name);

        }, name, value, arguments.length > 1);
    }
});

// Expose

hAzzle.css = getCSS;
hAzzle.style = setCSS;