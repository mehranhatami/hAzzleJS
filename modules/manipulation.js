/*!
 * Manipulation
 */

var rnoInnerhtml = /<(?:script|style|link)/i,
    uniqueTags = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i,
    rreturn = /\r/g;


hAzzle.extend({

    /**
     * Get value for input/select elements
     * Set value for input/select elements
     *
     * @param {String} value
     * @return {Object|String}
     */

    val: function (value) {

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

        return this.each(function (el, i) {

            var val;

            if (el.nodeType !== 1) {
                return;
            }

            if (typeof value === 'function') {

                val = value.call(el, i, hAzzle(el).val());

            } else {

                val = value;
            }

            // Treat null/undefined as ""; convert numbers to string

            if (val === null) {

                val = '';

            } else if (typeof val === 'number') {

                val += '';

            } else if (hAzzle.isArray(val)) {

                val = hAzzle.map(val, function (value) {

                    return value === null ? '' : value + '';
                });
            }

            hooks = hAzzle.valHooks[el.type] || hAzzle.valHooks[el.nodeName.toLowerCase()];

            // If set returns undefined, fall back to normal setting

            if (!hooks || !('set' in hooks) || hooks.set(el, val, 'value') === undefined) {
                el.value = val;
            }
        });
    },

    /**
     * Get html from element.
     * Set html to element.
     *
     * @param {String} html
     * @return {hAzzle|string}
     *
     */

    html: function (value) {

        var el = this[0] || {},
            append = function (el, i) {
                hAzzle.each(hAzzle.stabilizeHTML(value, i), function (node) {
                    el.appendChild(node);
                });
            };

        if (value === undefined && el.nodeType === 1) {

            return el.innerHTML;
        }

        // check if the value are an 'function'

        if (typeof value === 'function') {

            return this.each(function (el, i) {
                var self = hAzzle(el);
                // Call the same function again
                self.html(value.call(el, i, self.html()));
            });
        }

        return this.empty().each(function (el, i) {

            if (typeof value === 'string' && !specialTags.test(el.tagName) &&
                !rnoInnerhtml.test(el.tagName)) {

                value = value.replace(uniqueTags, '<$1></$2>');

                try {

                    if (el.nodeType === 1) {

                        el.innerHTML = value;
                    }

                    el = 0;

                } catch (e) {}

            } else {

                append(el, i);
            }
        });
    },

    /**
     * Get text for the first element in the collection
     * Set text for every element in the collection
     *
     * hAzzle('div').text() => div text
     *
     * @param {String} value
     * @return {hAzzle|String}
     */

    text: function (value) {
        return typeof value === 'function' ?
            this.each(function (el, i) {
                var self = hAzzle(el);
                self.text(value.call(el, i, self.text()));
            }) :
            value === undefined ? hAzzle.getText(this) :
            this.empty().each(function () {
                if (this.nodeType === 1 || this.nodeType === 9 || this.nodeType === 11) {
                    this.textContent = value;
                }
            });
    },

});


// Extend the globale hAzzle Object

hAzzle.extend({

    valHooks: {
        option: {
            get: function (elem) {

                var val = elem.getAttribute(name, 2);

                return val !== null ?
                    val :
                    hAzzle.trim(hAzzle.getText(elem));
            }
        },
        select: {
            get: function (elem) {

                // selectbox has special case

                var option,
                    options = elem.options,
                    index = elem.selectedIndex,
                    one = elem.type === 'select-one' || index < 0,
                    values = one ? null : [],
                    value,
                    max = one ? index + 1 : options.length,
                    i = index < 0 ?
                    max :
                    one ? index : 0;

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

            set: function (elem, value) {

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
    }

}, hAzzle);

/* =========================== INTERNAL ========================== */

// Radios and checkboxes setter

hAzzle.each(['radio', 'checkbox'], function () {
    hAzzle.valHooks[this] = {
        set: function (elem, value) {
           if (hAzzle.isArray(value)) {
			var val = hAzzle(elem).val(),
                checked = hAzzle.indexOf( val, value ) >= 0 ;
			// Set the value
				elem.checked = checked;
			return;
            }
        }
    };
});