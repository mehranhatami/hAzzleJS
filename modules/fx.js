var frame = hAzzle.RAF(),
    relativeRegEx = /^(?:([+-])=|)([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))([a-z%]*)$/i,
    fixTick = false, // feature detected below
    tweens = [],
    rafId;

frame.request(function(timestamp) {
    fixTick = timestamp > 1e12 != frame.perfNow() > 1e12;
});

function FX(elem, options, prop, from, to, unit) {
    return new FX.prototype.initialize(elem, options, prop, from, to, unit);
}

hAzzle.FX = FX;

FX.prototype = {

    // constructor

    constructor: FX,

    /**
     * initialize
     * @param {Object} elem
     * @param {Object} options
     * @param {String} prop
     */

    initialize: function(elem, options, prop, from, to, unit) {

        this.elem = elem;
        this.prop = prop;
        this.currentState = {};
        this.options = options;
        this.easing = options.easing;
        this.unit = unit || this.unit || (hAzzle.unitless[this.prop] ? '' : 'px');
        this.from = from;
        this.to = to;

        var self = this,
            done = true,
            start = frame.perfNow();

        buhi({

            // Do animation on active tween

            animate: function(currentTime) {

                currentTime -= start;

                if (currentTime > self.options.duration) {

                    // Do we need it???                    

                    //self.update(to);

                    // Save the property state so we know when we have completed 
                    // the animation

                    self.currentState[self.prop] = true;

                    for (var i in self.currentState) {

                        if (self.currentState[i] !== true) {
                            done = false;
                        }
                    }

                    // Restore CSS properties

                    done && self.restore();

                    return false;
                }

                self.step = hAzzle.easing[self.easing](currentTime / self.options.duration);
                self.tick(self.step, to, from);
                self.update();
                return true;
            },

            // Stop running animation inside the active tween

            stop: function(jump) {

                if (jump) { // jump to end of animation?

                    self.pos = self.to;
                    self.step = 1;
                    self.update(to);

                } else {

                    self.options.complete = null; // remove callback if not jumping to end
                }

                // Restore CSS properties to original state

                self.restore();
            },

            // Element we are animating

            elem: self.elem,

            // Queue options

            queue: self.options.queue
        });
    },

    update: function() {

        var hooks = hAzzle.fxAfter[this.prop];

        if (hooks && hooks.set) {
            hooks.set(this);
        } else {
            hAzzle.fxAfter._default.set(this);
        }
    },

    // Restore properties, and fire callback

    restore: function() {

        // Set CSS values back to original state

        var complete = this.options.complete,
            orgValueProp,
            originalValues = this.options.originalValues;
        for (orgValueProp in originalValues) {
            this.elem.style[orgValueProp] = originalValues[orgValueProp];
        }

        // Execute the complete function

        if (complete) {
            this.options.complete = false;
            complete.call(this.elem);
        }
    },

    /**
     * Run animation
     * @param {Number|Object} from
     * @param {Number|Object} to
     * @param {Number} unit
     */

  

    // Update current CSS properties

    tick: function(pos, to, from) {

        if (typeof from == 'object') {
            var index;
            this.pos = {};

            // Math.floor are faster then Math.round, but I don't like
            // none of them, but the problem we face are simple. Longer
            // float values - more memory used


            for (index in from) {

                this.pos[index] = (index in to) ?
                    Math.floor(((to[index] - from[index]) * pos + from[index]) * 1000) / 1000 :
                    from[index];
            }

        } else {

             this.pos = Math.floor(((to - from) * pos + from) * 1000) / 1000;
        }

        // Progress / step function

        if (this.options.step) {
            this.options.step.call(this.elem, this.elem, this.pos, this);
        }
    }
};

FX.prototype.initialize.prototype = FX.prototype;

hAzzle.extend({

    /**
     *  Perform a custom animation of a set of CSS properties.
     *
     *  hAzzle( ELEMENT ).animate ( { PROPERTIES}, { SETTINGS}   )
     *
     * Example:
     *
     * hAzzle(div).animate ( { width:200, height:200}, {
     *
     *   easing: 'linear',
     *    duration: 900

     *  })
     *
     * Short hand exist also:
     *
     *  hAzzle( ELEMENT ).animate ( { PROPERTIES}, DURATION, CALLBACK )
     *
     * Example:
     *
     * hAzzle(div).animate ( { width:200, height:200}, 999, function() {
     *
     * console.log('Hello! I'm a callback!' );
     * });
     *
     */

    animate: function(opts, speed, callback) {

        // opts has to be a object, 

        if (typeof opts !== 'object') {
            return false;
        }

        var opt;

        if (typeof speed === 'object') {

            opt = hAzzle.shallowCopy({}, speed);

        } else {

            opt = {};

            // Callbacks

            opt.complete = (!callback && typeof speed === 'function') ? speed : callback;

            // Duration

            opt.duration = typeof speed === 'number' ? speed :
                opt.duration in hAzzle.speeds ?
                // Support for jQuery's named durations
                hAzzle.speeds[opt.duration] : /* Default speed */ hAzzle.defaultDuration;
        }

        opt.duration = (hAzzle.speeds[opt.duration] || opt.duration) || hAzzle.defaultDuration;

        // If the user is attempting to set a duration under 100, adjust it back to
        // 100 to avoid bugs that can occur ( 30 is fast enough)

        if (opt.duration < 100) {
            opt.duration = 100;
        }

        // 'begin, 'step' and 'complete' has to be functions. Otherwise, default to null.

        if (opt.begin && !hAzzle.isFunction(opt.begin)) {
            opt.begin = null;
        }


        if (opt.step && !hAzzle.isFunction(opt.step)) {
            opt.step = null;
        }

        if (opt.complete && !hAzzle.isFunction(opt.complete)) {
            opt.complete = null;
        }

        // Easing

        if (!hAzzle.easing[opt.easing]) {
            if (hAzzle.easing[hAzzle.defaultEasing]) {
                opt.easing = hAzzle.defaultEasing;
                // Otherwise, use the same easing as jQuery's default easing type
            } else {
                opt.easing = 'swing';
            }
        }

        // Queue

        if (opt.queue == null || opt.queue === true) {
            opt.queue = 'fx';
        }

        opt.old = opt.complete;

        opt.complete = function() {

            if (hAzzle.isFunction(opt.old)) {
                opt.old.call(this);
            }

            if (opt.queue !== false) {
                hAzzle.dequeue(this, opt.queue);
            }
        };

        // Begin the animation

        function runAnimation() {

            var elem = this,
                unit, orgValueProp,
                prop, endValue, name, style = elem.style,
                startValue,
                parts;

            // Display & Visibility
            // Note: We strictly check for undefined instead of falsiness because display accepts an empty string value.

            if (opts.display !== undefined && opts.display !== null) {
                opts.display = opts.display.toString().toLowerCase();

                // Users can pass in a special 'auto' value to instruct hAzzle to set the 
                // element to its default display value.

                if (opts.display === 'auto') {
                    opts.display = hAzzle.getDisplayType(elem);
                }
            }

            if (opts.visibility) {
                opts.visibility = opts.visibility.toString().toLowerCase();
            }

            if (elem.nodeType === 1) {

                // Backup the original CSS values on the animated object

                opt.originalValues = {};

                for (orgValueProp in hAzzle.originalValues) {
                    opt.originalValues[orgValueProp] = elem.style[orgValueProp];
                }

                // Allways set overflow to 'hidden'
                // Are you agree in this, Mehran??
                style.overflow = 'hidden';
            }

            // Function to be 'fired before the animation starts
            // Executed functions param will be same as the animated element

            if (opt.begin) {

                // We throw callbacks in a setTimeout so that thrown errors don't halt the execution 
                // of hAzzle itself.
                try {
                    opt.begin.call(elem, elem);
                } catch (error) {
                    setTimeout(function() {
                        throw 'Something went wrong!';
                    }, 1);
                }
            }

            // Can't use hAzzle.each here too slow, but we could optimize this
            // as you suggested before, Mehran, then we can use hAzzle.each
            // for the iteration

            for (prop in opts) {

                // Parse CSS properties before animation

                endValue = opts[prop];

                // Force the property to its camelCase styling to normalize it for manipulation

                name = hAzzle.camelize(prop);

                // Swap properties if no match

                if (prop !== name) {
                    opts[name] = opts[prop];

                    // Remove the old property

                    delete opts[prop];
                }

                // Properties that are not supported by the browser will inherently produce no style changes 
                // when set, so they are skipped in order to decrease animation tick overhead.
                // Note: Since SVG elements have some of their properties directly applied as HTML attributes,
                //  there is no way to check for their explicit browser support, and so we skip this check for them.

                if (!hAzzle.private(elem).isSVG && hAzzle.prefixCheck(name)[1] === false) {
                    hAzzle.error('Skipping [' + prop + '] due to a lack of browser support.');
                    continue;
                }

                // propertyMap hook for option parsing

                if (hAzzle.propertyMap[prop]) {
                    endValue = hAzzle.propertyMap[prop](elem, prop);
                }
            // Get startValue

                startValue = hAzzle.fxBefore[name] ?
                    hAzzle.fxBefore[name].start(elem, name, opts[prop]) :
                    hAzzle.fxBefore._default(elem, name, opts[prop]);

                // Convert CSS null-values to an integer of value 0.

                if (hAzzle.isZeroValue(startValue)) {
                    startValue = 0;
                }

                // If the display option is being set to a non-'none' (e.g. 'block') and opacityis being
                // animated to an endValue of non-zero, the user's intention is to fade in from invisible, thus 
                // we forcefeed opacity a startValue of 0 


                if ((prop === 'display' && startValue !== 'none') ||
                    (prop === 'visible' && startValue !== 'hidden') &&
                    prop === 'opacity' && !startValue && prop !== 0) {
                    startValue = 0;
                }

                // Only parse the endValue if it's existing a hook for it

	            endValue = hAzzle.fxBefore[name] ? 
                           hAzzle.fxBefore[name].end(elem, name, opts[prop], startValue) : 
						   opts[prop]; 
                
				// Units
				
                if ((parts = relativeRegEx.exec(endValue))) {

                    var target = startValue,
                        scale = 1,
                        maxIterations = 20;

                    if (parts) {

                        endValue = parseFloat(parts[2]);

                        unit = parts[3] || (hAzzle.unitless[prop] ? '' : 'px');

                        startValue = (hAzzle.unitless[prop] || unit !== 'px' && +target) &&
                            relativeRegEx.exec(hAzzle.css(elem, prop));

                        // We need to compute starting value
                        if (startValue && startValue[1] !== unit) {

                            unit = unit || startValue[1];

                            // Make sure we update the FX properties later on
                            parts = parts || [];

                            // Iteratively approximate from a nonzero starting point
                            startValue = +target || 1;

                            do {

                                scale = scale || '.5';

                                // Adjust and apply
                                startValue = startValue / scale;
                                elem.style[prop] = startValue + unit;

                            } while (

                                scale !== (scale = parseFloat(hAzzle.css(elem, prop)) / target) && scale !== 1 && --maxIterations
                            );
                        }

                        if (parts) {

                            startValue = +startValue || +target || 0;

                            switch (parts[1]) {
                                case '+':
                                    endValue = startValue + endValue;
                                    break;

                                case '-':
                                    endValue = startValue - endValue;
                                    break;

                                case '*':
                                    endValue = startValue * endValue;
                                    break;

                                case '/':
                                    endValue = startValue / endValue;
                                    break;
                            }
                        }
                    }
                }


                // Create a new FX instance, and start the animation

                 new FX(elem, opt, prop, startValue, endValue, unit);
            }
        }

        return opt.queue === false ?
            this.each(runAnimation) :
            this.queue(opt.queue, runAnimation);
    },

    stop: function(type, clear, jump) {
        var stopQueue = function(elem, data, i) {
            var runner = data[i];
            hAzzle.removePrivate(elem, i, true);
            runner.stop(jump);
        };

        if (typeof type !== 'string') {

            jump = clear;
            clear = type;
            type = undefined;
        }

        if (clear && type !== false) {
            this.queue(type || 'fx', []);
        }

        return this.each(function() {

            var dequeue = true,
                index, timers = tweens,
                data = hAzzle.private(this);


            if (type) {
                if (data[index] && data[index].stop)
                    stopQueue(this, data, index);

            } else {
                for (index in data) {
                    if (data[index] && data[index].stop) {

                        stopQueue(this, data, index);
                    }
                }
            }

            for (index = timers.length; index--;) {
                if (timers[index].elem === this && (!type || tweens[index].queue === type)) {
                    tweens[index].stop(jump);
                    dequeue = false;
                    timers.splice(index, 1);
                }
            }

            if (dequeue || jump) {
                hAzzle.dequeue(this, type);
            }

        });
    },

    queue: function(type, data) {

        if (typeof type !== 'string') {
            data = type;
            type = 'fx';
        }

        if (data === undefined) {
            return hAzzle.queue(this[0], type);
        }

        return this.each(function() {
            var queue = hAzzle.queue(this, type, data);

            // Auto-Dequeuing

            if (type === 'fx' && queue[0] !== 'chewing ...') {
                hAzzle.dequeue(this, type);
            }
        });
    },
    dequeue: function(type) {
        return this.each(function() {
            hAzzle.dequeue(this, type);
        });
    },

    clearQueue: function(type) {
        return this.queue(type || 'fx', []);
    }
});

/* ============================ UTILITY METHODS =========================== */

function raf(timestamp) {
    if (rafId) {
        frame.request(raf);
        render(timestamp);
    }
}

function buhi(callback) {
    tweens.push(callback);
    if (callback.animate()) {
        if (!rafId) {
            rafId = frame.request(raf);
        }
    } else {
        tweens.pop();
    }
}

function render(timestamp) {

    if (fixTick) {
        timestamp = frame.perfNow();
    }
    var tween, i = 0;

    for (; i < tweens.length; i++) {
        tween = tweens[i];
        // Check if the tween has not already been removed
        if (!tween.animate(timestamp) && tweens[i] === tween) {
            tweens.splice(i--, 1);
        }
    }

    if (!tweens.length) {

        frame.cancel(rafId);

        // Avoid memory leaks

        rafId = null;
    }
}

/* ============================ INTERNAL =========================== */

hAzzle.extend({

    // Default duration

    defaultDuration: 500,

    originalValues: {
        overflow: null,
        overflowX: null,
        overflowY: null,
        boxSizing: null,
    },

    propertyMap: {

        display: function(elem, value) {

            // If the element was hidden in the previous call, revert display 
            // to 'auto' prior to reversal so that the element is visible again.

            if ((value = hAzzle.data(elem, 'display')) === 'none') {
                hAzzle.data(elem, 'display', 'auto');
            }

            // Store the display value

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

            // Store the visibility value

            hAzzle.data(elem, 'visibility', value);

            return value;
        }
    },

    fxBefore: {

        _default: function(elem, prop) {

            var result;

            if (prop !== null && (!getStyles(elem) || prop === null)) {
                return prop;
            }

            result = hAzzle.css(elem, prop, '');

            // Empty strings, null, undefined and 'auto' are converted to 0.
            return !result || result === 'auto' ? 0 : result;

        }
    },

    fxAfter: {

        opacity: {

            set: function(fx) {
                fx.elem.style[fx.prop] = fx.pos;
            }
        },
        _default: {

            set: function(fx) {

                if (fx.elem.style &&
                    (fx.elem.style[hAzzle.cssProps[fx.prop]] !== null ||
                        hAzzle.cssHooks[fx.prop])) {
                    hAzzle.style(fx.elem, fx.prop, fx.pos + fx.unit);
                } else {
                    fx.elem[fx.prop] = fx.pos;
                }
            }
        }
    },
    speeds: {
        slow: 1500,
        medium: 400,
        fast: 200
    },

    queue: function(elem, type, data) {

        if (elem) {

            type = (type || 'fx') + 'queue';

            var queueDta = hAzzle.getPrivate(elem),
                q = queueDta.type;

            // Speed up dequeue by getting out quickly if this is just a lookup

            if (!data) {
                return q || [];
            }

            if (!q || hAzzle.isArray(data)) {

                q = queueDta.type = hAzzle.mergeArray(data);

            } else {
                q.push(data);
            }

            return q;
        }
    },

    dequeue: function(elem, type) {

        type = type || 'fx';

        var queueDta = hAzzle.getPrivate(elem),
            queue = hAzzle.queue(elem, type),
            fn = queue.shift();

        if (fn === 'chewing ...') {
            fn = queue.shift();
        }

        if (fn) {
            if (type === 'fx') {
                queue.unshift('chewing ...');
            }

            fn.call(elem, function() {
                hAzzle.dequeue(elem, type);
            });
        }

        if (!queue.length) {
            delete queueDta.qtype;
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