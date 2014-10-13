// csshooks.js
hAzzle.define('cssHooks', function() {

    var _util = hAzzle.require('Util'),
        _detection = hAzzle.require('Detection'),
        _style = hAzzle.require('Style'),
        _ccs = hAzzle.require('curCSS');

    // Fixes Chrome bug / issue

    if (_detection.isChrome) {
        _style.cssHooks.textDecoration = {
            get: function(elem, computed) {
                if (computed) {

                    //Chrome 31-36 return text-decoration-line and text-decoration-color
                    //which are not expected yet.
                    //see https://code.google.com/p/chromium/issues/detail?id=342126
                    var ret = _ccs.curCSS(elem, 'text-decoration');
                    //We cannot assume the first word as 'text-decoration-style'
                    if (/\b(inherit|(?:und|ov)erline|blink|line\-through|none)\b/.test(ret)) {
                        return RegExp.$1;
                    }
                }
            }
        };
    }

    // Getter    
    _util.extend(_style.cssHooks.get, {
        'opacity': function(elem, computed) {
            if (computed) {
                // We should always get a number back from opacity
                var ret = _ccs.curCSS(elem, 'opacity');
                return ret === '' ? '1' : ret;
            }
        }
    });

    return {};
});