// fx.js

/**
 * TODO!!
 *
 * - Add function to kill all animations running in a queue
 */


var foreign, nRAF, nCAF,
    perf = window.performance,
    lastTime = 0,

    fxPrefix = 'hAzzleFX',

    // Default duration value

    fxDuration = 500,

    // Default easing value

    fxEasing = 'linear',

    // Various regex we are going to use

    showhidetgl = /^(?:toggle|show|hide)$/,
    relativevalues = /^(?:([+-])=|)([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))([a-z%]*)$/i,

    // rAF ID

    rafId;

// Test if we are within a foreign domain. Use raf from the top if possible.

try {
    // Accessing .name will throw SecurityError within a foreign domain.
    foreign = window.top;
} catch (e) {
    foreign = window;
}

// Performance.now()

var perfNow = perf.now || perf.webkitNow || perf.msNow || perf.mozNow,
    pnow = perfNow ? function() {
        return perfNow.call(perf);
    } : function() {
        return hAzzle.now();
    };

// Grab the native implementation.

nRAF = foreign.requestAnimationFrame;
nCAF = foreign.cancelAnimationFrame || foreign.cancelRequestAnimationFrame;

// if native rAF and cAF fails, fallback to a vendor
// prefixed one, if that fails too, use polyfill

if (!nRAF && !nCAF) {

    // RequestAnimationFrame

    nRAF =
        foreign.webkitRequestAnimationFrame ||
        foreign.mozRequestAnimationFrame ||
        foreign.oRequestAnimationFrame ||
        foreign.msRequestAnimationFrame ||
        function(callback) {
            var currTime = hAzzle.now(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                id = window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
            lastTime = currTime + timeToCall;
            return id; // return the id for cancellation capabilities
        };

    // CancelAnimationFrame
    nCAF =
        foreign.webkitCancelAnimationFrame ||
        foreign.webkitCancelRequestAnimationFrame ||
        foreign.mozCancelAnimationFrame ||
        foreign.oCancelAnimationFrame ||
        foreign.msCancelAnimationFrame ||
        function(id) {
            clearTimeout(id);
        };
}

/* ============================ FX =========================== */

function FX(elem, options, prop, easing) {
    return new FX.prototype.init(elem, options, prop, easing);
}

hAzzle.FX = FX;

/* ============================ FX PROTOTYPE CHAIN=========================== */

FX.prototype = {

    /**
     * Init
     *
     * @param {Object} elem
     * @param {Object} options
     * @param {Object} prop
     * @param {String|Function } easing
     * @return {hAzzle|Object}
     */

    init: function(elem, options, prop, easing) {

        this.options = options;
        this.elem = elem;
        this.prop = prop;
        this.easing = easing || fxEasing;
        this.now = 0;
        this.currentState = {};
        this.originalState = {};

        // This will and can be overwritten

        this.unit = hAzzle.unitless[prop] ? '' : 'px';
    },

    /**
     * Update the CSS style values during the animation
     */

    update: function() {

        var self = this,
            prop = self.prop,
            elem = self.elem,
            style = elem.style,
            now = self.now,
            hooks = hAzzle.fxHooks[prop];

        if (self.options.step) {
            self.options.step.call(elem, self.now, self);
        }

        // If any 'hooks' - use it

        if (hooks && hooks.set) {

            hooks.set(self);

        } else {

            if (style && hAzzle.cssHooks[prop]) {
                hAzzle.style(elem, prop, now + self.unit);
            } else {
                elem[prop] = now;
            }
        }

        return;
    },

    /**
     * Get the current CSS style
     */

    curStyle: function() {

        var self = this,
            prop = self.prop,
            result,
            elem = self.elem,
            style = elem.style,
            hooks = hAzzle.fxHooks[prop];


        if (hooks && hooks.get) {

            hooks.get(self);

        } else {

            // If no fxHooks, get current CSS style the
            // 'normal' way 

            if (elem[prop] !== null &&
                (!style || style[prop]) == null) {
                return curCSS(elem, prop);
            }

            result = hAzzle.css(elem, prop, '');

            // Empty strings, null, undefined and 'auto' are converted to 0.

            return !result || result === 'auto' ? 0 : result;
        }
    },

    /**
     * Start and run the animation
     *
     * @param {Number} start
     * @param {Number} end
     * @return {hAzzle}
     */

    run: function(start, end) {

        var self = this,
            percent = 0,
            pos = 0,
            elem = self.elem,
            currentTime = pnow(),
            options = self.options,
            currentState = self.currentState,
            originalState = self.originalState,
            duration = options.duration,
            callback = hAzzle.shallowCopy(function(gotoEnd) {

                var lastTickTime = pnow(),
                    i,
                    done = true;
                
				// Do animation if we are not at the end

                if (gotoEnd || lastTickTime >= duration + currentTime) {

                    self.now = end;
                    pos = percent = 1;
                    self.update();

                    currentState[self.prop] = true;

                    for (i in currentState) {
                        if (currentState[i] !== true) {
                            done = false;
                        }
                    }

                    if (done) {

                        resetCSS(elem, options, currentState, originalState);
                    }

                    return false;

                } else {

                    // Calculate easing, and perform the next step of the
                    // animation

                    percent = (lastTickTime - currentTime) / duration;
                    pos = hAzzle.easing[self.easing](percent, duration * percent, 0, 1, duration);
                    self.now = start + ((end - start) * pos);

                    self.update();
                }

                return true;

            }, {
                elem: this.elem,

                // Save current animation state on the DOM element

                fxState: fxState(elem, self.prop, options, start, end)
            });

        // Push the callback into the dictionary array

        hAzzle.dictionary.push(callback);

        // Check if executable

        if (callback()) {

            // If no rafId, start the animation

            if (!rafId) {

                rafId = requestFrame(raf);
            }

        } else {

            hAzzle.dictionary.pop();
        }
    },

    /**
     * Show | Hide
     *
     * @param {Object} prop
     * @return {hAzzle}
     */

    showhide: function(prop) {
        var hAzzleFX = hAzzle.private(this.elem, fxPrefix + this.prop);
        this.originalState[this.prop] = hAzzleFX || this.elem.style[this.prop];

        this.options[prop] = true;

        if (prop === 'show') {
            if (hAzzleFX !== undefined) {
                this.run(this.curStyle(), hAzzleFX);
            } else {
                this.run(this.prop === 'width' || this.prop === 'height' ? 1 : 0, this.curStyle());
            }
            hAzzle(this.elem).show();
        } else {
            this.run(this.curStyle(), 0);
        }
    }
};

FX.prototype.init.prototype = FX.prototype;

// Extend the hAzzle Object

hAzzle.extend({

    // Holds all animations

    dictionary: [],

    // Detect if the browser supports native rAF, because there are
    // issues with iOS6, so check if the native rAF and cAF works
    // http://shitwebkitdoes.tumblr.com/post/47186945856/native-requestanimationframe-broken-on-ios-6

    nativeRAF: (foreign.requestAnimationFrame && (foreign.cancelAnimationFrame ||
        foreign.cancelRequestAnimationFrame)) ? true : false,

    // Detect if performance.now() are supported			

    perfNow: perfNow,

    duration: {
        'fast': 150,
        'normal': 500,
        'slow': 750

    },

    // FX Hooks
    // Can and will be extended through plug-ins

    fxHooks: {
        scrollLeft: {
            set: function(fx) {
                if (fx.elem.nodeType && fx.elem.parentNode) {
                    fx.elem[fx.prop] = fx.now;
                }
            }
        },
        scrollTop: {
            set: function(fx) {
                if (fx.elem.nodeType && fx.elem.parentNode) {
                    fx.elem[fx.prop] = fx.now;
                }
            }
        },
        opacity: {
            set: function(fx) {
                fx.elem.style.opacity = fx.now;
            }
        }
    },

    // Set default easing value

    setEasing: function(val) {

        fxEasing = typeof val === 'string' ? val : 'linear';

    },

    // Set default duration value

    setDuration: function(val) {

        fxDuration = typeof val === 'number' ? val : 500;

    },

    // performance.now()

    pnow: pnow

}, hAzzle);


// prop: Mehran Hatami

var requestFrame = hAzzle.requestFrame = function(callback) {

    var rafCallback = (function(callback) {
        // Wrap the given callback to pass in performance timestamp   
        return function(tick) {
            // feature-detect if rAF and now() are of the same scale (epoch or high-res),
            // if not, we have to do a timestamp fix on each frame
            if (tick > 1e12 != hAzzle.now() > 1e12) {
                tick = pnow();
            }
            callback(tick);
        };
    })(callback);

    // Call original rAF with wrapped callback

    return nRAF(rafCallback);
};

var cancelFrame = hAzzle.cancelFrame = function(id) {
    nCAF(id);
};

hAzzle.extend({

    animate: function(prop, options, easing, callback) {

        options = options || {};
	
	    var opt = {},
            duration;

        /*********************
          Option: Duration
        *********************/

        // jQuery uses 'slow', 'fast' e.g. as duration values. hAzzle
        // supports similar for effects or directly inside the
        // options Object

        duration = opt.duration = options.duration ? options.duration :
            typeof options === 'number' ? options :
            easing && typeof easing === 'number' ? easing : fxDuration;

        if (typeof duration === 'number' && duration === 0) {

            // If the user is attempting to set a duration of 0, we adjust it to
            // 1 (in order to produce an immediate style change).

            opt.duration = 1;
        }

        if (typeof duration === 'string') {
            opt.duration = hAzzle.duration[duration.toString().toLowerCase()] || fxDuration;
        }

        /**********************
          Option: Callbacks
        **********************/

        opt.complete = (options.complete && typeof options.complete === 'function' ?
            options.complete : (options && typeof options === 'function') ? options :
            (easing && typeof easing === 'function') ? easing :
            (callback && typeof callback === 'function')) || function() {};

        /*******************
            Option: Easing
        *******************/

        opt.easing = easing = options.easing && typeof options.easing === 'string' ?
            options.easing : (options && typeof options === 'string') ? options :
            (easing && typeof easing === 'string');

        /*******************
            Option: Queue
        *******************/
      
        if (!opt.queue ||
            opt.queue === true) {
            opt.queue = 'fx';
        }

        opt.old = opt.complete;

        // Complete

        opt.complete = function() {
            if (hAzzle.isFunction(opt.old)) {

                opt.old.call(this);
            }

            if (opt.queue) {
                hAzzle.dequeue(this, opt.queue);
            }
        };

        // If no properties, return

        if (hAzzle.isEmptyObject(prop)) {
            return this.each(opt.complete, [false]);
        }

        /*******************
           Animate
        *******************/

        function Animate() {

            var elem = this,
                isElement = elem.nodeType === 1,
                hidden = isElement && isHidden(elem),
                name, p, fx, hooks, parts, start, end, unit,
                scale, target, maxIterations,
                value, method;

            /*********************************
                 Option: Display & Visibility
              *********************************/

            var style = elem.style;

            if (elem.nodeType === 1 && ('height' in prop || 'width' in prop)) {

                opt.overflow = [style.overflow, style.overflowX, style.overflowY];

                // Get current display

                display = curCSS(elem, 'display');

                // Test default display if display is currently 'none'

                var checkDisplay = display === 'none' ?
                    hAzzle.getPrivate(elem, 'olddisplay') || defaultDisplay(elem.nodeName) : display;

                if (checkDisplay === 'inline' && curCSS(elem, 'float') === 'none') {
                    style.display = 'inline-block';
                }
            }

            if (opt.overflow) {
                style.overflow = 'hidden';
            }

            // Do some iteration

            for (p in prop) {

                value = prop[p];
                name = hAzzle.camelize(p);

                if (value === 'hide' && hidden || value === 'show' && !hidden) {
                    return opt.complete.call(this);
                }

                if (p !== name) {
                    prop[name] = value;
                    delete prop[p];
                }

                hooks = hAzzle.cssHooks[name];
                if (hooks && 'expand' in hooks) {
                    value = hooks.expand(value);
                    delete prop[name];

                    for (p in value) {
                        if (!(p in prop)) {
                            prop[p] = value[p];
                        }
                    }
                }

                fx = new FX(elem, opt, p, easing);

                /*********************************
                   Hide / Show / Toggle
                  *********************************/

                if (showhidetgl.test(value)) {

                    if ((method = hAzzle.private(elem, 'toggle' + p) ||
                        (value === 'toggle' ? hidden ? 'show' : 'hide' : 0))) {
                        hAzzle.private(elem, 'toggle' + p, method === 'show' ? 'hide' : 'show');
                        fx.showhide(method);
                    } else {
                        fx.showhide(value);
                    }

                } else {

                    parts = relativevalues.exec(value);

                    if (parts) {

                        target = fx.curStyle(),
                            unit = parts && parts[3] || (hAzzle.unitless[p] ? "" : "px"),
                            start = (hAzzle.unitless[p] || unit !== "px" && +target) &&
                            relativevalues.exec(hAzzle.css(elem, p)),
                            scale = 1,
                            maxIterations = 20;

                        if (start && start[3] !== unit) {

                            unit = unit || start[3];
                            parts = parts || [];
                            start = +target || 1;

                            do {

                                scale = scale || ".5";
                                start = start / scale;
                                hAzzle.style(elem, p, start + unit);

                            } while (
                                scale !== (scale = fx.curStyle() / target) && scale !== 1 && --maxIterations
                            );
                        }

                        // Update tween properties
                        if (parts) {
                            start = +start || +target || 0;
                            fx.unit = unit;
                            // If a +=/-= token was provided, we're doing a relative animation
                            end = parts[1] ?
                                start + (parts[1] + 1) * parts[2] :
                                +parts[2];

                            // Start the animation

                            fx.run(start, end);
                        }
                    } else {

                        // Start the animation

                        fx.run(start, value);
                    }
                }
            }

            // For JS strict compliance
            return true;
        }
// useQueue

        return opt.queue === false ?
            this.each(Animate) :
            this.queue(opt.queue, Animate);
    },

    stop: function(type, clearQueue, gotoEnd) {

        if (typeof type !== 'string') {

            gotoEnd = clearQueue;
            clearQueue = type;
            type = undefined;
        }


        if (clearQueue && type !== false) {
            this.queue(type || 'fx', []);
        }

        return this.each(function() {

            var i, hadTimers = false,
                dictionary = hAzzle.dictionary,

                data = hAzzle.private(this);

            function stopQueue(elem, data, i) {
				
                var hooks = data[i];
                hAzzle.removeData(elem, i, true);
                hooks.stop(gotoEnd);
            }


            if (i) {
                if (data[i] && data[i].stop) {
                    stopQueue(data[i]);
                }
            } else {

                for (i in data) {
                    if (data[i] && data[i].stop) {
                        stopQueue(this, data, i);
                    }
                }
            }

            for (i = dictionary.length; i--;) {
                if (dictionary[i].elem === this && (!type || dictionary[i].queue === type)) {
                    if (gotoEnd) {

                        // force the next step to be the last
                        dictionary[i](true);
                    } else {
                        dictionary[i].fxState();
                    }
                    hadTimers = true;
                    dictionary.splice(i, 1);
                }
            }

            if (!gotoEnd && hadTimers) {
                hAzzle.dequeue(this, type);
            }

        });
    }
});


/* ============================ UTILITY METHODS =========================== */

function raf() {
    if (rafId) {
        requestFrame(raf);
        ticks();
    }
}

function ticks() {

    var timer,
        dictionary = hAzzle.dictionary,
        i = 0;

    for (; i < dictionary.length; i++) {
        timer = dictionary[i];
        if (!timer() && dictionary[i] === timer) {
            dictionary.splice(i--, 1);
        }
    }

    if (!dictionary.length) {
        hAzzle.cancelFrame(rafId);
        rafId = null;
    }
}

/**
 * Reset CSS properties back to same
 * state as before animation
 *
 *********************/

function resetCSS(elem, opts, curState, originalState) {

    var style = elem.style,
        p, complete;
    // Reset the overflow

    if (opts.overflow) {

        style.overflow = opts.overflow[0];
        style.overflowX = opts.overflow[1];
        style.overflowY = opts.overflow[2];

    }

    // Hide the element if the 'hide' operation was done

    if (opts.hide) {
        hAzzle(elem).hide();
    }

    // Reset the properties, if the item has been hidden or shown

    if (opts.hide || opts.show) {

        for (p in curState) {
            style[p] = originalState[p];
            hAzzle.removeData(elem, fxPrefix + p, true);
            // Toggle data is no longer needed
            hAzzle.removeData(elem, 'toggle' + p, true);
        }
    }

    // Callback

    complete = opts.complete;

    if (complete) {

        opts.complete = false;
        complete.call(elem);
    }
}

function fxState(elem, prop, options, start, end) {
    return (function(prop, options, start, end) {
        if (hAzzle.private(elem, fxPrefix + prop) === undefined) {
            if (options.hide) {
                hAzzle.private(elem, fxPrefix + prop, start);
            } else if (options.show) {
                hAzzle.private(elem, fxPrefix + prop, end);
            }
        }
    }(prop, options, start, end));
}
