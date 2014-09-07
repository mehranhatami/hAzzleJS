var frame = hAzzle.RAF(),
    relarelativesRegEx = /^(?:([+-])=|)([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))([a-z%]*)$/i,
    fixTick = false, // feature detected below
    tweens = [],
    rafId;

frame.request(function(timestamp) {
    fixTick = timestamp > 1e12 != frame.perfNow() > 1e12;
});

function FX(elem, options, prop) {
    return new FX.prototype.initialize(elem, options, prop);
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

    initialize: function(elem, options, prop) {

        this.elem = elem;
        this.prop = prop;
        this.currentState = {};
        this.options = options;
        this.easing = options.easing;

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
            hooks = hAzzle.fxAfter[this.prop];
			
			
		return hooks && hooks.get ?
            hooks.get(this) :
            hAzzle.fxAfter._default.get(this);
			
	
		
		

			
			
			
			
    },

    /**
     * Run animation
     * @param {Number|Object} from
     * @param {Number|Object} to
     * @param {Number} unit
     */

    run: function(from, to, unit) {

        this.from = from;
        this.unit = unit || this.unit || (hAzzle.unitless[this.prop] ? '' : 'px');
        this.start = frame.perfNow();
        this.pos = 0;
        this.to = to;

        // Set some variabels

        var self = this,
            done = true,
            isRunning = true;

        buhi({

            // Do animation on active tween

            animate: function(currentTime) {

                var i, delta = currentTime - self.start,
                    options = self.options,
                    v, from = self.from,
                    to = self.to,
                    duration = options.duration;

                self.currentTime = currentTime;
                self.deldu = hAzzle.easing[self.easing](delta / duration);

                if (delta > duration && isRunning) {

                    // Mark it as stopped

                    isRunning = false;

                    // Save the property state so we know when we have completed 
                    // the animation

                    self.currentState[self.currentState.prop] = true;

                    for (i in self.currentState) {
                        if (self.currentState[i] !== true) {
                            done = false;
                        }
                    }

                    if (done) {
                        self.finished();
                    }

                    return false;
                }

                // NOTE!! There exist bugs in this calculations for Android 2.3, but
                // hAzzle are not supporting Android 2.x so I'm not going to fix it

                if (typeof from === 'object') {
                    for (v in from) {
                        self.pos = {};
                        self.pos[v] = from[v] + (to[v] - from[v]) * self.deldu;
                    }

                } else {
                    self.pos = from + ((to - from) * self.deldu);
                }
                // Set CSS styles

                self.update();


                return true;
            },

            // Stop running animation inside the active tween

            stop: function(jump) {

                isRunning = false;

                if (jump) {

                    // Only do style update if jump 

                    self.pos = self.to;
                    self.deldu = 1;
                    self.update();

                } else {

                    self.options.complete = null; // remove callback if not jumping to end
                }

                self.finished();
            },

            // Element we are animating

            elem: self.elem,

            // Queue options

            queue: self.options.queue
        });
    },

    // Restore properties, and fire callback

    finished: function() {

        // Set the overflow back to the state the properties 
        // had before animation started

        if (this.options.overflow) {

            var style = this.elem.style,
                options = this.options;

            style.overflow = options.overflow[0];
            style.overflowX = options.overflow[1];
            style.overflowY = options.overflow[2];
        }

        // Execute the complete function

        var complete = this.options.complete;

        if (complete) {
            this.options.complete = false;
            complete.call(this.elem);
        }
    },

    // Update current CSS properties

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

            // 'begin, 'progress' and 'complete' has to be functions. Otherwise, default to null.

            if (opt.begin && hAzzle.isFunction(opt.begin)) {
                opt.begin = null;
            }

            if (opt.progress && hAzzle.isFunction(opt.progress)) {
                opt.progress = null;
            }

            if (opt.complete && hAzzle.isFunction(opt.complete)) {
                opt.complete = null;
            }

            // Duration

            opt.duration = typeof speed === 'number' ? speed :
                opt.duration in hAzzle.speeds ?
                // Support for jQuery's named durations
                hAzzle.speeds[opt.duration] : /* Default speed */ hAzzle.defaultDuration;
        }

        opt.duration = (hAzzle.speeds[opt.duration] || opt.duration) || hAzzle.defaultDuration;

        // If the user is attempting to set a duration under 100, adjust it back to
        // 100 to avoid bugs that can occur ( 100 is fast enough)

        if (opt.duration < 100) {
            opt.duration = 100;
        }

        // Easing

        opt.easing = getEasing(opt.easing, opt.duration);

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

        function buildQueue() {

            var elem = this,
                index, val, anim, hooks, name, style = elem.style,
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

            // Height && width
            if (elem.nodeType === 1) {
                if (opts.height || opts.width) {
                    opt.overflow = [style.overflow, style.overflowX, style.overflowY];
                }

                if (opt.overflow) {
                    style.overflow = 'hidden';
                }
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

                val = opts[prop];

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
                    hAzzle.error("Skipping [" + prop + "] due to a lack of browser support.");
                    continue;
                }

                // propertyMap hook for option parsing

                if (hAzzle.propertyMap[prop]) {
                    val = hAzzle.propertyMap[prop](elem, prop);
                }

                // Create a new FX instance
              
			    anim = new FX(elem, opt, prop);
			  
			    // Get start value
			  
			     startValue = anim.cur();

            // If the display option is being set to a non-"none" (e.g. "block") and opacityis being
            // animated to an endValue of non-zero, the user's intention is to fade in from invisible, thus 
            // we forcefeed opacity a startValue of 0 
			
		  if( (prop === 'display' && startValue !== 'none') || 
		      (prop === 'visible' && startValue !== 'hidden' ) &&  
			   prop === 'opacity' && !startValue && index !== 0) {
                      startValue = 0;		
			}

          // 'fxBefore' are hooks used to parse CSS properties before animation starts.
          // Usefull for CSS transform where the startValue and endValue can be  
          // converted to a object before the animation tick starts

                hooks = hAzzle.fxBefore[prop];

                if (hooks) {

                    hooks = hooks(elem, prop, val, opts);

                    // Animation are started from inside of this hook 

                    anim.run(startValue, hooks, ' ');
              
			    // If no hooks, continue...
               
			    } else {

                    // Unit Conversion	

                    if ((parts = relarelativesRegEx.exec(val))) {

                        calculateRelatives(elem, parts, prop, anim);

                    } else {

                        anim.run(startValue, val, '');
                    }
                }
            }
        }

        return opt.queue === false ?
            this.each(buildQueue) :
            this.queue(opt.queue, buildQueue);
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

            if (type === 'fx' && queue[0] !== 'inprogress') {
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
    },
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

    var tween, i = 0;

    for (; i < tweens.length; i++) {
        tween = tweens[i];
        // Check if the tween has not already been removed
        if (!tween.animate(tick) && tweens[i] === tween) {
            tweens.splice(i--, 1);
        }
    }

    if (!tweens.length) {

        frame.cancel(rafId);

        // Avoid memory leaks

        rafId = null;
    }
}

function calculateRelatives(elem, parts, prop, anim) {

    var target = anim.cur(),
        end, start, unit, maxIterations, scale;

    if (parts) {
        end = parseFloat(parts[2]);
        unit = parts[3] || (hAzzle.unitless[prop] ? '' : 'px');

        // Starting value computation is required for potential unit mismatches
        start = (hAzzle.unitless[prop] || unit !== 'px' && +target) &&
            relarelativesRegEx.exec(hAzzle.css(elem, prop)),
            scale = 1, maxIterations = 20;

        // We need to compute starting value
        if (start && start[3] !== unit) {

            unit = unit || start[3];

            // Make sure we update the FX properties later on
            parts = parts || [];

            // Iteratively approximate from a nonzero starting point
            start = +target || 1;

            do {

                scale = scale || '.5';

                // Adjust and apply
                start = start / scale;
                hAzzle.style(elem, prop, start + unit);

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

// Determine the appropriate easing type given an easing input.

function getEasing(value, duration) {
    var easing = value;


    if (typeof value === 'string') {
        if (!hAzzle.easing[value]) {
            easing = false;
        }
    } else {
        easing = false;
    }

    if (easing === false) {
        if (hAzzle.easing[hAzzle.defaultEasing]) {
            easing = hAzzle.defaultEasing;
        } else {
            easing = 'flicker';
        }
    }
    console.log(easing)
    return easing;
}

/* ============================ INTERNAL =========================== */

hAzzle.extend({

    // Default duration

    defaultDuration: 500,

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

                if (prop !== null && (!getStyles(fx.elem) || prop === null)) {
                    return prop;
                }

                result = hAzzle.css(fx.elem, fx.prop, '');

                // Empty strings, null, undefined and 'auto' are converted to 0.
                return !result || result === 'auto' ? 0 : result;
            },

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

        if (!elem) {
            return;
        }

        var q;

        if (elem) {

            type = (type || 'fx') + 'queue';
            q = hAzzle.private(elem, type);


            // Speed up dequeue by getting out quickly if this is just a lookup
            if (!data) {
                return q || [];
            }

            if (!q || hAzzle.isArray(data)) {
                q = hAzzle.private(elem, type, hAzzle.mergeArray(data));

            } else {
                q.push(data);
            }

            return q;

        }
    },

    dequeue: function(elem, type) {

        type = type || 'fx';

        var queue = hAzzle.queue(elem, type),
            fn = queue.shift();

        // If the fx queue is dequeued, always remove the progress sentinel
        if (fn === 'inprogress') {
            fn = queue.shift();
        }

        if (fn) {
            // Add a progress sentinel to prevent the fx queue from being
            // automatically dequeued
            if (type === 'fx') {
                queue.unshift('inprogress');
            }

            fn.call(elem, function() {

                hAzzle.dequeue(elem, type);
            });
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