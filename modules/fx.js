var rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
    timerId;

function fx(elem, options, prop, easing) {
    return new fx.prototype.init(elem, options, prop, easing);
}

hAzzle.fx = fx;

hAzzle.fx.prototype = {

    /**
     * Init
     *
     * @param {Object} elem
     * @param {Object} options
     * @param {Object} prop
     * @param {String|Function } easing
     * @return {hAzzle|Object}
     */

    init: function(elem, options, prop) {

        this.options = options;
        this.elem = elem;
        this.prop = prop;
        this.easing = options.easing || 'linear';
        this.currentState = {};
        this.originalState = {};
    },

    /**
     * Update the CSS style values during the animation
     */

    update: function() {

        var hooks = hAzzle.fxHooks[this.prop];

        if (hooks && hooks.set) {
            hooks.set(this);
        } else {
            hAzzle.fxHooks._default.set(this);
        }
        return this;
    },

    /**
     * Get the current CSS style for the animated object
     */

    cur: function() {

        var hooks = hAzzle.fxHooks[this.prop];

        return hooks && hooks.get ?
            hooks.get(this) :
            hAzzle.fxHooks._default.get(this);
    },

    /**
     * Start and run the animation
     *
     * @param {Number} start
     * @param {Number} end
     * @param {String} unit
     * @return {hAzzle}
     */

    custom: function(from, to, unit) {

        var self = this;

        this.startTime = pnow();
        this.end = to;
        this.now = this.start = from;
        this.pos = this.state = 0;
        this.unit = unit || this.unit || (hAzzle.unitless[this.prop] ? "" : "px");

        hAzzle.fx.timer(
            hAzzle.shallowCopy(function t(gotoEnd) {
                return self.step(gotoEnd);
            }, {
                elem: this.elem,
                queue: this.options.queue,
                fxState: fxState
            })
        );
    },

    showhide: function(value) {

  var prop = this.prop,
      start = this.cur(),
	  elem = this.elem;

        var hAzzleFX = hAzzle.private(elem, 'fxshow' + prop);

        this.originalState[prop] = hAzzleFX || elem.style[prop];

        this.options[value] = true;

        if (value === 'show') {

            if (hAzzleFX !== undefined) {

                this.custom(start, hAzzleFX);

            } else {

                this.custom(prop === 'width' || prop === 'height' ? 1 : 0, start);
            }

            hAzzle(elem).show();

        } else {

            this.custom(start, 0);
        }
    },

    // Each step of an animation
	
    step: function(gotoEnd) {
        var p, n,
            self = this,
            t = pnow(),
            done = true,
            elem = this.elem,
            options = this.options,
			naturalEnd = t >= options.duration + this.startTime;

        if (gotoEnd || naturalEnd) {
            this.now = this.end;
            this.pos = this.state = 1;
            this.update();

            this.currentState[this.prop] = true;

            for (p in this.currentState) {
                if (this.currentState[p] !== true) {
                    done = false;
                }
            }

            if (done) {

                resetCSS(elem, options, self.currentState, self.originalState);
            }

            return false;

        } else {
            // classical easing cannot be used with an Infinity duration
            if (options.duration == Infinity) {
                this.now = t;
            } else {
                n = t - this.startTime;
                this.state = n / options.duration;

                // Perform the easing function, defaults to swing
                this.pos = hAzzle.easing[this.easing](this.state, n, 0, 1, options.duration);
                this.now = this.start + ((this.end - this.start) * this.pos);
            }
            // Perform the next step of the animation
            this.update();
        }

        return true;
    }
};

fx.prototype.init.prototype = fx.prototype;

hAzzle.extend({

    /**
     * Perform a custom animation of a set of CSS properties.
     *
     * @param {Object} prop
     * @param {Object|String} options
     * @param {String|Function} easing
     * @param {Function} callback
     * @return {hAzzle}
     */

    animate: function(prop, speed, easing, callback) {
        var optall = hAzzle.speed(speed, easing, callback),
            doAnimation = function() {
                return Animation(this, hAzzle.shallowCopy({}, prop), optall);
            };

        if (hAzzle.isEmptyObject(prop)) {
            return this.each(optall.complete, [false]);
        }

        return optall.queue === false ?
            this.each(doAnimation) :
            this.queue(optall.queue, doAnimation);
    },

    /**
     * Stop the currently-running animation on the matched elements..
     *
     * @return {hAzzle}
     */

    stop: function(type, clearQueue, jumpToEnd) {

        if (typeof type !== 'string') {

            jumpToEnd = clearQueue;
            clearQueue = type;
            type = undefined;
        }

        if (clearQueue && type !== false) {
            this.queue(type || 'fx', []);
        }

        return this.each(function() {

            var dequeue = true,
                i, timers = hAzzle.timers,
                data = hAzzle.private(this);

            function stopQueue(elem, data, i) {
                hAzzle.removePrivate(elem, i, true);
                data[i].stop(jumpToEnd);
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

            for (i = timers.length; i--;) {
                if (timers[i].elem === this &&
                    (!type || timers[i].queue === type)) {

                    if (jumpToEnd) {

                        // Force the next step to be the last

                        timers[i](true);

                    } else {


                        timers[i].fxState();
                    }

                    dequeue = false;
                    timers.splice(i, 1);
                }
            }

            if (dequeue || !jumpToEnd) {
                hAzzle.dequeue(this, type);
            }

        });
    }

});

hAzzle.sequences = {}

hAzzle.fxHooks = {};

hAzzle.speed = function(speed, easing, fn) {


        var opt = speed && typeof speed === "object" ? hAzzle.shallowCopy({}, speed) : {
            complete: fn || !fn && easing ||
                hAzzle.isFunction(speed) && speed,
            duration: speed,
            easing: fn && easing || easing && !hAzzle.isFunction(easing) && easing
        };

        // Go to the end state if fx are off or if document is hidden

        if (document.hidden) {
            opt.duration = 0;

        } else {
            opt.duration = typeof opt.duration === 'number' ?
                opt.duration : hAzzle.fx.speeds[opt.duration] ?
                hAzzle.fx.speeds[opt.duration] : hAzzle.fx.speeds._default;
        }

        // normalize opt.queue - true/undefined/null -> "fx"
        if (opt.queue == null || opt.queue === true) {
            opt.queue = "fx";
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
        return opt;
    };

 hAzzle.timers = [];



hAzzle.extend({
    tick: function() {
        var timer,
            timers = hAzzle.timers,
            i = 0;

        for (; i < timers.length; i++) {
            timer = timers[i];
            // Checks the timer has not already been removed
            if (!timer() && timers[i] === timer) {
                timers.splice(i--, 1);
            }
        }

        if (!timers.length) {
            hAzzle.fx.stop();
        }
    },

    stop: function() {
        nCAF(timerId);
        timerId = null;
    },

    speeds: {
        slow: 600,
        fast: 200,
        // Default speed
        _default: 400
    }

}, hAzzle.fx);

function raf(timestamp) {
    if (fixTick) {
        timestamp = pnow();
    }
    //console.log(timestamp)
    if (timerId) {
        nRAF(raf);
        hAzzle.fx.tick();
    }
}


hAzzle.fx.timer = function(timer) {
    hAzzle.timers.push(timer);

    if (timer()) {
        hAzzle.fx.start();
    } else {
        hAzzle.timers.pop();
    }
};

hAzzle.fx.start = function() {
    if (!timerId) {
        timerId = nRAF(raf);
    }
};


function checkHeightAuto(elem, prop, opt) {

    var style = elem.style, height, display = elem.style.display;

    if (elem.nodeType === 1 && ("height" in prop || "width" in prop)) {
 
        opt.overflow = [elem.style.overflow, elem.style.overflowX, elem.style.overflowY];

        // Set display property to inline-block for height/width
        // animations on inline elements that are having width/height animated

        if (curCSS(elem, "display") === "inline" &&
            curCSS(elem, "float") === "none") {
            style.display = "inline-block";
        }
    }

    if (opt.overflow != null) {

        // Ensure the element is visible, and temporarily remove vertical scrollbars 
        // since animating them is visually unappealing.

        style.overflow = 'hidden';
        style.overflowX = 'visible';
        style.overflowY = 'hidden';
    }

    return opt;
}


// Do the aniamtion

function Animation(elem, prop, opt) {

    var hidden = elem.nodeType && isHidden(elem),
        index, val, anim, parts, start, end, unit,
        method;

    checkHeightAuto(elem, prop, opt);

    for (index in prop) {

        val = prop[index];

        // Camelize the property, and check for vendor prefixes

        name = hAzzle.camelize(hAzzle.prefixCheck(index)[0]);

        if (val === 'hide' && hidden || val === 'show' && !hidden) {

            return opt.complete.call(elem);
        }

        anim = new hAzzle.fx(elem, opt, index);

        if (val === 'toggle' || 
		    val === 'show' || 
			val === 'hide') {

            if ((method = hAzzle.private(elem, 'toggle' + index) ||
                (val === 'toggle' ? hidden ? 'show' : 'hide' : 0))) {

                hAzzle.private(elem, 'toggle' + index, method === 'show' ? 'hide' : 'show');

                anim.showhide(method);
            } 

        } else {

            parts = rfxnum.exec(val);
            start = anim.cur();

            if (parts) {
                end = parseFloat(parts[2]);
                unit = parts[3] || (hAzzle.unitless[index] ? "" : "px");

                // We need to compute starting value
                if (unit !== "px") {
                    hAzzle.style(elem, index, (end || 1) + unit);
                    start = ((end || 1) / anim.cur()) * start;
                    hAzzle.style(elem, index, start + unit);
                }

                // If a +=/-= token was provided, we're doing a relative animation
                if (parts[1]) {
                    end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
                }

                anim.custom(start, end, unit);

            } else {
                anim.custom(start, val, "");
            }
        }

    }

    // For JS strict compliance
    return true;
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

            hAzzle.removePrivate(elem, "fxshow" + p, true);

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
        if (hAzzle.private(elem, "fxshow" + prop) === undefined) {
            if (opt.hide) {
                hAzzle.private(elem, "fxshow" + prop, start);
            } else if (opt.show) {
                hAzzle.private(elem, "fxshow" + prop, end);
            }
        }
    };
}

