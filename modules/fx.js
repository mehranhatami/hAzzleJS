var frame = hAzzle.RAF(),
    fixTick = false, // feature detected below
    dictionary = [],
    rafId;

frame.request(function(timestamp) {
    fixTick = timestamp > 1e12 != frame.perfNow() > 1e12;
});

function Tween(elem, options, prop) {
    return new Tween.prototype.init(elem, options, prop);
}

hAzzle.Tween = Tween;

Tween.prototype = {

    constructor: Tween,

    init: function(elem, options, prop) {

        this.elem = elem;
        this.prop = prop;
        this.currentState = {};
        this.options = options;
        this.easing = options.easing || 'linear';
        this.duration = options.duration || 600;
    },

    run: function(to, unit) {

        var hooks = hAzzle.fxAfter[this.prop],
            complete, from, val,
            self = this,
            done = true,
            callback = {

                animate: function(currentTime, jumpToEnd) {

                    var i, delta = currentTime - self.start, v;

                    if (delta > self.duration || jumpToEnd) {

                        self.currentState[self.currentState.prop] = true;

                        for (i in self.currentState) {
                            if (self.currentState[i] !== true) {
                                done = false;
                            }
                        }
                        if (done) {

                            if (jumpToEnd) {

                                self.pos = to;

                                // Only do style update if jumpToEnd 

                                self.update();
                            }

                            // Execute the complete function

                            complete = self.options.complete;

                            if (complete) {

                                self.options.complete = false;
                                complete.call(self.elem);
                            }
                        }
                        return false;
                    }
                    // Calculate position and easing

                    if (typeof this.diff === 'object') {

                        for (v in this.diff) {

                            self.pos[v] = (this.diff[v].end - this.diff[v].start) * hAzzle.easing[self.easing](delta / self.duration) + self.diff[v].start;

                        }

                    } else {

                        self.pos = self.diff * hAzzle.easing[self.easing](delta / self.duration) + self.from;
                    }

                    // Update the CSS style(s)

                    self.update();

                    return true;
                },

                elem: this.elem
            };

        this.from = from = hooks && hooks.get ?
            hooks.get(this) :
            hAzzle.fxAfter._default.get(this);

        this.unit = unit || this.unit || (hAzzle.unitless[this.prop] ? '' : 'px');

        if (typeof to === 'object') {

            this.diff = {};

            if (typeof from !== 'object') {

                from = {};
            }

            for (val in to) {

                if (!from.hasOwnProperty(val)) {

                    from[val] = 0;
                }

                this.diff[val] = {
                    start: from[val],
                    end: to[val]
                };
            }
        } else {

            this.diff = to - from;
        }

        this.start = frame.perfNow();
        this.pos = 0;
        this.to = to;

        if (callback.animate() && dictionary.push(callback)) {
            if (!rafId) {
                rafId = frame.request(function render(tick) {

                    var timer, i = 0;

                    if (fixTick) {
                        tick = frame.perfNow();
                    }
                    frame.request(render);

                    for (; i < dictionary.length; i++) {

                        timer = dictionary[i];

                        if (!timer.animate(tick) && dictionary[i] === timer) {
                            dictionary.splice(i--, 1);
                        }
                    }

                    if (!dictionary.length) {

                        frame.cancel(rafId);

                        // Avoid memory leaks

                        rafId = null;
                    }
                });
            }
        }
    },

    update: function() {

        var hooks = hAzzle.fxAfter[this.prop];

        if (hooks && hooks.set) {
            hooks.set(this);
        } else {
            hAzzle.fxAfter._default.set(this);
        }
    }
};

Tween.prototype.init.prototype = Tween.prototype;

hAzzle.extend({

    animate: function(options, speed, easing, callback) {

        var opt;

        if (typeof speed === 'object') {

            opt = hAzzle.shallowCopy({}, speed);

        } else {

            opt = {

                complete: callback || !callback && easing ||
                    hAzzle.isFunction(speed) && speed,
                duration: speed,
                easing: callback && easing || easing && !hAzzle.isFunction(easing) && easing
            };

            // Support for jQuery's named durations.

            switch (opt.duration.toString().toLowerCase()) {
                case 'fast':
                    opt.duration = 200;
                    break;
                case 'normal':
                    opt.duration = 500;
                    break;
                case 'medium':
                    opt.duration = 400;
                    break;
                case 'slow':
                    opt.duration = 1500;
                    break;
                default:

                    // If the user is attempting to set a duration of 0 (in order to produce an immediate style change).
                    opt.duration = parseFloat(opt.duration) || 1;
            }
        }

        return this.each(function() {

            var index, val, anim, hooks, name, unit;

            for (index in options) {

                val = options[index];

                name = hAzzle.camelize(index);

                if (index !== name) {
                    options[name] = options[index];
                    delete options[index];
                }

                if (hAzzle.propertyMap[index]) {
                    val = hAzzle.propertyMap[index](this, index);
                }

                anim = new Tween(this, opt, index);

                hooks = hAzzle.fxBefore[index];

                if (hooks) {

                    hooks(this, index, val, anim);

                } else {

                    anim.run(val, unit);
                }
            }
        });
    },

    stop: function(jumpToEnd) {

        return this.each(function() {

            var timers = dictionary,
                i = timers.length;

            while (i--) {

                if (timers[i].elem === this) {
                    if (jumpToEnd) {

                        // Force the next step to be the last

                        timers[i].animate(null, true);
                    }

                    timers.splice(i, 1);
                }
            }
        });
    }
});

hAzzle.extend({

    propertyMap: {

        display: function(elem, value) {

            value = value.toString().toLowerCase();

            if (value === 'auto') {

                value = hAzzle.getDisplayType(elem);
            }
            return value;
        },

        visibility: function(elem, value) {

            return value.toString().toLowerCase();

        }
    },

    fxBefore: {},

    fxAfter: {

        opacity: {
            set: function(fx) {
                fx.elem.style.opacity = fx.pos;
            }
        },

        _default: {

            /**
             * _default getter / setter default CSS properties. getComputedStyle are
             * cached on the object itself for better performance, so we only
             * queuing the DOM once
             */

            get: function(fx) {

                var result,
                    prop = fx.elem[fx.prop];

                if (prop != null && (!getStyles(fx.elem) || prop == null)) {
                    return prop;
                }

                result = hAzzle.css(fx.elem, fx.prop, '');

                // Empty strings, null, undefined and 'auto' are converted to 0.
                return !result || result === 'auto' ? 0 : result;
            },

            set: function(fx) {

                hAzzle.style(fx.elem, fx.prop, fx.pos + fx.unit);
            }
        }
    }
}, hAzzle);

hAzzle.fxAfter.scrollTop = hAzzle.fxAfter.scrollLeft = {
    set: function(tween) {
        if (tween.elem.nodeType && tween.elem.parentNode) {
            tween.elem[tween.prop] = tween.now;
        }
    }
};