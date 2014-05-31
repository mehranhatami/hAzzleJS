/**
 * hAzzle Animation Core engine ( hACE )
 */
var win = this,
    thousand  = 1000,

    /**
     * Mehran!
     *
     * There are bug in iOS v6 and older iOS. I did a primitive
     * way to prevent this, just blacklisted. There are other
     * ways around it - much better once.
     *
     * Can you look into this and fix?
     *
     * How many are using iOS 6 now? Isn't iOS 8 soon?
     */

    blacklisted = /iP(ad|hone|od).*OS 6/.test(win.navigator.userAgent),
    perf = win.performance || {},
    perfNow = perf && (perf.now || perf.webkitNow || perf.msNow || perf.mozNow),
    now = perfNow ? function () { return perfNow.call(perf); } : function () { return hAzzle.now(); },
    fixTs = false, // feature detected below

    // RequestAnimationFrame

    requestAnimFrame = (function () {
        var legacy = (function fallback(callback) {
            var currTime = now(),
                lastTime = currTime + timeToCall,
                timeToCall = Math.max(0, 17 - (currTime - lastTime));
            return win.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
        });
        return !blacklisted ? (hAzzle.prefix('RequestAnimationFrame') || legacy) : legacy;
    })(),

    // CancelAnimationFrame

    cancelAnimFrame = function () {
        var legacy = (function (id) {
            clearTimeout(id);
        });
        return !blacklisted ? (hAzzle.prefix('CancelAnimationFrame') || hAzzle.prefix('CancelRequestAnimationFrame') || legacy) : legacy;
    }();

requestAnimFrame(function (timestamp) {
    // feature-detect if rAF and now() are of the same scale (epoch or high-res),
    // if not, we have to do a timestamp fix on each frame
    fixTs = timestamp > 1e12 !== now() > 1e12;
});

/**
 * Our runer
 *
 */

function run() {
    var hp = hAzzle.pipe,
        n;

    hp.raf = requestAnimFrame.call(win, run);
    hp.now = now();
    hp.delta = hp.now - hp.then;
    if (hp.delta > hp.interval) {
        for (n in hp.pipeline) {
            if (hp.pipeline.hasOwnProperty(n)) {

                hp.pipeline[n](hp.delta);
            }
        }
        hp.then = hp.now - (hp.delta % hp.interval);
    }
}

// Extend the hAzzle Object

hAzzle.extend({

    /**
     * Mehran!
     *
     * fps are exposed to the global hAzzle Object so we can
     * overrun it in plugins and / or other Core functions
     */

    fps: 60,

    hACE: function (ctlr) {

        var self = this;

        // Unique ID on each animation

        self.name = hAzzle.getUID(self);

        self.controller = ctlr || new hAzzle.hACEController();

        self.startVal = 0;
        self.endVal = 0;
        self.differences = {};
        self.canStart = true;
        self.hasStarted = false;
        self.hasCompleted = false;
        self.hACEDuration = 400;
        self.delayDuration = 0;
        self.isDelayed = false;
        self.repeatCount = 0;
        self.paused = false;
        self.easing = hAzzle.easing.easeNone;

        // All of them are using hAzzle.noop, so we can save some bytes, we do it like this

        self.onStep = self.onComplete = self.onStopped = self.andThen = hAzzle.noop;
    },

    AnimationPipe: function () {
        var self = this;
        self.pipeline = {};
        self.then = now();
        self.now = self.raf = self.delta = 'undefined';
        self.interval = thousand  / hAzzle.fps;
        self.running = self.hasNative = false;
    },

    hACEController: function () {
        this.queue = [];
    }

}, hAzzle);


/**
 * Prototype for AnimationPipe
 */

hAzzle.AnimationPipe.prototype = {

    /**
     * Add animation to the pipeline
     *
     * @param{String} name
     * @param{Function} fn
     * @return{hAzzle}
     *
     */

    add: function (name, fn) {
        this.pipeline[name] = fn;
        return this;
    },

    /**
     * Remove animation from the pipeline
     *
     * @param{String} name
     * @return{hAzzle}
     *
     */

    remove: function (name) {
        delete this.pipeline[name];
        return this;
    },

    /**
     * Starts the animation engine
     *
     * @param{Nummber} fps
     * @return{hAzzle}
     *
     */

    start: function (fps) {

        /**
         * Only call "run" if the animation
         * are not running
         */

        if (!this.running) {
			
            hAzzle.fps = fps || hAzzle.fps;
            this.interval = 1000 / hAzzle.fps;

            run();
        }
        return this;
    },

    /**
     * Check if the pipeline contains an animation
     *
     * @param {String} name
     * @return {hAzzle}
     *
     */

    has: function (name) {
        return name in this.pipeline;
    },

    /**
     * Pause an animation in the pipe
     *
     * @return {hAzzle}
     *
     */

    pause: function () {
		var self = this;
        if (self.running) {
            cancelAnimFrame.call(win, self.raf);
            self.running = false;
        }
        return this;
    },

    /**
     * Set FPS
     *
     * @param {Number} fps
     * @return {hAzzle}
     *
     */

    setFPS: function (fps) {
        this.interval = thousand  / fps;
    }
};

/**
 * Pipeline has to be created and
 * started automaticly
 */

hAzzle.pipe = new hAzzle.AnimationPipe();
hAzzle.pipe.start();


/**
 * Prototype for our hACEController
 */

hAzzle.hACEController.prototype = {

    queue: function () {
		
        var nt = new hAzzle.hACE(this),
            pt = this.queue[this.queue.length - 1];
        if (!pt || pt && pt.hasCompleted) {
            nt.canStart = true;
        } else {
            nt.canStart = false;
            pt.then(function () {
                nt.canStart = true;
                nt.start();
            });
        }
        this.queue.push(nt);
        return nt;
    }
};

/**
 * Prototype for AnimationPipe
 */

hAzzle.hACE.prototype = {

    /**
     * Start position
     *
     * @param {Number} val
     * @return {hAzzle}
     */

    from: function (val) {
        this.startVal = val;
        return this;
    },

    /**
     * End position
     *
     * @param {Number} val
     * @return {hAzzle}
     */

    to: function (val) {
        this.endVal = val;
        return this;
    },

    /**
     * Set duration
     *
     * @param {Number} ms
     * @return {hAzzle}
     */

    duration: function (ms) {
        this.hACEDuration = ms;
        return this;
    },

    /**
     * Set an delay in ms before execution
     *
     * @param {Number} ms
     * @return {hAzzle}
     */

    delay: function (ms) {
        this.delayDuration = ms;
        return this;
    },

    /**
     * Repetation of the animation x times
     *
     * @param {Number} count
     * @return {hAzzle}
     */

    repeat: function (count) {
        this.repeatCount = count;
        return this;
    },

    /**
     * Easing
     *
     * @param {Function} fn
     * @return {hAzzle}
     */

    ease: function (fn) {
        this.easing = fn;
        return this;
    },

    /**
     * Animation steping
     *
     * @param {Function} fn
     * @return {hAzzle}
     */

    step: function (fn) {
        this.onStep = fn;
        return this;
    },

    /**
     * Function to be executed when animation are completed
     *
     * @param {Function} fn
     * @return {hAzzle}
     */

    complete: function (fn) {
        this.onComplete = fn;
        return this;
    },

    /**
     * Function to be executed when animation are stopped
     *
     * @param {Function} fn
     * @return {hAzzle}
     */

    stopped: function (fn) {
        this.onStopped = fn;
        return this;
    },

    /**
     * Then
     *
     * @param {Function} fn
     * @return {hAzzle}
     */

    then: function (fn) {
        this.andThen = fn;
        return this;
    },

    /**
     * Reverse the animation
     *
     * @return {hAzzle}
     */
    reverse: function () {
        var self = this,
            sV = self.startVal,
            eV = self.endVal;
        self.startVal = eV;
        self.endVal = sV;
        self.start();
    },

    /**
     * Start the animation
     *
     * @return {hAzzle}
     */

    start: function () {

        var self = this;
        if (!self.canStart) return self;
        if (self.delayDuration > 0 && !self.isDelayed) {
            setTimeout(function () {
                self.start();
            }, self.delayDuration);
            self.isDelayed = true;
            return self;
        }

        var val,
            stepDuration = thousand  / hAzzle.fps,
            steps = self.hACEDuration / stepDuration;

        if (typeof self.endVal === 'object') {
            if (typeof self.startVal !== 'object') {
                self.startVal = {};
            }
            for (val in self.endVal) {
                if (!self.startVal.hasOwnProperty(val)) {
                    self.startVal[val] = 0;
                }
                self.differences[val] = self.endVal[val] - self.startVal[val];
            }
        } else {
            self.differences['mehran'] = self.endVal - self.startVal;
        }

        self.hasStarted = true;

        // Our stop function

        self.stpFn = function () {
            if (steps >= 0 && self.hasStarted) {

                var s = self.hACEDuration,
                    vals;

                s = s - (steps * stepDuration);
                steps--;

                if (self.differences.hasOwnProperty('mehran')) {

                    vals = self.easing.call(hAzzle.easing, s, self.startVal, self.differences['mehran'], self.hACEDuration);

                } else {

                    vals = {};

                }

                // If object

                if (typeof vals === 'object') {
                    for (var v in self.differences) {
                        vals[v] = self.easing.call(hAzzle.easing, s, self.startVal[v], self.differences[v], self.hACEDuration);
                    }
                }

                self.onStep.call(self, vals);

            } else if (!self.hasStarted) {

                // If animation have not started, remove it from the 'pipe'

                hAzzle.pipe.remove(self.name);
                self.onStopped.call(self);
            } else {
                hAzzle.pipe.remove(self.name);
                self.hasStarted = false;
                self.isDelayed = false;
                if (self.repeatCount > 0 || self.repeatCount === -1 || self.repeatCount === Infinity) {
                    self.repeatCount = self.repeatCount < 0 || self.repeatCount === Infinity ? self.repeatCount : self.repeatCount--;
                    self.onComplete.call(self, self.end);
                    self.start();
                } else {
                    self.hasCompleted = true;
                    self.onComplete.call(self, self.end);
                    self.andThen.call(self);
                    self.controller.queue.shift();
                }
            }
        };

        // Add the animation and the stop function to the 'pipe'

        hAzzle.pipe.add(self.name, self.stpFn);

        return self;
    },

    /**
     * Stop the animation
     *
     * @return {hAzzle}
     */

    stop: function () {
        this.hasStarted = false;
        return this;
    },

    /**
     * Pause the animation
     *
     * @return {hAzzle}
     */

    pause: function () {

        // Remove the animation from the pipe

        hAzzle.pipe.remove(this.name);
        return this;

    },

    /**
     * Resume the animation
     *
     * @return {hAzzle}
     */

    resume: function () {

        // Do nothing if the animation are in the pipe

        if (hAzzle.pipe.has(this.name)) {
            return;
        }

        // Add the animation back into the pipe

        hAzzle.pipe.add(this.name, this.stpFn);

        return this;
    },

    /**
     * Queue the animation
     *
     * @return {hAzzle}
     */

    queue: function () {
        return this.controller.queue();
    }

};