// tween.js
function Tween(elem, options, prop, end, easing) {
    return new Tween.prototype.init(elem, options, prop, end, easing);
}

hAzzle.Tween = Tween;

Tween.prototype = {
    constructor: Tween,
    init: function(elem, options, prop, end, easing, unit) {


        this.elem = elem;
        this.prop = prop;

        // If we dont check the easing this way, it will throw

        this.easing = hAzzle.easing[easing] || hAzzle.easing[hAzzle.defaultEasing];
        this.duration = options.duration;
        this.options = options;
        this.step = options.step;
        this.start = this.now = this.cur();
        this.end = end;
        this.unit = unit || (hAzzle.unitless[prop] ? '' : 'px');
    },
    cur: function() {
        // Handle hooked properties
        var hooks = hAzzle.TweenHooks[this.prop];

        return hooks && hooks.get ?
            hooks.get(this) :
            hAzzle.TweenHooks._default.get(this);
    },
    run: function(tick) {

        if (tick === 1) {

            // If this is the last tick pass (if we've reached 100% completion for this animation), 
            // ensure that 'this.now' is explicitly set to its target end value so that it's 
            // not subjected to any rounding.

            this.now = this.end;

        } else {


            var pos, hooks = hAzzle.TweenHooks[this.prop];

            if (this.duration) {

                this.pos = pos = this.easing(tick);

            } else {

                this.pos = pos = tick;
            }

            // Current value

            this.now = (this.end - this.start) * pos + this.start;

            if (this.step) {
                this.step.call(this.elem, this.now, this);
            }

            if (hooks && hooks.set) {
                hooks.set(this);
            } else {
                hAzzle.TweenHooks._default.set(this);
            }
        }
        return this;
    }
};

Tween.prototype.init.prototype = Tween.prototype;

// TweenHooks

hAzzle.TweenHooks = {

    _default: {
        get: function(tween) {
            var cur;

            if (tween.elem[tween.prop] != null &&
                (!tween.elem.style || tween.elem.style[tween.prop] == null)) {
                return tween.elem[tween.prop];
            }

            cur = hAzzle.css(tween.elem, tween.prop, '');

            // Convert CSS null-values to an integer of value 0.

            if (hAzzle.isZeroValue(cur)) {
                cur = 0;
            }

            // If the display option is being set to a non-'none' (e.g. 'block') and opacityis being
            // animated to an endValue of non-zero, the user's intention is to fade in from invisible, thus 
            // we forcefeed opacity a start value of 0 

            if (((tween.options.display !== undefined && tween.options.display !== null && tween.options.display !== 'none') ||
                    (tween.options.visibility && tween.options.visibility !== 'hidden')) && tween.prop === 'opacity' &&
                !cur && tween.end !== 0) {
                cur = 0;
            }

            return cur;
        },
        set: function(tween) {

            if (tween.elem.style && (hAzzle.curCSS(tween.elem, hAzzle.cssProps[tween.prop]) != null ||
                hAzzle.cssHooks[tween.prop])) {
                hAzzle.style(tween.elem, tween.prop, tween.now + tween.unit);
            } else {
                tween.elem[tween.prop] = tween.now;
            }
        }
    }
};

hAzzle.TweenHooks.scrollTop = hAzzle.TweenHooks.scrollLeft = {
    set: function(tween) {
        if (tween.elem.nodeType && tween.elem.parentNode) {
            tween.elem[tween.prop] = tween.now;
        }
    }
};

hAzzle.fx = Tween.prototype.init;