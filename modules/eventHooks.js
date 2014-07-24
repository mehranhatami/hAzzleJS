/** hAzzle eventHooks
 *
 * Note! In an attempt to be compatible with the
 * jQuery API, our eventHooks are almost following
 * the same pattern.
 */
// Special
hAzzle.extend({

    /**
     * ScrollStart and ScrollStop special events
     *
     * Mehran!!  Here can you add in rAF you know :)
     *
     * 'latency' is the minimum time between the last scroll event and when the scrollstop event fires.
     * should be replaced with performance.now() and rAF
     *
     */

    'scrollstart': {

        'setup': function (data) {

            var timer,
                self = this,
                args,
                _data = hAzzle.shallowCopy({

                    latency: hAzzle.eventHooks.special.scrollstop.latency

                }, data),

                handler = function (evt) {

                    self = this;
                    args = arguments;

                    if (timer) {

                        clearTimeout(timer);

                    } else {

                        evt.type = 'scrollstart';
                        hAzzle.event.preparation.apply(self, args);
                    }

                    timer = setTimeout(function () {
                        timer = null;
                    }, _data.latency);
                };

            hAzzle(this).on('scroll', null, handler).data('D' + hAzzle.now(), handler);
        },
        'shutdown': function () {
            hAzzle(this).off('scroll', null, hAzzle(this).data('D' + hAzzle.now()));
        }
    },

    // scrollstop

    'scrollstop': {
        latency: 250,
        setup: function (data) {
            var _data = hAzzle.shallowCopy({
                latency: hAzzle.eventHooks.special.scrollstop.latency
            }, data);

            var timer,
                handler = function (evt) {
                    var _self = this,
                        _args = arguments;

                    if (timer) {
                        clearTimeout(timer);
                    }

                    timer = setTimeout(function () {
                        timer = null;
                        evt.type = 'scrollstop';
                        hAzzle.event.preparation.apply(_self, _args);
                    }, _data.latency);
                };

            hAzzle(this).on('scroll', null, handler).data('D' + hAzzle.now() + 1, handler);
        },
        'shutdown': function () {
            hAzzle(this).off('scroll', null, hAzzle(this).data('D' + hAzzle.now() + 1));
        }
    },

    'load': {
        'noBubble': true
    },
    'focus': {
        'trigger': function () {

            if (this !== document.activeElement && this.focus) {
                this.focus();
                return false;
            }
        },
        'delegateType': 'focusin'
    },
    'blur': {
        'trigger': function () {
            if (this === document.activeElement && this.blur) {
                this.blur();
                return false;
            }
        },
        'delegateType': 'focusout'
    },
    'click': {

        // For checkbox, fire native event so checked state will be right
        'trigger': function () {
            if (this.type === 'checkbox' && this.click && hAzzle.nodeName(this, 'input')) {
                this.click();
                return false;
            }
        },

        // For cross-browser consistency, don't fire native .click() on links
        '_default': function (evt) {
            return hAzzle.nodeName(evt.target, 'a');
        }
    },

    'beforeunload': {
        'postPrep': function (evt) {
            if (evt.result !== undefined && evt.originalEvent) {
                evt.originalEvent.returnValue = evt.result;
            }
        }
    }

}, hAzzle.eventHooks.special);

// Simulate

hAzzle.extend({

    'simulate': function (type, elem, evt, bubble) {

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
            hAzzle.event.preparation.call(elem, e);
        }
        if (e.isDefaultPrevented()) {
            event.preventDefault();
        }
    }

}, hAzzle.eventHooks);

hAzzle.forOwn({
    mouseenter: 'mouseover',
    mouseleave: 'mouseout',
    pointerenter: 'pointerover',
    pointerleave: 'pointerout'
}, function (fix, orig) {
    hAzzle.eventHooks.special[orig] = {
        delegateType: fix,
        bindType: fix,

        handle: function (evt) {
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

if (hAzzle.bubbles) {

    hAzzle.forOwn({
        focus: 'focusin',
        blur: 'focusout'
    }, function (fix, orig) {

        var handler = function (evt) {
            hAzzle.eventHooks.simulate(fix, evt.target, hAzzle.props.propFix(evt), true);
        };

        hAzzle.eventHooks.special[fix] = {
            setup: function () {
                var doc = this.ownerDocument || this,
                    attaches = hAzzle.data(doc, fix);

                if (!attaches) {
                    doc.addEventListener(orig, handler, true);
                }
                hAzzle.data(doc, fix, (attaches || 0) + 1);
            },
            shutdown: function () {
                var doc = this.ownerDocument || this,
                    attaches = hAzzle.data(doc, fix) - 1;

                if (!attaches) {
                    doc.removeEventListener(orig, handler, true);
                    hAzzle.dataRemove(doc, fix);

                } else {
                    hAzzle.data(doc, fix, attaches);
                }
            }
        };
    });
}