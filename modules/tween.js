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
        this.easing = hAzzle.easing[easing] || hAzzle.easing.swing;
        this.duration = options.duration,
        this.step = options.step,
        this.start = this.now = this.cur();
        this.end = end;
        this.unit = unit || (hAzzle.unitless[prop] ? '' : 'px');
    },
    cur: function() {
        var hooks = hAzzle.TweenHooks[this.prop];

        return hooks && hooks.get ?
            hooks.get(this) :
            hAzzle.TweenHooks._default.get(this);
    },
    run: function(tick) {

        var pos, hooks = hAzzle.TweenHooks[this.prop];

        if (this.duration) {

            this.pos = pos = this.easing(tick);

        } else {

            this.pos = pos = tick;
        }
        this.now = (this.end - this.start) * pos + this.start;

        if (this.step) {
            this.step.call(this.elem, this.now, this);
        }

        if (hooks && hooks.set) {
            hooks.set(this);
        } else {
            hAzzle.TweenHooks._default.set(this);
        }
        return this;
    }
};

Tween.prototype.init.prototype = Tween.prototype;

// TweenHooks

hAzzle.TweenHooks = {
    _default: {
        get: function(tween) {
            var startValue;

            if (tween.elem[tween.prop] != null &&
                (!tween.elem.style || tween.elem.style[tween.prop] == null)) {
                return tween.elem[tween.prop];
            }

            startValue = hAzzle.css(tween.elem, tween.prop, '');

            // Convert CSS null-values to an integer of value 0.

            if (hAzzle.isZeroValue(startValue)) {
                startValue = 0;
            }

            // If the display option is being set to a non-'none' (e.g. 'block') and opacityis being
            // animated to an endValue of non-zero, the user's intention is to fade in from invisible, thus 
            // we forcefeed opacity a startValue of 0 

            if ((tween.prop === 'display' && startValue !== 'none') ||
                (tween.prop === 'visible' && startValue !== 'hidden') &&
                tween.prop === 'opacity' && !startValue && tween.end !== 0) {
                startValue = 0;
            }

            return startValue;
        },
        set: function(tween) {

            if (tween.elem.style && (hAzzle.curCSS(tween.elem, hAzzle.cssProps[tween.prop]) != null ||
                hAzzle.cssHooks[tween.prop])) {
                hAzzle.style(tween.elem, tween.prop, tween.now + tween.unit);
            } else {
                hAzzle.style(tween.elem, tween.prop, tween.now);
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