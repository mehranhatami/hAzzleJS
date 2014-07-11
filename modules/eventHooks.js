/**
 * Collection of hAzzle eventHooks
 *
 * NOTE!! I will improve this hooks later on
 *
 * eventHooks are splitted into two groups
 *
 * - simulation
 * - special event types
 * - delegateType
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
 * Delegated type:
 * ---------------
 *
 *  eventHook [ { OLD EVENT TYPE NAME } ] = {
 *   delegateType: { { NEW EVENT TYPE NAME } }
 *  }
 *
 *
 * 'delegateType' are used within event delegation. Say
 * you want mouseenter to work,
 * you then change mouseenter tobecome mouseover with
 * the eventHook
 *
 */
hAzzle.forOwn({
    'pointerenter': 'pointerover',
    'pointerleave': 'pointerout',
    'mouseenter': 'mouseover',
    'mouseleave': 'mouseout',
}, function (orig, fix) {
    hAzzle.eventHooks[orig] = {
        specalEvents: {
            name: fix,
            handler: function (evt) {
                var related = evt.relatedTarget,
                    target = this;
                return !related ? related === null : (related !== target && related.prefix !== 'xul' && !/document/.test(target.toString()) && !hAzzle.contains(related, target));
            }
        }
    };
});



hAzzle.eventHooks.focus = {
    delegateType: 'focusIn'
};
hAzzle.eventHooks.mouseenter = {
    delegateType: 'mouseover'
};
hAzzle.eventHooks.blur = {
    delegateType: 'focusout'
};

var win = this,
    hAzzle = win.hAzzle,
    push = Array.prototype.push,
    needsFocusShim = hAzzle.isFirefox;

if (needsFocusShim) {

    var simulate = function (el, type) {

        var elfocus,
            key,
            focusEventType = (type === 'focusin') ? 'focus' : 'blur',
            focusables = (function (el) {

                var focusables = hAzzle(el).find('input'),
                    selects = hAzzle(el).find('select');

                if (selects.length) {
                    push.apply(focusables, selects);
                }

                return focusables;
            })(el),
            cback = (function (type, focusEventType) {
                return function () {
                    if ((focusEventType === 'focus' && this === document.activeElement) || focusEventType === 'blur') {
                        hAzzle(this).trigger(type);
                    }
                };
            })(type, focusEventType),

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
    };

    hAzzle.each(['focusin', 'focusout'], function (fix) {
        hAzzle.eventHooks[fix] = {
            simulate: simulate
        };
    });
}