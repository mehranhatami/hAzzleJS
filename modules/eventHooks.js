// eventHooks.js
hAzzle.extend({

    'special': {
        'load': {
            noBubble: true
        },

        'beforeunload': {
            'postDispatch': function(evt) {
                if (evt.result !== undefined) {
                    evt.originalEvent.returnValue = evt.result;
                }
            }
        },

        'click': {

            // Utilize native event to ensure correct checkbox state
            'setup': function() {
                // Claim the first click handler
                if (hAzzle.nodeName(this, 'input') && this.type === 'checkbox' && this.click) {
                    useNative(this, 'click');
                }

                // Nothing to see here, move along
                return false;
            },
            'trigger': function() {
                // Force setup before triggering a click
                if (hAzzle.nodeName(this, 'input') && this.type === 'checkbox' && this.click) {
                    useNative(this, 'click', false, returnTrue);
                }
            },
            '_default': function(evt) {
                return hAzzle.nodeName(evt.target, 'a');
            }
        }
    },

    // Simulate

    'simulate': function(type, elem, evt, bubble) {

        var e = hAzzle.shallowCopy(
            hAzzle.Event(),
            evt, {
                type: type,
                isSimulated: true,
                originalEvent: {}
            }
        );

        if (bubble) {

            hAzzle.event.trigger(e, null, elem);

        } else {

            hAzzle.event.handle.call(elem, e);
        }

        if (e.isDefaultPrevented()) {

            evt.preventDefault();
        }
    }

}, hAzzle.eventHooks);

hAzzle.each({
    mouseenter: 'mouseover',
    mouseleave: 'mouseout',
    pointerenter: 'pointerover',
    pointerleave: 'pointerout'
}, function(fix, orig) {

    hAzzle.eventHooks.special[orig] = {
        delegateType: fix,
        bindType: fix,

        handle: function(evt) {
            var ret,
                target = this,
                related = evt.relatedTarget,
                handleObj = evt.handleObj;

            if (!related || (related !== target && !hAzzle.contains(target, related))) {
                evt.type = handleObj.origType;
                ret = handleObj.handler.apply(this, arguments);
                evt.type = fix;
            }
            return ret;
        }
    };
});

/* =========================== INTERNAL ========================== */

// Create 'bubbling' focus and blur events
if (!hAzzle.features.focusinBubbles) {
    hAzzle.each({
        focus: 'focusin',
        blur: 'focusout'
    }, function(fix, orig) {

        // Attach a single capturing handler while someone wants focusin/focusout
        var handler = function(evt) {
            hAzzle.eventHooks.simulate(fix, evt.target, hAzzle.event.fix(evt), true);
        };

        hAzzle.eventHooks.special[fix] = {
            setup: function() {

                var doc = this.ownerDocument || this,
                    attaches = hAzzle.private(doc, fix);

                if (!attaches) {
                    doc.addEventListener(orig, handler, true);
                }
                hAzzle.private(doc, fix, (attaches || 0) + 1);
            },
            shutdown: function() {
                var doc = this.ownerDocument || this,
                    attaches = hAzzle.private(doc, fix) - 1;

                if (!attaches) {

                    doc.removeEventListener(orig, handler, true);
                    hAzzle.removePrivate(doc, fix);

                } else {

                    hAzzle.private(doc, fix, attaches);
                }
            }
        };
    });
}

hAzzle.each({
    focus: 'focusin',
    blur: 'focusout'
}, function(delegateType, type) {
    hAzzle.eventHooks.special[type] = {

        'delegateType': delegateType,

        'setup': function() {
            // Claim the first click handler
            return useNative(this, type, !hAzzle.features.focusinBubbles);
        },

        'trigger': function() {
            try {
                // Force setup before trigger
                if ((this === document.activeElement) === (type === 'blur') && this[type]) {
                    useNative(this, type, !hAzzle.features.focusinBubbles, returnTrue);
                }

                // Support: IE9
                // Iframes and document.activeElement don't mix well
            } catch (err) {}
        }
    };
});



function useNative(el, type, handlers, noop) {
    var buffer, active;

    if (hAzzle.private(el, type)) {
        return false;
    }

    // If triggering, force setup through hAzzle.event.add
    if (noop) {
        return hAzzle.event.add(el, type, noop);
    }

    // Register the reentrant controller for all namespaces
    hAzzle.event.add(el, type + '._', function(evt) {
        // If this is the outermost with-native-handlers event, fire a native one
        if ((evt.isTrigger & 1) && !active) {
            // Remember provided arguments
            buffer = active = slice.call(arguments);

            this[type]();

            // Outermost synthetic does not pass Go
            evt.stopImmediatePropagation();
            evt.preventDefault();

            return buffer;

        } else if (!evt.isTrigger && active) {

            buffer = hAzzle.event.trigger(hAzzle.shallowCopy(buffer.shift(), hAzzle.Event.prototype),
                buffer, this, handlers);

            active = false;

            evt.stopImmediatePropagation();
        }
    });

    // Note that the intercepting handler exists, but don't abort .add
    return !hAzzle.private(el, type, true);
}