var frame = hAzzle.RAF(),
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
     *
     * The current CSS style are cached on the object, so we
     * only perform DOM querying once when we do a sequence of
     * animations.
     */

    cur: function() {

        var prop = this.prop,
            elem = this.elem,
            getFXCSS = (function(self, prop) {
                var hooks = hAzzle.fxAfter[prop];
                return hooks && hooks.get ?
                    hooks.get(self) :
                    hAzzle.fxAfter._default.get(self);
            });

        // Create cache for new elements
        // Note! This will only be done if it hasn't been created
        // from inside the CSS module yet.

	     hAzzle.styleCache(elem);      

        // If undefined / not cached yet - cache it, and return

        if (hAzzle.data(elem, fxPrefix).prevState[prop] === undefined) {
            return hAzzle.data(elem, fxPrefix).prevState[prop] = getFXCSS(this, prop);

        } else {

            return hAzzle.data(elem, fxPrefix).prevState[prop];
        }
    },

    run: function(from, to, unit) {

        var complete, val,
            self = this,
            done = true,
            callback = {

                animate: function(currentTime, jumpToEnd) {

                    var i, delta = currentTime - self.start,
                        options = self.options,
                        style = self.elem.style,
                        v;

                    if (delta > self.duration || jumpToEnd) {

                        // Save the property state so we know when we have completed 
                        // the animation

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

                            // Set the overflow back to the state the properties 
                            // had before animation started

                            if (options.overflow) {

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

                    // NOTE!! There exist bugs in this calculations for Android 2.3, but
                    // hAzzle are not supporting Android 2.x so I'm not going to fix it

                    if (typeof self.diff === 'object') {

                        // Calculate easing for Object.
                        // Example it can be usefull if animation CSS transform
                        // with X, Y, Z values

                        for (v in self.diff) {

                           self.pos = {}
                           self.pos[v] = (self.diff[v].end - self.diff[v].start) * hAzzle.easing[self.easing](delta / self.duration) + self.diff[v].start;
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

        /**
         * Future plans after animation queue are finished will be
         * to cache the end state of each property on the object
         * so if we have a sequence, it will remember the previous
         * state, so there will be no need for DOM querying
         */

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

    animate: function(opts, speed, callback) {

        var opt;

        if (typeof speed === 'object') {

            opt = hAzzle.shallowCopy({}, speed);

        } else {

            opt = {};

            // Callback

            opt.complete = (!callback && typeof speed === 'function') ? speed : callback;

            // Duration

            opt.duration = typeof speed === 'number' ? speed :
                opt.duration in hAzzle.speeds ?
                // Support for jQuery			
                hAzzle.speeds[opt.duration.toString().toLowerCase()] :
                /* Default speed */
                550

            // If the user is attempting to set a duration under 100, adjust it back to
            // 100 to avoid bugs that can occur ( 100 is fast enough)

            if (opt.duration < 100) {
                opt.duration = 100;
            }
        }

        return this.each(function() {

            var index, val, anim, hooks, name, unit, style = this.style,
                parts, target, end, start, scale, maxIterations, display;

            // Height/width overflow pass

            if (this.nodeType === 1 && ('height' in opts || 'width' in opts)) {

                opt.overflow = [style.overflow, style.overflowX, style.overflowY];

                display = hAzzle.css(this, 'display');

                // Test default display if display is currently 'none'
                display === 'none' ?
                    hAzzle.getPrivate(this, 'olddisplay') || defaultDisplay(this.nodeName) : display;

                if (display === 'inline' && hAzzle.css(this, 'float') === 'none') {

                    style.display = 'inline-block';
                }
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
					
					hooks = hooks(this, index, val, opts);

                    // Animation are started from inside of this hook 

                    anim.run(anim.cur(), hooks, ' ');

                } else {

                    // Unit Conversion	

                    parts = relarelativesRegEx.exec(val);

                    target = anim.cur();

                    if (parts) {
                        end = parseFloat(parts[2]);
                        unit = parts[3] || (hAzzle.unitless[index] ? '' : 'px');

                        // Starting value computation is required for potential unit mismatches
                        start = (hAzzle.unitless[index] || unit !== 'px' && +target) &&
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

                                scale = scale || '.5';

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
                hAzzle.data(elem, 'display', 'auto');
            }

            if (value === 'auto') {
                value = hAzzle.getDisplayType(elem);

            }

            // Save it!

            hAzzle.data(elem, 'display', value);

            return value;
        },

        visibility: function(elem, value) {

            // If the element was hidden in the previous call, revert display 
            // to 'auto' prior to reversal so that the element is visible again.

            if ((value = hAzzle.data(elem, 'visibility')) === 'hidden') {
                hAzzle.data(elem, 'visibility', 'visible');

                return value;
            }

            value = value.toString().toLowerCase();

            hAzzle.data(elem, 'display', value);

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
    },
    speeds: {
        slow: 1500,
        medium: 400,
        fast: 200
    },

}, hAzzle);

hAzzle.fxAfter.scrollTop = hAzzle.fxAfter.scrollLeft = {
    set: function(fx) {
        if (fx.elem.nodeType && fx.elem.parentNode) {
            fx.elem[fx.prop] = fx.pos;
        }
    }
};