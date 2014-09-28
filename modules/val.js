// val.js

var rreturn = /\r/g;

    /**
     * Get value for input/select elements
     * Set value for input/select elements
     *
     * @param {String} value
     * @return {Object|String}
     */

hAzzle.Core.val = function(value) {

    var hooks, ret,
        elem = this[0];

    if (!arguments.length) {

        if (elem) {

            hooks = hAzzle.valHooks[elem.type] || hAzzle.valHooks[elem.nodeName.toLowerCase()];

            if (hooks && 'get' in hooks && (ret = hooks.get(elem, 'value')) !== undefined) {
                return ret;
            }

            ret = elem.value;

            return typeof ret === 'string' ? ret.replace(rreturn, '') : ret === null ? '' : ret;
        }

        return;
    }

    return this.each(function(el, index) {

        var val;

        if (el.nodeType !== 1) {
            return;
        }

        if (typeof value === 'function') {
            val = value.call(el, index, hAzzle(el).val());
        } else {
            val = value;
        }

        // Treat null/undefined as ''; convert numbers to string

        if (val === null) {

            val = '';

        } else if (typeof val === 'number') {

            val += '';

        } else if (hAzzle.isArray(val)) {
            val = hAzzle.map(val, function(value) {
                return value === null ? '' : value + '';
            });
        }

        hooks = hAzzle.valHooks[el.type] || hAzzle.valHooks[el.nodeName.toLowerCase()];

        // If set returns undefined, fall back to normal setting

        if (!hooks || !('set' in hooks) || hooks.set(el, val, 'value') === undefined) {
            el.value = val;
        }
    });
};

// valHooks

hAzzle.valHooks = {
        option: {
            get: function(elem) {

                var val = elem.getAttribute(name, 2);

                return val !== null ?
                    val :
                    hAzzle.trim(hAzzle.getText(elem));
            }
        },
        select: {
            get: function(elem) {

                // Selectbox has special case

                var option, options = elem.options,
                    index = elem.selectedIndex,
                    one = elem.type === 'select-one' || index < 0,
                    values = one ? null : [], value,
                    max = one ? index + 1 : options.length,
                    i = index < 0 ? max : one ? index : 0;

                for (; i < max; i++) {

                    option = options[i];

                    if ((option.selected || i === index) &&
                        option.getAttribute('disabled') === null &&
                        (!option.parentNode.disabled || !hAzzle.nodeName(option.parentNode, "optgroup"))) {

                        // Get the specific value for the option

                        value = hAzzle(option).val();

                        // We don't need an array for one selects

                        if (one) {
                            return value;
                        }

                        // Multi-Selects return an array
                        values.push(value);
                    }
                }
                return values;
            },

            set: function(elem, value) {

                var optionSet, option,
                    options = elem.options,
                    values = hAzzle.makeArray(value),
                    i = options.length;

                while (i--) {

                    option = options[i];

                    if ((option.selected = hAzzle.indexOf(option.value, values) >= 0)) {
                        optionSet = true;
                    }
                }

                // Force browsers to behave consistently when non-matching value is set
                if (!optionSet) {
                    elem.selectedIndex = -1;
                }
                return values;
            }
        }
    };

// Radios and checkboxes setter

hAzzle.each(['radio', 'checkbox'], function() {
    hAzzle.valHooks[this] = {
        set: function(elem, value) {
            if (hAzzle.isArray(value)) {
                var val = hAzzle(elem).val(),
                    checked = hAzzle.indexOf(val, value) >= 0;
                elem.checked = checked;
                return;
            }
        }
    };
});