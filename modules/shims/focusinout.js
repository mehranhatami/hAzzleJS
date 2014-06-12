var win = this,
    hAzzle = win.hAzzle,
    browserInfo = hAzzle.browser(),
    needsFocusShim = (browserInfo.browser == 'firefox' ||
        (browserInfo.browser == 'opera' && browserInfo.mobile));

if (needsFocusShim) {

    //if (!hAzzle.features.focusinBubbles) {
    var yy,
        focio = {
            'focusin': 'focus',
            'focusout': 'blur',
        };
    for (yy in focio) {

        hAzzle.event.special[yy] = {

            simulate: function (el, type) {

                var elfocus,
                    key,
                    focusEventType = (type == 'focusin') ? 'focus' : 'blur',
                    focusables = (function (el) {

                        var focusables = hAzzle(el).find('input'),
                            selects = hAzzle(el).find('select');

                        if (selects.length) {
                            push.apply(focusables, selects);
                        }

                        return focusables;
                    })(el),
                    cback = (function (type) {
                        return function () {
                            if (this === document.activeElement) {
                                hAzzle(this).trigger(type);
                            }
                        };
                    })(type),

                    i = -1,

                    length = focusables.length;

                key = '__' + focusEventType + 'Handled__';

                while (++i < length) {

                    elfocus = focusables[i];

                    if (!elfocus.hasOwnProperty(key) || !elfocus[key]) {

                        elfocus[key] = true;

                        elfocus.addEventListener(focusEventType, cback, true);

                    }
                }
            }
        }
    }
}