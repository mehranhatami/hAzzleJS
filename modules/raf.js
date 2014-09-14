var nRAF = hAzzle.cssHas.requestFrame,
    nCAF = hAzzle.cssHas.cancelFrame,
    perf = window.performance,
    perfNow = perf && (perf.now || perf.webkitNow || perf.msNow || perf.mozNow),
    now = hAzzle.pnow = perfNow ? function() {
        return perfNow.call(perf);
    } : function() { // IE9
        return hAzzle.now();
    },
    appleiOS = /iP(ad|hone|od).*OS (6|7)/,
    nav = window.navigator.userAgent;

    nRAF && !appleiOS.test(nav) && nRAF(function() {
        RAF.hasNative = true;
    });

function RAF(options) {

    if (!(this instanceof RAF)) {
        return new RAF.prototype.init(options);
    }

    return new RAF.prototype.init(options);
}

hAzzle.RAF = RAF;

RAF.prototype = {

    constructor: RAF,

    defaultFPS: 60,

    init: function(options) {

        options = options ? options :
            typeof options == 'number' ? {
                frameRate: options
            } : {};

        this.frameRate = options.frameRate || this.defaultFPS;
        this.frameLength = 1000 / this.frameRate;
        this.isCustomFPS = this.frameRate !== this.defaultFPS;

        // Timeout ID
        this.timeoutId = null;

        // Callback

        this.callbacks = {};

        // Last 'tick' time

        this.lastTickTime = 0;

        // Tick counter

        this.tickCounter = 0;

        // Use native {Booleans}

        this.useNative = false;

        options.useNative != null || (this.useNative = true);
    },

    hasNative: false,

    request: function(callback) {

        var self = this,
            delay;

        ++this.tickCounter;

        if (RAF.hasNative && self.useNative &&
            !this.isCustomFPS) {
            return nRAF(callback);
        }

        if (!callback) {
            hAzzle.error('Not enough arguments');
        }

        if (this.timeoutId === null) {

            delay = this.frameLength + this.lastTickTime - hAzzle.now();

            if (delay < 0) {
                delay = 0;
            }

            this.timeoutId = window.setTimeout(function() {

                var id;

                self.lastTickTime = hAzzle.now();
                self.timeoutId = null;
                self.tickCounter++;

                for (id in self.callbacks) {

                    if (self.callbacks[id]) {

                        if (RAF.hasNative && self.useNative) {

                            nRAF(self.callbacks[id]);

                        } else {

                            self.callbacks[id](self.perfNow());
                        }

                        delete self.callbacks[id];
                    }
                }
            }, delay);
        }

        // Need to check 'callbacks' not are undefined, else it throws
        // and nothing will work. Better to die silently!

        if (self.callbacks !== undefined) {
            self.callbacks[this.tickCounter] = callback;
            return this.tickCounter;
        }
    },

    cancel: function(id) {

        if (this.hasNative && this.useNative) {
            nCAF(id);

        }

        delete this.callbacks[id];
    },

    perfNow: function() {
        return now() - this.navigationStart;
    },

    navigationStart: hAzzle.now()
};

RAF.prototype.init.prototype = RAF.prototype;