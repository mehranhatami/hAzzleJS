// boolhooks.js
hAzzle.define('boolHooks', function() {

    var _setters = hAzzle.require('Setters');

    _setters.boolHooks.set = function(elem, value, name) {
        // If value is false, remove the attribute
        if (value === false) {
            _setters.removeAttr(elem, name);
        } else {
            elem.setAttribute(name, name);
        }
        return name;
    };

    return {};
});