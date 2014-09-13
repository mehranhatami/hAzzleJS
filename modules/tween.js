// tween.js
function Tween(elem, options, prop, end, easing) {
    return new Tween.prototype.init(elem, options, prop, end, easing);
}

hAzzle.Tween = Tween;

Tween.prototype = {
    constructor: Tween,
    init: function(elem, options, prop, end, easing) {

        this.elem = elem;
        this.prop = prop;
        this.easing = hAzzle.easing[easing] || hAzzle.easing[hAzzle.defaultEasing];
        this.duration = options.duration;
        this.options = options;
        this.step = options.step;
        this.start = this.now = this.cur();
        this.end = end;
        this.unit = '';
    },
    cur: function() {
        
        var value;
        
        // 'cssHook - animation' are special hooks' not natively supported
        // by the CSS module
        
        if (cssHook.animation[this.prop]) {
            value = cssHook.animation[prop](this.elem, this.prop)
        } else {
            value = getCSS(this.elem, this.prop);
        }
        
        // Since property lookups are for animation purposes (which entails 
        // computing the numeric delta between start and end values),
        // convert CSS null-values to an integer of value 0.

        if (hAzzle.isZeroValue(value)) {
            value = 0;
        }
        return value;
    },
    run: function(tick) {

        var pos;

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

        setCSS(this.elem, this.prop, this.now + this.unit, true);

        return this;
    }
};

Tween.prototype.init.prototype = Tween.prototype;

hAzzle.fx = Tween.prototype.init;