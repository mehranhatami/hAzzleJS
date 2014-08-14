// fx.js
// WORK IN PROGRESS!! 

var foreign, nRAF, nCAF,
    perf = window.performance,
    lastTime = 0;

// Test if we are within a foreign domain. Use raf from the top if possible.
try {
    // Accessing .name will throw SecurityError within a foreign domain.
    foreign = window.top;
} catch (e) {
    foreign = window;
}

// Performance.now()

var perfNow = perf.now || perf.webkitNow || perf.msNow || perf.mozNow,
    now = perfNow ? function() {
        return perfNow.call(perf);
    } : function() {
        return hAzzle.now();
    };

// Grab the native implementation.

nRAF = foreign.requestAnimationFrame;
nCAF = foreign.cancelAnimationFrame || foreign.cancelRequestAnimationFrame;

// if native rAF and cAF fails, fallback to a vendor
// prefixed one	, or the polyfill ( IE9)

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






var rfxtypes = /^(?:toggle|show|hide)$/,
    rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
    rafId;

/* ============================ FX =========================== */

function FX(elem, options, prop, easing) {
    return new FX.prototype.init(elem, options, prop, easing);
}

hAzzle.FX = FX;

FX.prototype = {

    init: function(elem, options, prop, easing) {

        this.options = options;
        this.elem = elem;
        this.prop = prop;
        this.easing = easing || 'linear';
        this.now = 0;
        this.currentState = {};
        this.originalState = {};
        
		// This will and can be overwritten

        this.unit = hAzzle.unitless[prop] ? '' : 'px';
    },

    // Update the CSS style values during the animation

    update: function() {

        if (this.options.step) {
            this.options.step.call(this.elem, this.now, this);
        }

        var hooks = hAzzle.fxHooks[this.prop];

        if (hooks && hooks.set) {

            hooks.set(this);

        } else {

            hAzzle.fxHooks._default.set(this);
        }

        return;
    },

    // Get the current style

    cur: function() {

        var hooks = hAzzle.fxHooks[this.prop];
        return hooks && hooks.get ?
            hooks.get(this) :
            hAzzle.fxHooks._default.get(this);
    },

    // Start an run the animation

    run: function(start, end) {

        var self = this,
            percent = 0,
            pos = 0, i,
            elem = self.elem,
            currentTime = hAzzle.pnow(),
            options = self.options,
            duration = options.duration,
            callback = hAzzle.shallowCopy(function(gotoEnd) {

                var lastTickTime = hAzzle.pnow(),
                    done = true;

                if (gotoEnd || lastTickTime >= duration + currentTime) {

                    self.now = end;
                    pos = percent = 1;
                    self.update();

                    self.currentState[self.prop] = true;

                    for (i in self.currentState) {
                        if (self.currentState[i] !== true) {
                            done = false;
                        }
                    }

                    if (done) {

                        resetCSS(elem, options, self.currentState, self.originalState);
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
                fxState: function() {
                    if (hAzzle.private(self.elem, 'hAzzleFX' + self.prop) === undefined) {
                        if (self.options.hide) {
                            hAzzle.private(self.elem, 'hAzzleFX' + self.prop, start);
                        } else if (self.options.show) {
                            hAzzle.private(self.elem, 'hAzzleFX' + self.prop, end);
                        }
                    }
                }
            });

        // Push

        hAzzle.dictionary.push(callback);

        // Check if executable

        if (callback()) {

            // If no rafId, start the animation

            if (rafId == null) {

                rafId = hAzzle.requestFrame(raf);
            }

        } else {

            hAzzle.dictionary.pop();
        }
    },

    // Show and hide

    showhide: function(prop) {
        var hAzzleFX = hAzzle.private(this.elem, 'hAzzleFX' + this.prop);
        this.originalState[this.prop] = hAzzleFX || this.elem.style[this.prop];

        this.options[prop] = true;

        if (prop === 'show') {
            if (hAzzleFX !== undefined) {
                this.run(this.cur(), hAzzleFX);
            } else {
                this.run(this.prop === 'width' || this.prop === 'height' ? 1 : 0, this.cur());
            }
            hAzzle(this.elem).show();
        } else {
            this.run(this.cur(), 0);
        }
    }
};

FX.prototype.init.prototype = FX.prototype;

// Extend the hAzzle Object

hAzzle.extend({

    dictionary: [],
	
   // Detect if the browser supports native rAF, because there are
   // issues with iOS6, so check if the native rAF and cAF works
   // http://shitwebkitdoes.tumblr.com/post/47186945856/native-requestanimationframe-broken-on-ios-6
	
	nativeRAF: (foreign.requestAnimationFrame && (foreign.cancelAnimationFrame ||
            foreign.cancelRequestAnimationFrame)) ? true : false,
   
    // Detect if performance.now() are supported			
	
	perfNow: perfNow,		

    fxHooks: {

        opacity: {

            set: function(fx) {

                fx.elem.style['opacity'] = fx.now;
            }
        },

        _default: {

            get: function(tween) {
                var result;

                if (tween.elem[tween.prop] !== null &&
                    (!tween.elem.style || tween.elem.style[tween.prop] == null)) {
                    return tween.elem[tween.prop];
                }

                result = hAzzle.css(tween.elem, tween.prop, '');
                // Empty strings, null, undefined and 'auto' are converted to 0.
                return !result || result === 'auto' ? 0 : result;
            },
            set: function(fx) {

                if (fx.elem.style && fx.elem.style[fx.prop] != null) {
                    fx.elem.style[fx.prop] = fx.now + fx.unit;
                } else {
                    fx.elem[fx.prop] = fx.now;
                }
            }
        }
    },
	
    // prop: Mehran Hatami
	
	requestFrame: function(callback) {

        var rafCallback = (function(callback) {
            // Wrap the given callback to pass in performance timestamp   
            return function(tick) {
                // feature-detect if rAF and now() are of the same scale (epoch or high-res),
                // if not, we have to do a timestamp fix on each frame
                if (tick > 1e12 != hAzzle.now() > 1e12) {
                    tick = now();
                }
                callback(tick);
            };
        })(callback);

        // Call original rAF with wrapped callback

        return nRAF(rafCallback);
    },

    cancelFrame: function() {

        nCAF.apply(window, arguments);
    },

    // performance.now()

    pnow: now
}, hAzzle);

hAzzle.extend({

    animate: function(prop, options, easing, callback) {

        var opt = {},
            duration;

        /*********************
          Option: Duration
        *********************/

        duration = opt.duration = options.duration ? options.duration :
            typeof options === 'number' ? options :
            easing && typeof easing === 'number' ? easing : 400;

        if (typeof duration === 'string') {

            switch (duration.toString().toLowerCase()) {
                case 'fast':
                    opt.duration = 200;
                    break;

                case 'normal':
                    opt.duration = 400;
                    break;

                case 'slow':
                    opt.duration = 600;
                    break;

                default:
                    // Remove the potential 'ms' suffix and default to 1 if the user is attempting 
                    // to set a duration of 0 (in order to produce an immediate style change).
                    opt.duration = parseFloat(duration) || 1;
            }
        }

        /**********************
          Option: Callbacks
        **********************/

        opt.complete = (options.complete ? options.complete :
            (options && typeof options === 'function') ? options :
            (easing && typeof easing === 'function') ? easing :
            (callback && typeof callback === 'function')) || function() {};

        /*******************
            Option: Easing
        *******************/

        opt.easing = easing = options.easing ? options.easing :
            (options && typeof options === 'string') ? options :
            (easing && typeof easing === 'string');

        /*******************
            Option: Queue
        *******************/

        if (opt.queue == null ||
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

        function doAnimation() {

                var elem = this,
                    isElement = elem.nodeType === 1,
                    hidden = isElement && isHidden(elem),
                    name, p, fx, hooks, parts, start, end, unit,
                    value, method;

                /*********************************
                     Option: Display & Visibility
                  *********************************/

                var style = elem.style;

                if (elem.nodeType === 1 && ('height' in prop || 'width' in prop)) {

                    opt.overflow = [style.overflow, style.overflowX, style.overflowY];

                    display = hAzzle.css(elem, 'display');

                    // Test default display if display is currently 'none'

                    var checkDisplay = display === 'none' ?
                        hAzzle.getPrivate(elem, 'olddisplay') || defaultDisplay(elem.nodeName) : display;

                    if (checkDisplay === 'inline' && hAzzle.css(elem, 'float') === 'none') {
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

                    if (rfxtypes.test(value)) {

                        if ((method = hAzzle.private(elem, 'toggle' + p) ||
                            (value === 'toggle' ? hidden ? 'show' : 'hide' : 0))) {
                            hAzzle.private(elem, 'toggle' + p, method === 'show' ? 'hide' : 'show');
                            fx.showhide(method);
                        } else {
                            fx.showhide(value);
                        }

                    } else {

                        /*********************************
                          Relative values
                         *********************************/

                        parts = rfxnum.exec(value);
                        start = fx.cur();

                        if (parts) {

                            end = parseFloat(parts[2]);

                            unit = parts[3] || (hAzzle.unitless[p] ? '' : 'px');

                            // We need to compute starting value
                            if (unit !== 'px') {
                                hAzzle.style(elem, p, (end || 1) + unit);
                                start = ((end || 1) / fx.cur()) * start;
                                hAzzle.style(elem, p, start + unit);
                            }

                            if (parts[1]) {

                                end = ((parts[1] === '-=' ? -1 : 1) * end) + start;
                            }

                            // Set correct unit prefix

                            fx.unit = unit;

                            // Start the animation

                            fx.run(start, end);

                        } else {

                            // Start the animation

                            fx.run(start, value);
                        }
                    }
                }

                // For JS strict compliance
                return true;
            }
            //  return this.each(doAnimation);

        return opt.queue === false ?
            this.each(doAnimation) :
            this.queue(opt.queue, doAnimation);
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
            var index,
                hadTimers = false,
                dictionary = hAzzle.dictionary,
                data = hAzzle.private(this);


            function stopQueue(elem, data, index) {
                var hooks = data[index];
                hAzzle.removeData(elem, index, true);
                hooks.stop(gotoEnd);
            }


            if (index) {
                if (data[index] && data[index].stop) {
                    stopQueue(data[index]);
                }
            } else {

                for (index in data) {
                    if (data[index] && data[index].stop) {
                        stopQueue(this, data, index);
                    }
                }
            }

            for (index = dictionary.length; index--;) {
                if (dictionary[index].elem === this && (type == null || dictionary[index].queue === type)) {
                    if (gotoEnd) {

                        // force the next step to be the last
                        dictionary[index](true);
                    } else {
                        dictionary[index].fxState();
                    }
                    hadTimers = true;
                    dictionary.splice(index, 1);
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
        hAzzle.requestFrame(raf);
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
 
    var style = elem.style, p, complete;
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
            hAzzle.removeData(elem, 'hAzzleFX' + p, true);
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