// fx.js
var nRAF, nCAF,
    perf = window.performance,
    lastTime = 0,
    rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
    rafID,

    fixTick = false,

    // Checks for iOS6 will only be done if no native frame support

    ios6 = /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent),

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
            (!ios6 ? top.cancelAnimationFrame ||
                top.webkitCancelAnimationFrame ||
                top.webkitCancelRequestAnimationFrame ||
                top.mozCancelAnimationFrame :
                function(id) {
                    clearTimeout(id);
                });
    }();

}());

nRAF(function(tick) {
    // feature-detect if rAF and now() are of the same scale (epoch or high-res),
    // if not, we have to do a timestamp fix on each frame
    fixTick = tick > 1e12 != pnow() > 1e12;
});

function fx(elem, options, prop) {
    return new fx.prototype.init(elem, options, prop);
}

hAzzle.fx = fx;

fx.prototype = {

    init: function(elem, options, prop) {

        this.elem = elem;
        this.options = options;
        this.prop = prop;
        this.startTime = pnow();
        this.pos = this.state = 0;

        options.orig = options.orig || {};
    },

    // Simple function for setting a style value
    update: function() {

        if (this.options.step) {
            this.options.step.call(this.elem, this.now, this);
        }

        var hooks = hAzzle.fxAfter[this.prop];

        if (hooks && hooks.set) {
            hooks.set(this);
        } else {
            hAzzle.fxAfter._default.set(this);
        }
        return this;

    },

    // Get the current size
    cur: function() {

        var hooks = hAzzle.fxAfter[this.prop];

        return hooks && hooks.get ?
            hooks.get(this) :
            hAzzle.fxAfter._default.get(this);

    },

    // Start an animation from one number to another
    run: function(start, end, unit) {

        var callback = cb(this),
            val;

        this.end = end;
        this.now = this.start = start;
        this.unit = unit || this.unit || (hAzzle.unitless[this.prop] ? '' : 'px');

        // If the end / start values are a object, we
        // need to deal with that

        if (typeof end === 'object') {

            this.differences = {};

            if (typeof start !== 'object') {

                start = {};
            }

            for (val in end) {

                if (!start.hasOwnProperty(val)) {

                    start[val] = 0;
                }

                // Create a object with start and end values

                this.differences[val] = {
                    start: start[val],
                    end: end[val]
                };
            }

        } else {

            this.differences = end - start;
        }

        // Push it onto the stack

        hAzzle.timers.push(callback);

        if (callback.func()) {

            if (!rafID) {

                rafID = nRAF(raf);
            }

        } else {

            hAzzle.timers.pop();
        }
    },

    // Simple 'show' function
    show: function() {
        var dataShow = hAzzle.private(this.elem, 'fxshow' + this.prop);

        // Remember where we started, so that we can go back to it later
        this.options.orig[this.prop] = dataShow || hAzzle.style(this.elem, this.prop);
        this.options.show = true;

        // Begin the animation
        // Make sure that we start at a small width/height to avoid any flash of content
        if (dataShow !== undefined) {
            // This show is picking up where a previous hide or show left off
            this.run(this.cur(), dataShow);
        } else {
            this.run(this.prop === 'width' || this.prop === 'height' ? 1 : 0, this.cur());
        }

        // Start by showing the element
        hAzzle(this.elem).show();
    },

    // Simple 'hide' function
    hide: function() {
        // Remember where we started, so that we can go back to it later
        this.options.orig[this.prop] = hAzzle.private(this.elem, 'fxshow' + this.prop) || hAzzle.style(this.elem, this.prop);
        this.options.hide = true;

        // Begin the animation
        this.run(this.cur(), 0);
    },

    // Each step of an animation
    step: function(t, gotoEnd) {

        var p, n, complete, v,
            done = true,
            elem = this.elem,
            style = elem.style,
            options = this.options;

        if (gotoEnd || t >= options.duration + this.startTime) {

            this.now = this.end;
            this.pos = this.state = 1;
            this.update();

            options.animatedProperties[this.prop] = true;

            for (p in options.animatedProperties) {
                if (options.animatedProperties[p] !== true) {
                    done = false;
                }
            }

            if (done) {
                // Reset the overflow
                if (options.overflow != null) {

                    style.overflow = options.overflow[0];
                    style.overflowX = options.overflow[1];
                    style.overflowY = options.overflow[2];
                }

                // Hide the element if the 'hide' operation was done
                if (options.hide) {
                    hAzzle(elem).hide();
                }

                // Reset the properties, if the item has been hidden or shown
                if (options.hide || options.show) {
                    for (p in options.animatedProperties) {
                        hAzzle.style(elem, p, options.orig[p]);
                        hAzzle.removeData(elem, 'fxshow' + p, true);
                        // Toggle data is no longer needed
                        hAzzle.removeData(elem, 'toggle' + p, true);
                    }
                }

                // Execute the complete function
                // in the event that the complete function throws an exception
                // we must ensure it won't be called twice. #5684

                complete = options.complete;
                if (complete) {

                    options.complete = false;
                    complete.call(elem);
                }
            }

            return false;

        } else {

            n = t - this.startTime;
            this.state = n / options.duration;

            // Perform the easing function, defaults to swing
            this.pos = hAzzle.easing[options.animatedProperties[this.prop]](this.state, n, 0, 1, options.duration);

            if (typeof this.differences === 'object') {

                for (v in this.differences) {

                    this.now[v] = this.differences[v].start + ((this.differences[v].end - this.differences[v].start) * this.pos);
                }

            } else {

                this.now = this.start + ((this.differences) * this.pos);
            }

            // Perform the next step of the animation
            this.update();
        }

        return true;
    }
};


fx.prototype.init.prototype = fx.prototype;

hAzzle.extend({

    animate: function(prop, speed, easing, callback) {

        var opt;

        if (speed && typeof speed === 'object') {

            opt = speed;

        } else {

            opt = {

                complete: callback || !callback && easing ||
                    hAzzle.isFunction(speed) && speed,
                duration: speed,
                easing: callback && easing || easing && !hAzzle.isFunction(easing) && easing
            };
        }

        if (typeof opt.duration !== 'number') {

            if (opt.duration in hAzzle.speeds) {

                opt.duration = hAzzle.speeds[opt.duration];

            } else {

                opt.duration = hAzzle.speeds._default;
            }
        }

        // normalize opt.queue - true/undefined/null -> 'fx'
        if (opt.queue == null || opt.queue === true) {
            opt.queue = 'fx';
        }

        // Queueing
        opt.old = opt.complete;

        opt.complete = function() {
            if (hAzzle.isFunction(opt.old)) {
                opt.old.call(this);
            }

            if (opt.queue) {
                hAzzle.dequeue(this, opt.queue);
            }
        };

        var doAnimation = function() {

            // Effect hooks - never document this !!

            var hooks = hAzzle.effects[prop];

            if (hooks) {

                prop = hooks(this, prop, opt);
            }
            Animation(this, prop, opt);
        };

        if (hAzzle.isEmptyObject(prop)) {
            return this.each(optall.complete, [false]);
        }


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
                dequeue = true,
                timers = hAzzle.timers,
                index = type != null && type + 'queueHooks',
                data = hAzzle.private(this),
                stopQueue = function(elem, data, index) {
                    hAzzle.removeData(elem, index, true);
                    data[index].stop(null, gotoEnd);
                };

            if (index) {

                if (data[index] && data[index].stop) {
                    stopQueue(data[index]);
                }

            } else {

                for (index in data) {

                    if (data[index] && data[index].stop && /queueHooks$/.test(index)) {
                        stopQueue(data[index]);
                    }
                }
            }

            for (index = timers.length; index--;) {

                if (timers[index].elem === this &&
                    (type == null || timers[index].queue === type)) {

                    if (gotoEnd) {

                        timers[index](true);

                    } else {

                        timers[index].saveState();
                    }

                    dequeue = false;
                    timers.splice(index, 1);
                }
            }

            if (dequeue || !gotoEnd) {

                hAzzle.dequeue(this, type);
            }
        });
    }
});


hAzzle.extend({

    fxBefore: {},

    fxAfter: {

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

                if (getStyles(fx.elem) &&
                    (fx.elem.style[hAzzle.cssProps[fx.prop]] != null ||
                        hAzzle.cssHooks[fx.prop])) {

                    hAzzle.style(fx.elem, fx.prop, fx.now + fx.unit);

                } else {

                    hAzzle.style(fx.elem, fx.prop, fx.now);
                }
            }
        }
    },
	
	propertyMap: {

        display: function(value) {

            value = value.toString().toLowerCase();

            if (value === 'auto') {

                value = hAzzle.getDisplayType(elem);
            }
            return value;
        },

        visibility: function(value) {

            return value.toString().toLowerCase();

        }
    },

    speeds: {
        slow: 600,
        fast: 200,
        // Default speed
        _default: 400
    },

    timers: [],

}, hAzzle);

// Because of a known performance.now() bug
// we are sending the 'tick' back to the
// 'step function' without using perf.now()
// to generate the stepping. 

function raf(tick) {

    if (fixTick) {

        tick = pnow();
    }

    if (rafID) {

        nRAF(raf);

        var timer,
            timers = hAzzle.timers,
            i = 0;

        for (; i < timers.length; i++) {

            timer = timers[i];

            if (!timer.func(tick) && timers[i] === timer) {

                timers.splice(i--, 1);
            }
        }

        // If no dictionary, stop the animation

        if (!timers.length) {

            nCAF(rafID);
            // Avoid memory leaks
            rafID = null;
        }
    }
}


function cb(self) {

    var callback = {

        func: function(tick, gotoEnd) {
            return self.step(tick, gotoEnd);
        },
        elem: self.elem,
        saveState: function() {
            if (hAzzle.private(self.elem, 'fxshow' + self.prop) === undefined) {
                if (self.options.hide) {
                    hAzzle.private(self.elem, 'fxshow' + self.prop, self.start);
                } else if (self.options.show) {
                    hAzzle.private(self.elem, 'fxshow' + self.prop, self.end);
                }
            }
        }
    };
    return callback;
}


function Animation(elem, prop, opt) {

    var style = elem.style,
        hidden = elem.nodeType && isHidden(elem),
        name, val, index, e, hooks,
        parts, start, end, unit,
        display, method;

    // will store per property easing and be used to determine when an animation is complete
    opt.animatedProperties = {};

    AdjustCSS(elem, prop, opt);

    for (index in prop) {
      
	  val = prop[index];		   
      
	  name = hAzzle.camelize(index);
        if (index !== name) {
            prop[name] = prop[index];
            delete prop[index];
        }

	   if(hAzzle.propertyMap[index]) {
		  val = hAzzle.propertyMap[index](index); 
	   }

        if (hAzzle.isArray(val)) {

            opt.animatedProperties[index] = val[1];
            val = prop[index] = val[0];

        } else {

            opt.animatedProperties[index] = opt.specialEasing && opt.specialEasing[index] || opt.easing || 'swing';
        }

        if (val === 'hide' && hidden || val === 'show' && !hidden) {
            return opt.complete.call(elem);
        }

        e = new hAzzle.fx(elem, opt, index);
        val = prop[index];

        if (val === 'hide' || 
		    val === 'show' || 
			val === 'toggle') {

            // Tracks whether to show or hide based on private
            // data attached to the element
            method = hAzzle.private(elem, 'toggle' + index) || (val === 'toggle' ? hidden ? 'show' : 'hide' : 0);

            if (method) {

                hAzzle.private(elem, 'toggle' + index, method === 'show' ? 'hide' : 'show');
				
                e[method]();

            } else {

                e[val]();
            }

        } else {

            parts = rfxnum.exec(val);
            start = e.cur();

            if (parts) {

                end = parseFloat(parts[2]);
                unit = parts[3] || (hAzzle.unitless[index] ? '' : 'px');

                // We need to compute starting value

                if (unit !== 'px') {

                    hAzzle.style(elem, index, (end || 1) + unit);
                    start = ((end || 1) / e.cur()) * start;
                    hAzzle.style(elem, index, start + unit);
                }

                // If a +=/-= token was provided, we're doing a relative animation
                if (parts[1]) {

                    end = ((parts[1] === '-=' ? -1 : 1) * end) + start;
                }

                e.run(start, end, unit);

            } else {

                hooks = hAzzle.fxBefore[index];

                if (hooks) {

                    hooks(elem, index, val, e);

                } else {

                    e.run(start, val, '');
                }

            }
        }
    }

    return true;
}

var propertyMap = {




};

function AdjustCSS(elem, prop, opt) {

    var style = elem.style,
        display;

    // Height/width overflow pass
    if (elem.nodeType === 1 && (prop.height || prop.width)) {

        opt.overflow = [style.overflow, style.overflowX, style.overflowY];

        display = hAzzle.getDisplayType(elem)

        checkDisplay = display === 'none' ?
            hAzzle.private(elem, 'olddisplay') || defaultDisplay(elem.nodeName) : display;

        if (checkDisplay === 'inline' && hAzzle.css(elem, 'float') === 'none') {
            style.display = 'inline-block';
        }
    }

    if (opt.overflow) {
        style.overflow = 'hidden';
    }
}