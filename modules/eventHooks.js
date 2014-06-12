/**
 * Collection of hAzzle eventHooks
 *
 * NOTE!! I will improve this hooks later on
 *
 * eventHooks are splitted into two groups
 *
 * - simulation
 * - special event types
 *
 * For event types:
 * ----------------
 *
 *  eventHook [ { OLD EVENT TYPE NAME } ] = {
 *
 *   name: { { NEW EVENT TYPE NAME } }
 *   handler: { { EVENT HANDLER }  }
 *  }
 *
 * Simulation:
 * ------------
 *
 *  eventHook [ { EVENT TYPE NAME } ] = {
 *
 *   simulate: { { YOUR FUNCTION HERE } }
 *
 *  }
 *
 *
 * It's included two hooks here that you can
 * learn from !! :)
 *
 */
/**
 *
 * Note!!
 *
 * Ugly code. Temporary until I get
 * the hAzzle.each() fixed
 *
 */
var xx,
    moupo = {
        'pointerenter': 'pointerover',
        'pointerleave': 'pointerout',
        'mouseenter': 'mouseover',
        'mouseleave': 'mouseout',
    };
for (xx in moupo) {
    hAzzle.eventHooks[xx] = {

        specalEvents: {
            name: moupo[xx],
            handler: function (event) {

                var related = event.relatedTarget,
                    target = this;
                return !related ? related === null : (related !== target && !hAzzle.contains(related, target));
            }
        }
    };
    // End of loop	 
}




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

        hAzzle.eventHooks[yy] = {

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