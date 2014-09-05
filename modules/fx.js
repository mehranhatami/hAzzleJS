var frame = RAF(),
    relarelativesRegEx = /^(?:([+-])=|)([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))([a-z%]*)$/i,
    fixTick = false, // feature detected below
    dictionary = [],

    fxPrefix = 'CSS',

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

    /**
     * Get current CSS styles for the animated object.
     * NOTE!! hAzzle are caching this, so if same object
     * are animated, you only perform DOM querying once
     */

    cur: function() {

        var prop = this.prop,
            elem = this.elem,
            getFXCSS = (function(self, prop) {

                var hooks = hAzzle.fxAfter[prop];
                return hooks && hooks.get ?
                    hooks.get(self) :
                    hAzzle.fxAfter._default.get(self)
            });

        // Create cache for new elements

        hAzzle.styleCache(elem);

        // If undefined / not cached yet - cache it, and return

        if (hAzzle.data(elem, fxPrefix).prevState[prop] === undefined) {
            console.log('caching just NOW')
            return hAzzle.data(elem, fxPrefix).prevState[prop] = getFXCSS(this, prop);
        } else {
            console.log('data cached')
            return hAzzle.data(elem, fxPrefix).prevState[prop];
        }
    },

    run: function(from, to, unit) {

        var complete, from, val,

            self = this,
            done = true,
            callback = {

                animate: function(currentTime, jumpToEnd) {

                    var i, index, delta = currentTime - self.start,
                        options = self.options,
                        style = self.elem.style,
                        v;

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

                            if (options.overflow != null) {

                                style.overflow = options.overflow[0];
                                style.overflowX = options.overflow[1];
                                style.overflowY = options.overflow[2];
                            }
                            // Execute the complete function

                            complete = options.complete;

                            if (complete) {

                                options.complete = false;
                                complete.call(self.elem);
                            }
                        }
                        return false;
                    }

                    // NOTE!! There exist bugs in this calculations for Android 2.3	, but
                    // hAzzle are not supporting Android 2.x so I'm not going to fix it

                    if (typeof this.diff === 'object') {

                        for (v in this.diff) {

                            self.pos[v] = (this.diff[v].end - this.diff[v].start) * hAzzle.easing[self.easing](delta / self.duration) + self.diff[v].start;
                        }

                    } else {

                        // Do not use Math.max for calculations it's much slower!
                        // http://jsperf.com/math-max-vs-comparison/3

                        self.pos = self.diff * hAzzle.easing[self.easing](delta / self.duration) + self.from;
                    }

                    // Update the CSS style(s)

                    self.update();

                    return true;
                },

                elem: this.elem
            };

        this.from = from;

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

                rafId = frame.request(raf);
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

    animate: function(opts, speed, easing, callback) {

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

            var index, val, anim, hooks, name, unit, style = this.style;

            // Height/width overflow pass
            if (this.nodeType === 1 && ('height' in opts || 'width' in opts)) {
                opt.overflow = [style.overflow, style.overflowX, style.overflowY];
            }

            if (opt.overflow) {
                style.overflow = 'hidden';
            }

            for (index in opts) {

                val = opts[index];

                // Auto-set vendor prefixes. 
                // This is cached for better performance

                name = hAzzle.camelize(hAzzle.prefixCheck(index)[0]);

                if (index !== name) {
                    opts[name] = opts[index];
                    delete opts[index];
                }

                if (hAzzle.propertyMap[index]) {
                    val = hAzzle.propertyMap[index](this, index);
                }

                anim = new Tween(this, opt, index);

                hooks = hAzzle.fxBefore[index];

                if (hooks) {

                    // Animation are started from inside of this hook 

                    anim.run(hooks(this, index, val, anim), ' ', false);

                } else {

                    // Unit Conversion	

                    parts = relarelativesRegEx.exec(val);

                    target = anim.cur();

                    if (parts) {
                        end = parseFloat(parts[2]);
                        unit = parts[3] || (hAzzle.unitless[index] ? '' : 'px');

                        // Starting value computation is required for potential unit mismatches
                        start = (hAzzle.unitless[index] || unit !== "px" && +target) &&
                            relarelativesRegEx.exec(hAzzle.css(this, index)),
                            scale = 1,
                            maxIterations = 20;

                        // We need to compute starting value
                        if (start && start[3] !== unit) {

                            // Trust units reported by jQuery.css
                            unit = unit || start[3];

                            // Make sure we update the tween properties later on
                            parts = parts || [];

                            // Iteratively approximate from a nonzero starting point
                            start = +target || 1;


                            do {

                                scale = scale || ".5";

                                // Adjust and apply
                                start = start / scale;
                                hAzzle.style(this, index, start + unit);

                            } while (
                                scale !== (scale = anim.cur() / target) && scale !== 1 && --maxIterations
                            );
                        }

                        if (parts) {

                            start = +start || +target || 0;

                            // If a +=/-= token was provided, we're doing a relative animation
                            end = parts[1] ?
                                start + (parts[1] + 1) * parts[2] :
                                +parts[2];
                        }
                        anim.run(start, end, unit);

                    } else {

                        anim.run(anim.cur(), val, '');
                    }
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

/* ============================ UTILITY METHODS =========================== */

function raf(timestamp) {
    if (rafId) {
        frame.request(raf);
        render(timestamp);
    }
}

function render(tick) {

    if (fixTick) {
        tick = frame.perfNow();
    }

    var timer, i = 0;

    for (; i < dictionary.length; i++) {

        timer = dictionary[i];

        if (!timer.animate(tick) &&
            dictionary[i] === timer) {
            dictionary.splice(i--, 1);
        }
    }

    if (!dictionary.length) {

        frame.cancel(rafId);

        // Avoid memory leaks

        rafId = null;
    }
}

/* ============================ INTERNAL =========================== */

hAzzle.extend({

    propertyMap: {

        display: function(elem, value) {

            // If the element was hidden in the previous call, revert display 
            // to 'auto' prior to reversal so that the element is visible again.

            if ((value = hAzzle.data(elem, 'display')) === 'none') {
                hAzzle.data(elem, 'display', 'auto')
            }

            if (value === 'auto') {
                value = hAzzle.getDisplayType(elem);

                if (value === 'inline' && hAzzle.css(elem, 'float') === 'none') {

                    elem.style.display = 'inline-block';
                }

            } else {

                value = hAzzle.css(elem, "display");

                // Test default display if display is currently "none"
                value === "none" ?
                    hAzzle.getPrivate(elem, "olddisplay") || defaultDisplay(elem.nodeName) : display;

                if (value === 'inline' && hAzzle.css(elem, 'float') === 'none') {

                    elem.style.display = 'inline-block';
                }


            }


            // Save it!

            hAzzle.data(elem, 'display', value)

            return value;
        },

        visibility: function(elem, value) {

            // If the element was hidden in the previous call, revert display 
            // to 'auto' prior to reversal so that the element is visible again.

            if ((value = hAzzle.data(elem, 'visibility')) === 'hidden') {
                hAzzle.data(elem, 'visibility', 'visible')

                return value;
            }

            value = value.toString().toLowerCase()

            hAzzle.data(elem, 'display', value)

            return value;

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
    set: function(fx) {
        if (fx.elem.nodeType && fx.elem.parentNode) {
            fx.elem[fx.prop] = fx.pos;
        }
    }
};