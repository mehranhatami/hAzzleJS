// attrhooks.js
hAzzle.include([
    'util',
    'support',
    'setters'
], function(_util, _support, _setters) {

    var radioValue = (function() {

        var input = document.createElement('input');

        input.type = 'checkbox';

        // Support: IE<=11+
        // An input loses its value after becoming a radio
        input = document.createElement('input');
        input.value = 't';
        input.type = 'radio';
        return input.value === 't';

    }());

    // Setter
    _util.mixin(_setters.attrHooks.set, {

        'type': function(elem, value) {
            if (!_support.radioValue && value === 'radio' &&
                _util.nodeName(elem, 'input')) {
                var val = elem.value;
                elem.setAttribute('type', value);
                if (val) {
                    elem.value = val;
                }
                return value;
            }
        }
    });
    return {};
});
