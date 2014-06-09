/*
 * UNDER DEVELOPMENT!!
 *
 * This is an ongoing project!!
 *
 ********************************/
var rotate = /rotate\(((?:[+\-]=)?([\-\d\.]+))deg\)/,
    scale = /scale\(((?:[+\-]=)?([\d\.]+))\)/,
    skew = /skew\(((?:[+\-]=)?([\-\d\.]+))deg, ?((?:[+\-]=)?([\-\d\.]+))deg\)/,
    translate = /translate\(((?:[+\-]=)?([\-\d\.]+))px, ?((?:[+\-]=)?([\-\d\.]+))px\)/,
    numbs = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i,



    speeds = {
        slow: 1600,
        fast: 85,
        // Default speed
        _default: 450
    };

//convert(el, val, p)
function convert(el, start, end) {

    var ret,
        value;

    if (typeof start === 'string' && (ret = numbs.exec(start))) {

        value = hAzzle.units(parseFloat(hAzzle.css(el, end)), ret[3], el, start) + (ret[1] + 1) * ret[2];

        if (!hAzzle.unitless[end]) {

            value += ret && ret[3] ? ret[3] : "px";
        }

        return value;

    } else {

        return start;
    }
}

function parseTransform(style, base) {
    var values = {},
        m;
    if (m = style.match(rotate)) values.rotate = by(m[1], null);
    if (m = style.match(scale)) values.scale = by(m[1], base ? base.scale : null);
    if (m = style.match(skew)) {
        values.skewx = by(m[1], base ? base.skewx : null);
        values.skewy = by(m[3], base ? base.skewy : null);
    }
    if (m = style.match(translate)) {
        values.translatex = by(m[1], base ? base.translatex : null);
        values.translatey = by(m[3], base ? base.translatey : null);
    }
    return values;
}

function formatTransform(v) {
    var s = '';
    if ('rotate' in v) s += 'rotate(' + v.rotate + 'deg) ';
    if ('scale' in v) s += 'scale(' + v.scale + ') ';
    if ('translatex' in v) s += 'translate(' + v.translatex + 'px,' + v.translatey + 'px) ';
    if ('skewx' in v) s += 'skew(' + v.skewx + 'deg,' + v.skewy + 'deg)';
    return s;
}

// Convert relative numbers to px

function by(val, start, m, r, i) {
    return (m = /^([+\-])=([\d\.]+)/.exec(val)) ?
        (i = parseInt(m[2], 10)) && (r = (start + i)) && m[1] == '+' ?
        r : start - i :
        parseInt(val, 10);
}

hAzzle.fx = function (elem, options, prop) {

    var self = this;

    self.name = hAzzle.getUID(self);

    self.startVal = 0;
    self.endVal = 0;
    self.differences = {};
    self.canStart = true;
    self.hasStarted = false;
    self.hasCompleted = false;
    self.delayDuration = 0;
    self.easing = hAzzle.easing.linear; // Default easing function
    self.onComplete = function () {};
    self.onStopped = function () {};
    self.andThen = function () {};

    self.options = options || {};

    self.hACEDuration = self.fixSpeed();

    self.elem = elem;

    self.prop = prop;

    // Current CSS style for the animated property

    self.curCSS = parseFloat(hAzzle.getStyle(self.elem, self.prop));

    self.category = "";

    self.unit = this.unit || (hAzzle.unitless[this.prop] ? "" : "px");

    options.orig = options.orig || {};
};

hAzzle.fx.prototype = {

    constructor: hAzzle.fx,

    show: function () {

        var dataShow = hAzzle.data(this.elem, 'fxShow' + this.prop);

        // Remember where we started, so that we can go back to it later

        this.options.orig[this.prop] = dataShow || hAzzle.style(this.elem, this.prop);

        this.options.show = true;

        // Begin the animation
        // Make sure that we start at a small width/height to avoid any flash of content


        if (typeof dataShow !== 'undefined') {
            // This show is picking up where a previous hide or show left off

            this.startVal = this.curCSS;
            this.endVal = dataShow;

        } else {

            this.startVal = this.prop === "width" || this.prop === "height" ? 1 : 0;
            this.endVal = this.curCSS;
        }

        this.run(false);
    },

    hide: function () {

        // Remember where we started, so that we can go back to it later

        this.options.orig[this.prop] = hAzzle.data(this.elem, "fxshow" + this.prop) || hAzzle.style(this.elem, this.prop);
        this.options.hide = true;

        this.startVal = this.curCSS;
        this.endVal = 0;

        // Begin the animation

        this.run(false);
    },

    // Start the animation

    run: function (onEnd) {

        var self = this;

        if (!self.canStart) {

            return self;
        }

        var val,
            start,
            end,
            stepDuration = 1000 / hAzzle.fps,
            steps = self.hACEDuration / stepDuration || 0,
            done = true;

        if (typeof self.endVal === 'object') {

            // Force the 'startVal' to be an object
            // if 'endVal' already are an object

            if (typeof self.startVal !== 'object') {

                self.startVal = {};
            }

            for (val in self.endVal) {

                if (!self.startVal.hasOwnProperty(val)) {
                    self.startVal[val] = 0;
                }

                start = self.startVal[val];
                end = self.endVal[val];

                // Parses relative end values with start as base (e.g.: +10, -3)

                if (typeof end === "string") {

                    end = start + parseFloat(end, 10);
                }

                if (typeof end === "number") {
                    self.differences[val] = end - start;
                }
            }

        } else {

            start = self.startVal;
            end = self.endVal;

            // Parses relative end values with start as base (e.g.: +10, -3)

            if (typeof end === "string") {

                end = start + parseFloat(end, 10);
            }

            // Protect against non numeric properties.

            if (typeof end === "number") {

                self.differences.mehran = end;
            }
        }

        self.options.curAnim[self.prop] = true;
        for (var i in self.options.curAnim) {
            if (self.options.curAnim[i] !== true) {
                done = false;
            }
        }

        // Start current animation

        self.hasStarted = true;

        self.stopIt = function () {

            // If the animation have started...

            if (steps >= 0 && self.hasStarted) {

                var v,
                    percent = self.hACEDuration - (steps * stepDuration),
                    ease,

                    tick;

                steps--;

                // Calculat the easing

                ease = self.easing.call(hAzzle.easing, percent / self.hACEDuration);

                if (self.differences.hasOwnProperty('mehran')) {

                    tick = self.startVal + (self.differences.mehran - self.startVal) * ease;

                } else {

                    tick = {};
                }

                /**
                 * The 'tick' can be an object if
                 * we are dealing with
                 * x and y coordinates e.g.
                 */

                if (typeof tick === 'object') {

                    for (v in self.differences) {

                        tick[v] = self.startVal[v] + (self.differences[v] - self.startVal[v]) * ease;
                    }
                }

                /**
                 * If onEnd are true, jump to the end of
                 * the animation
                 *
                 */

                if (onEnd) {

                    // Set hasStarted to false

                    self.hasStarted = false;

                    // Set hasCompleted to true

                    self.hasCompleted = true;

                    self.step.call(self, self.endVal);

                    hAzzle.pipe.remove(self.name);

                    // Else, run as normal

                } else {

                    // Call the 'step' function

                    self.step.call(self, tick);
                }

            } else if (!self.hasStarted) {

                hAzzle.pipe.remove(self.name);

                self.onStopped.call(self);

            } else { // The animation have finished, and stopped itself

                // Remove from the 'pipe'

                hAzzle.pipe.remove(self.name);

                // Set hasStarted to false

                self.hasStarted = false;

                // Set hasCompleted to true

                self.hasCompleted = true;

                // No more animations in the pipeline
                // - clean up the mess	

                if (done) {

                    self.end();
                }
            }
        };

        // Add the animation and the stop function to the 'pipe'

        hAzzle.pipe.add(self.name, self.stopIt);
    },

    // Each step of an animation	

    step: function (tick) {

        var fx = this;

        // Start by showing the element

        if (fx.startVal === tick && fx.options.show) {

            fx.elem.style.display = "block";
        }

        fx.prop == 'transform' ? fx.elem.style[hAzzle.cssSupport.transform] = formatTransform(tick) :
            hAzzle.style(fx.elem, fx.prop, tick);
    },

    end: function () {

        var fx = this;

        if (fx.options.display !== null) {

            // Reset the overflow


            if (fx.options.overflow) {



                fx.elem.style.overflow = fx.options.overflow[0];
                fx.elem.style.overflowX = fx.options.overflow[1];
                fx.elem.style.overflowY = fx.options.overflow[2];
            }

            // Hide the element if the "hide" operation was done

            if (fx.options.hide) {
                hAzzle(fx.elem).hide();
            }
        }

        // Reset the properties, if the item has been hidden or shown

        if (fx.options.hide || fx.options.show) {

            for (var p in fx.options.curAnim) {

                hAzzle.style(fx.elem, p, fx.options.orig[p]);
                hAzzle.removeData(fx.elem, "fxshow" + p, true);
                hAzzle.removeData(fx.elem, "toggle" + p, true);
            }
        }

        if (fx.options.complete) {
            fx.options.complete.call(fx.elem);
        }
    },

    fixSpeed: function () {

        var fx = this,
            opt = fx.options;

        if (typeof opt.duration === 'number') {

            // We get trouble if speed is lower
            // then 80, so adjust back to 80

            return 80 > opt.duration ? 80 : opt.duration;
        }

        if (typeof opt.duration === 'string') {

            return opt.duration in speeds ? speeds[opt.duration] : speeds._default;

        }
        return speeds._default;
    },

    stop: function () {

        //        this.hasStarted = false;
        //        return this;


        this.hasStarted = false;

        //	this.run(true)

        // Empty the pipe

        hAzzle.pipe.hACEPipe = {};
        // 
        return this;

    },
    pause: function () {

        // Remove the animation from the pipe if animation are running

        if (this.hasStarted) {

            hAzzle.pipe.remove(this.name);

        }
        return this;

    },
    resume: function () {

        var self = this;
        if (self.hasStarted) {

            // Do nothing if the animation are in the pipe

            if (hAzzle.pipe.has(self.name)) {
                return;
            }

            // Add the animation back into the pipe

            hAzzle.pipe.add(self.name, self.stopIt);

            return self;
        }
    }
};


hAzzle.extend({

    animate: function (prop, speed, easing, callback) {

        var backup = {};

        if (typeof easing === 'function') {

            callback = easing;

        }
        return this.each(function (el) {

            var
                isElement = this.nodeType === 1,
                hidden = isElement && isHidden(el),
                name, val, p,
                self = this;

            backup.curAnim = prop;
            backup.duration = speed;
            backup.complete = callback || hAzzle.noop;

            for (p in prop) {

                name = hAzzle.camelize(p);

                if (p !== name) {
                    prop[name] = prop[p];
                    delete prop[p];
                }
            }

            for (name in prop) {

                val = prop[name];

                if (val === "hide" && hidden || val === "show" && !hidden) {
                    return backup.complete.call(this);
                }

                if (isElement && (name === "height" || name === "width")) {

                    // Store display property
                    backup.display = hAzzle.getStyle(this, "display");

                    // Make sure that nothing sneaks out
                    backup.overflow = [this.style.overflow, this.style.overflowX, this.style.overflowY];

                    if (hAzzle.getStyle(this, "display") === "inline" &&
                        hAzzle.getStyle(this, "float") === "none") {

                        this.style.zoom = 1;
                    }
                }
            }

            if (backup.overflow !== null) {

                this.style.overflow = "hidden";
            }

            for (p in prop) {

                var fx = new hAzzle.fx(self, backup, p);

                val = prop[p];

                // Toggle, hide and show	

                if (val === 'toggle' || val === 'hide' || val === 'show') {

                    fx[val === "toggle" ? hidden ? "show" : "hide" : val](prop);

                    // CSS transform	

                } else {

                    fx.startVal = fx.curCSS;
                    fx.endVal = (p === 'transform') ? parseTransform(val) : convert(el, val, p);
                    fx.run(false);

                }
            }
        });
    }
});