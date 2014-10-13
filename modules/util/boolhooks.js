// boolhooks.js
hAzzle.define('boolHooks', function () {

        var _setters = hAzzle.require('Setters');

    // Setter    

    _setters.boolHooks.set = function (elem, value, name) {
        if (value === false) {
            // Remove boolean attributes when set to false
            removeAttr(elem, name);
        } else {
            elem.setAttribute(name, name);
        }
        return name;
    };
    
    return {};
});