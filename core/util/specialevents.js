// specialEvents.js
hAzzle.define('specialEvents', function() {

    var _util = hAzzle.require('Util'),
        _has = hAzzle.require('has'),
        _events = hAzzle.require('Events');

    // Handle focusin/focusout for browsers who don't support it ( e.g Firefox)

    if (_has.has('firefox')) {
        var focusBlurFn = function(elem, type) {

            var key,
                focusEventType = (type == 'focusin') ? 'focus' : 'blur',
                focusables = (function(elem) {

                    var focusables = hAzzle(elem).find('input').elements,
                        selects = hAzzle(elem).find('select').elements;

                    if (selects.length) {
                        push.apply(focusables, selects);
                    }

                    return focusables;
                })(elem),
                handler = (function(type) {
                    return function() {
                        if (this === document.activeElement && this.blur) {
                            hAzzle(this).trigger(type);
                            return false;
                        }
                    };
                })(type),

                i = -1,

                length = focusables.length;

            key = '__' + focusEventType + 'fixed__';

            while (++i < length) {

                if (!_util.has(focusables[i], key) || !focusables[i][key]) {
                    focusables[i][key] = true;
                    focusables[i].addEventListener(focusEventType, handler, true);
                }
            }
        };

        _util.each(['focusin', 'focusout'], function(prop) {
            _events.specialEvents[prop] = focusBlurFn;
        });
    }
    return {};
});