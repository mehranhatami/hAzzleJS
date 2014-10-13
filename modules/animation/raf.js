// raf.js
hAzzle.define('Raf', function() {

    var nRAF,
        nCAF,
        perf = window.performance,
        perfNow = perf && (perf.now || perf.webkitNow || perf.msNow || perf.mozNow),
        now = perfNow ? function() {
            return perfNow.call(perf);
        } : function() { // -IE9
            return Date.now();
        },
        appleiOS = /iP(ad|hone|od).*OS (6|7)/,
        nav = window.navigator.userAgent;
    // Grab the native request and cancel functions.

    (function() {

        var top, timeLast;

        // Test if we are within a foreign domain. Use raf from the top if possible.

        try {
            // Accessing .name will throw SecurityError within a foreign domain.
            window.top.name;
            top = window.top;
        } catch (e) {
            top = window;
        }

        nRAF = top.requestAnimationFrame;
        nCAF = top.cancelAnimationFrame || top.cancelRequestAnimationFrame;

        if (!nRAF) {

            // Get the prefixed one

            nRAF = top.webkitRequestAnimationFrame || // Chrome <= 23, Safari <= 6.1, Blackberry 10
                top.msRequestAnimationFrame ||
                top.mozRequestAnimationFrame ||
                top.msRequestAnimationFrame || function(callback) {
                    var timeCurrent = Date.now(),
                        timeDelta;

                    /* Dynamically set delay on a per-tick basis to match 60fps. */
                    /* Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671 */
                    timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
                    timeLast = timeCurrent + timeDelta;

                    return setTimeout(function() {
                        callback(timeCurrent + timeDelta);
                    }, timeDelta);
                };

            nCAF = top.webkitCancelAnimationFrame ||
                top.webkitCancelRequestAnimationFrame ||
                top.msCancelRequestAnimationFrame ||
                top.mozCancelAnimationFrame || function(id) {
                    clearTimeout(id);
                };
        }

        nRAF && !appleiOS.test(nav) && nRAF(function() {
            RAF.hasNative = true;
        });
    }());

    function RAF(options) {

        if (!(this instanceof RAF)) {
            return new RAF.prototype.init(options);
        }

        return new RAF.prototype.init(options);
    }

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

            // timeout ID
            this.timeoutId = null;

            // callback

            this.callbacks = {};

            // last 'tick' time

            this.lastTickTime = 0;

            // tick counter

            this.tickCounter = 0;

            // use native {Booleans}

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
                hAzzle.err(true, 9, 'Not enough arguments for rAF to work with');
            }

            if (this.timeoutId === null) {

                delay = this.frameLength + this.lastTickTime - Date.now();

                if (delay < 0) {
                    delay = 0;
                }

                this.timeoutId = window.setTimeout(function() {

                    var id;

                    self.lastTickTime = Date.now();
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

        navigationStart: Date.now()
    };

    RAF.prototype.init.prototype = RAF.prototype;

    var _raf = new RAF();

    this.requestAnimationFrame = function(fn) {
        return _raf.request(fn)
    };

    this.cancelAnimationFrame = function(id) {
        return _raf.cancel(id)
    };

    return {
        rAF: RAF,
        performanceNow: perfNow,
        pnow: now
    }
});