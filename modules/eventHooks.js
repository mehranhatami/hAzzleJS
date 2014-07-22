/** hAzzle eventHooks
 *
 * Note! In an attempt to be compatible with the
 * jQuery API, our eventHooks are almost following
 * the same pattern.
 */
hAzzle.extend({

    'special': {

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
                            hAzzle.eventCore.dispatch.apply(self, args);
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
                            hAzzle.eventCore.dispatch.apply(_self, _args);
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

                if (this !== safeActiveElement() && this.focus) {
                    this.focus();
                    return false;
                }
            },
            'delegateType': "focusin"
        },
        'blur': {
            'trigger': function () {
                if (this === safeActiveElement() && this.blur) {
                    this.blur();
                    return false;
                }
            },
            'delegateType': "focusout"
        },
        'click': {

            // For checkbox, fire native event so checked state will be right
            trigger: function () {
                if (this.type === "checkbox" && this.click && hAzzle.nodeName(this, "input")) {
                    this.click();
                    return false;
                }
            },

            // For cross-browser consistency, don't fire native .click() on links
            '_default': function (event) {
                return hAzzle.nodeName(event.target, "a");
            }
        },

        'beforeunload': {
            'postDispatch': function (event) {
                if (event.result !== undefined && event.originalEvent) {
                    event.originalEvent.returnValue = event.result;
                }
            }
        }
    },

    'simulate': function (type, elem, event, bubble) {

        var e = hAzzle.shallowCopy(
            new hAzzle.Event(),
            event, {
                type: type,
                isSimulated: true,
                originalEvent: {}
            }
        );
        if (bubble) {
            hAzzle.eventCore.trigger(e, null, elem);
        } else {
            hAzzle.eventCore.dispatch.call(elem, e);
        }
        if (e.isDefaultPrevented()) {
            event.preventDefault();
        }
    }

}, hAzzle.eventHooks);

hAzzle.forOwn({
    mouseenter: "mouseover",
    mouseleave: "mouseout",
    pointerenter: "pointerover",
    pointerleave: "pointerout"
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


// Support: Firefox, Chrome, Safari
// Create "bubbling" focus and blur events

if (!hAzzle.eventCore.has['api-bubbles']) {

    hAzzle.forOwn({
        focus: "focusin",
        blur: "focusout"
    }, function (fix, orig) {

        var handler = function (event) {
            hAzzle.eventHooks.simulate(fix, event.target, hAzzle.props.propFix(event), true);
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

function safeActiveElement() {
    try {
        return document.activeElement;
    } catch (e) {}
}