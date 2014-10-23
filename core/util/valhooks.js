// valhooks.js
hAzzle.define('valHooks', function() {

    var _util = hAzzle.require('Util'),
        _strings = hAzzle.require('Strings'),
        _getText = hAzzle.require('Text'),
        _types = hAzzle.require('Types'),
        _collection = hAzzle.require('Collection'),
        _setters = hAzzle.require('Setters');

    // Setter
    _util.mixin(_setters.valHooks.set, {

        'select': function(elem, value) {
            var optionSet, option,
                options = elem.options,
                values = _collection.makeArray(value),
                i = options.length;

            while (i--) {
                option = options[i];
                if ((option.selected = _collection.inArray(option.value, values) >= 0)) {
                    optionSet = true;
                }
            }

            // Force browsers to behave consistently when non-matching value is set
            if (!optionSet) {
                elem.selectedIndex = -1;
            }
            return values;
        }
    });

    // Getter    
    _util.mixin(_setters.valHooks.get, {

        'option': function(elem) {

            var val = elem.getAttribute(name, 2);

            return val !== null ?
                val :
                _strings.trim(_getText.getText(elem));
        },

        'select': function(elem, value) {

            // Selectbox has special case

            var option, options = elem.options,
                index = elem.selectedIndex,
                one = elem.type === 'select-one' || index < 0,
                values = one ? null : [],
                max = one ? index + 1 : options.length,
                i = index < 0 ? max : one ? index : 0;

            for (; i < max; i++) {

                option = options[i];

                if ((option.selected || i === index) &&
                    option.getAttribute('disabled') === null &&
                    (!option.parentNode.disabled || !_util.nodeName(option.parentNode, 'optgroup'))) {

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
        }
    });

    // Radios and checkboxes setter

    _util.each(['radio', 'checkbox'], function(val) {
        _setters.valHooks.set[val] = function(elem, value) {
            if (_types.isArray(value)) {
                return (elem.checked = _collection.inArray(hAzzle(elem).val(), value) >= 0);
            }
        };
    });
});