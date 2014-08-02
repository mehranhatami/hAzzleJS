/** hAzzle eventHooks
 *
 * Note! In an attempt to be compatible with the
 * jQuery API, our eventHooks are almost following
 * the same pattern.
 */
var focusinBubbles = 'onfocusin' in window,
    wheelEvent = 'onwheel' in document.createElement('div') || document.documentMode > 8 ?
    'wheel' : 'mousewheel';

hAzzle.extend({
    'special': {

        'wheel': {
            'setup': function() {

                this.addEventListener(wheelEvent, mouseWheelHandler, false);
            },

            'shutdown': function() {
                this.removeEventListener(wheelEvent, mouseWheelHandler, false);
            },
        },

        'load': {
            'noBubble': true
        },
        'focus': {
            'trigger': function() {

                if (this !== document.activeElement && this.focus) {
                    this.focus();
                    return false;
                }
            },
            'delegateType': 'focusin'
        },
        'blur': {
            'trigger': function() {
                if (this === document.activeElement && this.blur) {
                    this.blur();
                    return false;
                }
            },
            'delegateType': 'focusout'
        },
        'click': {

            // For checkbox, fire native event so checked state will be right

            'trigger': function() {
                if (this.type === 'checkbox' && this.click && hAzzle.nodeName(this, 'input')) {
                    this.click();
                    return false;
                }
            },

            // For cross-browser consistency, don't fire native .click() on links

            '_default': function(evt) {
                return hAzzle.nodeName(evt.target, 'a');
            }
        },

        'beforeunload': {
            'postPrep': function(evt) {
                if (evt.result !== undefined && evt.originalEvent) {
                    evt.originalEvent.returnValue = evt.result;
                }
            }
        }
    },

    // Simulate

    'simulate': function(type, elem, evt, bubble) {

        var e = hAzzle.shallowCopy(
            new hAzzle.Event(),
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

hAzzle.forOwn({
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

if (!focusinBubbles) {

    hAzzle.forOwn({
        focus: 'focusin',
        blur: 'focusout'
    }, function(fix, orig) {

        var handler = function(evt) {
            hAzzle.eventHooks.simulate(fix, evt.target, hAzzle.props.propFix(evt), true);
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

function mouseWheelHandler(orgEvent) {

    var args = [].slice.call(arguments, 0),
        evt = hAzzle.props.propFix(orgEvent);

    if (wheelEvent === 'wheel') {
        evt.deltaMode = orgEvent.deltaMode;
        evt.deltaX = orgEvent.deltaX;
        evt.deltaY = orgEvent.deltaY;
        evt.deltaZ = orgEvent.deltaZ;
    } else {
        evt.type = 'wheel';
        evt.deltaMode = 0;
        evt.deltaX = -1 * orgEvent.wheelDeltaX;
        evt.deltaY = -1 * orgEvent.wheelDeltaY;
        evt.deltaZ = 0; // not supported
    }

    args[0] = evt;

    return hAzzle.event.handle.apply(this, args);
}