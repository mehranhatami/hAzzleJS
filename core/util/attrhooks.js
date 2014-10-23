// attrhooks.js
hAzzle.define('attrHooks', function() {

    var _util = hAzzle.require('Util'),
        _support = hAzzle.require('Support'),
        _setters = hAzzle.require('Setters'),
        _docElem = document.documentElement,
        _winDoc = window.document;

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
        },
        // Title hook for DOM        
        'title': function(elem, value) {
            (elem = _docElem ? _winDoc : elem).title = value;
        }
    });
    // Getter    
    _util.mixin(_setters.attrHooks.get, {
        'title': function(elem) {
            return elem === _docElem ? _winDoc.title : elem.title;
        }
    });
    return {};
});