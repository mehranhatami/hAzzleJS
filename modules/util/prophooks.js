// prophooks.js
hAzzle.define('propHooks', function () {

    var _util = hAzzle.require('Util'),
        _support = hAzzle.require('Support'),
        _setters = hAzzle.require('Setters'),

        _focusable = /^(?:input|select|textarea|button)$/i;

    // Getter    
    _util.extend(_setters.propHooks.get, {
        'tabIndex': function (elem) {
            return elem.hasAttribute('tabindex') ||
                focusable.test(elem.nodeName) || elem.href ?
                elem.tabIndex :
                -1;
        }
    });

    if (!_support.optSelected) {
        _setters.propHooks.get.selected = function (elem) {
            var parent = elem.parentNode;
            if (parent && parent.parentNode) {
                parent.parentNode.selectedIndex;
            }
            return null;
        };
    }
});