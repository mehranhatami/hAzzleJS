/**
 * hAzzle Animation Core engine ( hACE )
 */
var thousand = 1000,
    toH_endTime,
    toH_currentTime,
    toH_isEnded;

// Extend the globale hAzzle Core

hAzzle.extend({

    createHook: function (core, filterName) {

        var filters = hAzzle.hACE.prototype.extensions,
            args = core.filterArgs;

        each(filters, function (name) {

            if (typeof filters[name][filterName] !== 'undefined') {
                filters[name][filterName].apply(core, args);
            }
        });

    },

    // hACE

    hACE: function (init, options) {

        var self = this;
        self.currentState = init || {};
        self.configured = false;

        if (options !== undefined) {

            // Configure hACE
            self.adjust(options);
        }
    }

}, hAzzle);


// Default duration

hAzzle.hACE.fps = 60;

// Default framelength

hAzzle.hACE.frameLength = thousand / hAzzle.hACE.fps;

// hACE prototype

hAzzle.hACE.prototype = {

   /**
    * Start hAce
	*/
	
    start: function (options) {

        var self = this;

        if (self.isRunning) {

            return self;
        }

        // Only set default config if no configuration has been set previously and none is provided now.

        if (options !== undefined || !self.configured) {

            self.adjust(options);
        }

        // Start hAce

        self.start(self.get());

        return self.resume();
    },

    // Configure hAce

    adjust: function (config) {

        var self = this;

        config = config || {};
        self.configured = true;

        // Init the internal state


        easings: 'linear',

            // Default duration

            hAzzle.hACE.fps = config.fps || 60;

        self.pausedAtTime = null;
        self.start = config.start || hAzzle.noop;
        self.step = config.step || hAzzle.noop;
        self.finish = config.finish || hAzzle.noop;
        self.duration = config.duration || hAzzle.duration;
        self.currentState = config.from || self.get();
        self.originalState = self.get();
        self.targetState = config.to || self.get();
        self.timestamp = hAzzle.pnow();

        // Aliases used below
        var currentState = self.currentState,
            targetState = self.targetState;

        // Ensure that there is always something to tween to.
        defaults(targetState, currentState);

        self.easing = createEasing(
            currentState, config.easing || /* default duration */ 500);

        self.filterArgs = [currentState, self.originalState, targetState, self.easing];

        hAzzle.createHook(self, 'tweenCreated');

        return self;

    },

    get: function () {

        return shallowCopy({}, this.currentState);
    },

    set: function (state) {

        this.currentState = state;

    },

    pause: function () {

        this.pausedAtTime = hAzzle.pnow();
        this.isPaused = true;
        return this;
    },

    resume: function () {

        var self = this;

        if (self.isPaused) {

            self.timestamp += hAzzle.pnow() - self.pausedAtTime;
        }

        self.isPaused = false;
        self.isRunning = true;
        self.toH = function () {
            toH(self, self.timestamp, self.duration, self.currentState,
                self.originalState, self.targetState, self.easing, self.step,
                hAzzle.requestFrame);
        };

        self.toH();

        return self;

    },

    stop: function (gotoEnd) {

        var self = this;
        self.isRunning = false;
        self.isPaused = false;
        self.toH = hAzzle.noop;

        if (gotoEnd) {
			
            shallowCopy(self.currentState, self.targetState);
            hAzzle.createHook(self, 'afterEnd');
            self.finish.call(self, self.currentState);
        }

        return self;
    },

    isPlaying: function () {
        return this.isRunning && !this.isPaused;

    },

    dispose: function () {
        var prop;
        for (prop in this) {
            if (this.hasOwnProperty(prop)) {
                delete this[prop];
            }
        }
    },

    extensions: {}
};



/* =========================== PRIVATE FUNCTIONS ========================== */



function each(obj, fn) {
    var key;
    for (key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            fn(key);
        }
    }
}

function shallowCopy(targetObj, srcObj) {
    each(srcObj, function (prop) {
        targetObj[prop] = srcObj[prop];
    });

    return targetObj;
}


function defaults(target, src) {
    each(src, function (prop) {
        if (typeof target[prop] === 'undefined') {
            target[prop] = src[prop];
        }
    });
}


function props(forPosition, currentState, originalState, targetState,
    duration, timestamp, easing) {

    var normalizedPosition = (forPosition - timestamp) / duration,
        prop;

    for (prop in currentState) {
        if (currentState.hasOwnProperty(prop)) {


            currentState[prop] = calculate(originalState[prop],
                targetState[prop], hAzzle.easing[easing[prop]], normalizedPosition);
        }
    }

    return currentState;
}


function calculate(start, end, easingFunc, position) {
    return start + (end - start) * easingFunc(position);
}

function toH(core, timestamp, duration, currentState,
    originalState, targetState, easing, step, schedule) {

    toH_endTime = timestamp + duration;
    toH_currentTime = Math.min(hAzzle.pnow(), toH_endTime);
    toH_isEnded = toH_currentTime >= toH_endTime;

    if (core.isPlaying() && !toH_isEnded) {

          schedule(core.toH, hAzzle.hACE.frameLength);

        // Create hook

        hAzzle.createHook(core, 'before');

        props(toH_currentTime, currentState, originalState, targetState, duration, timestamp, easing);

        hAzzle.createHook(core, 'after');

        step(currentState);

        // Animation have stopped

    } else if (toH_isEnded) {

        step(targetState);

        core.stop(true);
    }
}

function createEasing(from, easing) {
    var easeObj = {};

    if (typeof easing === 'string') {
        each(from, function (prop) {
            easeObj[prop] = easing;
        });
    } else {
        each(from, function (prop) {
            if (!easeObj[prop]) {
                easeObj[prop] = easing[prop] || easing;
            }
        });
    }

    return easeObj;
}