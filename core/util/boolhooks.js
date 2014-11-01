// boolhooks.js
hAzzle.define('boolHooks', function () {

        var _setters = hAzzle.require('Setters');

    _setters.boolHooks.set = function (elem, value, name) {
     // If value is false, remove the attribute
        if (value === false) {
            _setters.removeAttr(elem, name);
     // If value is not false, set the same name value (checked = 'checked')
        } else {
            elem.setAttribute(name, name);
        }
        return name;
    };
    
    return {};
});