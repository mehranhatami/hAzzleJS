// fx.js
var nRAF, nCAF,
    perf = window.performance,
    lastTime = 0,
    fxPrefix = 'hAzzleFX',

    // Checks for iOS6 will only be done if no native frame support

    ios6 = /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent),

    // Default duration value

    fxDuration = 500,

    // Default easing value

    fxEasing = 'linear',

    // Various regex we are going to use

    showhidetgl = /^(?:toggle|show|hide)$/,
    relativevalues = /^(?:([+-])=|)([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))([a-z%]*)$/i,

    // rAF ID

    rafId,

    fixTick = false,

    // Performance.now()

    perfNow = perf.now || perf.webkitNow || perf.msNow || perf.mozNow,
    pnow = perfNow ? function() {
        return perfNow.call(perf);
    } : function() {
        return hAzzle.now();
    };

(function() {

    nRAF = function() {
        // native animation frames
        // http://webstuff.nfshost.com/anim-timing/Overview.html
        // http://dev.chromium.org/developers/design-documents/requestanimationframe-implementation

        return top.requestAnimationFrame ||
            // no native rAF support
            (ios6 ? // iOS6 is buggy
                top.requestAnimationFrame ||
                top.webkitRequestAnimationFrame || // Chrome <= 23, Safari <= 6.1, Blackberry 10
                top.mozRequestAnimationFrame ||
                top.msRequestAnimationFrame :
                // IE <= 9, Android <= 4.3, very old/rare browsers
                function(callback) {
                    var currTime = hAzzle.now(),
                        timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                        id = window.setTimeout(function() {
                                callback(currTime + timeToCall);
                            },
                            timeToCall);
                    lastTime = currTime + timeToCall;
                    return id; // return the id for cancellation capabilities
                });
    }();

    nCAF = function() {
        return top.cancelAnimationFrame ||
            // no native cAF support
            (!ios6 ? foreign.cancelAnimationFrame ||
                top.webkitCancelAnimationFrame ||
                top.webkitCancelRequestAnimationFrame ||
                top.mozCancelAnimationFrame :
                function(id) {
                    clearTimeout(id);
                });
    }();

}());

nRAF(function(timestamp) {
    // feature-detect if rAF and now() are of the same scale (epoch or high-res),
    // if not, we have to do a timestamp fix on each frame
    fixTick = timestamp > 1e12 != pnow() > 1e12;
});


var ticker = nRAF;

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
        this.isRunning = false;

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

            // params:  elem, now, prop
            // fx can be a object, so we deal with it before
            // sending it to the fxHooks

            hooks.set(elem, now, prop);

        } else {

            // 'now' can be a object, but as default we deal with as
            // a single value

            if (style && hAzzle.cssHooks[prop]) {
                hAzzle.style(elem, prop, now + self.unit);
            } else {
                hAzzle.style(elem, prop, now + self.unit);
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

            hooks.get(elem, self.now, prop);

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
            opt = self.options,
            currentState = self.currentState,
            originalState = self.originalState,
            duration = opt.duration;

        var callback = hAzzle.shallowCopy(function(gotoEnd) {

            var lastTickTime = pnow(),
                v,
                i, done = true;

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

                    resetCSS(elem, opt, currentState, originalState);
                }

                return false;

            } else {

                // Calculate easing, and perform the next step of the
                // animation

                percent = (lastTickTime - currentTime) / duration;
                pos = hAzzle.easing[self.easing](percent, duration * percent, 0, 1, duration);


                if (hAzzle.type(end) === 'object') {

                    if (typeof start !== 'object') {
                        start = {};
                    }
                    for (var val in end) {
                        if (!start.hasOwnProperty(val)) {
                            start[val] = 0;
                        }
                        self.now[val] = end[val] - start[val];
                    }
                } else {

                    self.now = start + ((end - start) * pos);
                }

                if (typeof self.now === 'object') {
                    for (v in self.now) {
                        self.now[v] = start + ((end[v] - start[v]) * pos);
                    }
                }

                self.update();
            }

            return true;

        }, {
            elem: this.elem,

            // Save current animation state on the DOM element

            fxState: fxState(elem, self.prop, opt, start, end)
        });

        // Push the callback into the dictionary array

        hAzzle.dictionary.push(callback);

        // Check if executable

        if (callback()) {

            // If no rafId, start the animation

            if (!rafId) {

                rafId = nRAF(update);
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
            set: function(elem, now, prop) {
                if (elem.nodeType && elem.parentNode) {
                    elem[prop] = now;
                }
            }
        },
        scrollTop: {
            set: function(elem, now, prop) {
                if (elem.nodeType && elem.parentNode) {
                    elem[prop] = now;
                }
            }
        },
        opacity: {
            set: function(elem, now) {
                elem.style.opacity = now;
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

hAzzle.extend({

    animate: function(prop, options, easing, callback) {

        options = options || {};

        var opt = {},
            duration;


        /*********************
          Option: Duration
        *********************/

        // jQuery uses 'slow', 'fast' e.g. as duration values. hAzzle
        // supports similar for effects 'ONLY', or directly inside the
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
            opt.duration = hAzzle.duration[duration.toLowerCase()] || fxDuration;
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

        if (!opt.queue || opt.queue === true) {
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
                checkDisplay, style = elem.style,
                hidden = isElement && isHidden(elem),
                name, p, fx, relative, start, end, unit,
                scale, target, maxIterations,
                value, method;

            /*********************************
                 Option: Display & Visibility
              *********************************/

            if (elem.nodeType === 1 && ('height' in prop || 'width' in prop)) {

                opt.overflow = [style.overflow, style.overflowX, style.overflowY];

                // Get current display

                display = curCSS(elem, 'display');

                // Test default display if display is currently 'none'

                checkDisplay = display === 'none' ?
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

                // Create new instance

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

                    relative = relativevalues.exec(value);

                    if (relative) {

                        target = fx.curStyle(),
                            unit = relative && relative[3] || (hAzzle.unitless[p] ? "" : "px"),
                            start = (hAzzle.unitless[p] || unit !== "px" && +target) &&
                            relativevalues.exec(hAzzle.css(elem, p)),
                            scale = 1,
                            maxIterations = 20;

                        if (start && start[3] !== unit) {

                            unit = unit || start[3];
                            relative = relative || [];
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
                        if (relative) {
                            start = +start || +target || 0;
                            fx.unit = unit;
                            // If a +=/-= token was provided, we're doing a relative animation
                            end = relative[1] ?
                                start + (relative[1] + 1) * relative[2] :
                                +relative[2];

                            // Start the animation

                            fx.run(start, end);
                        }
                    } else {

                        // Start the animation

                        fx.run(start, value);
                    }
                }
            }

            return true;
        }

        // When the queue option is set to false, the call skips the element's queue and fires immediately.

        if (options.queue === false) {

            // Fire delay if any
            /*           
            		   if (options.delay) {

                           setTimeout(function() {
            				   return this.each(Animate)
            				   }, opt.delay);
                       
            		   } else {*/
            return this.each(Animate);
            //              }

        } else {

            return this.queue(opt.queue, Animate);
        }
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

            var dequeue = true,
                i, dictionary = hAzzle.dictionary,
                data = hAzzle.private(this);

            function stopQueue(elem, data, i) {
                hAzzle.removePrivate(elem, i, true);
                data[i].stop(gotoEnd);
            }

            if (i) {

                if (data[i] && data[i].stop) {
                    stopQueue(data[i]);
                }

            } else {

                for (i in data) {
                    if (data[i] && data[i].stop) {
                        stopQueue(data[i]);
                    }
                }
            }

            for (i = dictionary.length; i--;) {
                if (dictionary[i].elem === this &&
                    (!type || dictionary[i].queue === type)) {

                    if (gotoEnd) {

                        // Force the next step to be the last

                        dictionary[i](true);

                    } else {

                        dictionary[i].fxState();
                    }

                    dequeue = false;
                    dictionary.splice(i, 1);
                }
            }

            if (dequeue || !gotoEnd) {
                hAzzle.dequeue(this, type);
            }

        });
    }
});


/* ============================ UTILITY METHODS =========================== */

function update(timestamp) {
    if (fixTick) {
        timestamp = pnow();
    }
    if (rafId) {
        nRAF(update);
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
        nCAF(rafId);
        rafId = null;
    }
}

/**
 * Reset CSS properties back to same
 * state as before animation
 *
 * @param {Object} elem
 * @param {Object} opt
 * @param {Object} curState
 * @param {Object} originalState
 * @return {hAzzle|Object}
 */

function resetCSS(elem, opt, curState, originalState) {

    var style = elem.style,
        p, complete;

    // Reset the overflow

    if (opt.overflow) {

        style.overflow = opt.overflow[0];
        style.overflowX = opt.overflow[1];
        style.overflowY = opt.overflow[2];

    }

    // Hide the element if the 'hide' operation was done

    if (opt.hide) {

        hAzzle(elem).hide();
    }

    // Reset the properties, if the item has been hidden or shown

    if (opt.hide || opt.show) {

        for (p in curState) {

            style[p] = originalState[p];

            hAzzle.removePrivate(elem, fxPrefix + p, true);

            // Toggle data is no longer needed

            hAzzle.removePrivate(elem, 'toggle' + p, true);
        }
    }

    // Callback

    complete = opt.complete;

    if (complete) {

        opt.complete = false;
        complete.call(elem);
    }
}

// Remember the state so we can go back to it later

function fxState(elem, prop, opt, start, end) {
    return function() {
        if (hAzzle.private(elem, fxPrefix + prop) === undefined) {
            hAzzle.private(elem, fxPrefix + prop, opt.hide ? start : end);
        }
    };
}



if (!hAzzle.isMobile && document.hidden !== undefined) {
    document.addEventListener('visibilitychange', function() {
        // Reassign the rAF function (which the global update() function uses) based on the tab's focus state.
        if (document.hidden) {
            ticker = function(callback) {
                // The tick function needs a truthy first argument in order to pass its internal timestamp check.
                return setTimeout(function() {
                    callback(true);
                }, 17);
            };

            // The rAF loop has been paused by the browser, so we manually restart the tick.
            update();
        } else {
            ticker = nRAF;
        }
    });
}