var nativeRequestAnimationFrame,
    nativeCancelAnimationFrame;

// Grab the native request and cancel functions.

(function() {

    var top;

    // Test if we are within a foreign domain. Use raf from the top if possible.

    try {
        // Accessing .name will throw SecurityError within a foreign domain.
        window.top.name;
        top = window.top;
    } catch (e) {
        top = window;
    }

    nativeRequestAnimationFrame = top.requestAnimationFrame;
    nativeCancelAnimationFrame = top.cancelAnimationFrame || top.cancelRequestAnimationFrame;

    if (!nativeRequestAnimationFrame) {

        // Get the prefixed one

        nativeRequestAnimationFrame = top.requestAnimationFrame ||
            top.webkitRequestAnimationFrame || // Chrome <= 23, Safari <= 6.1, Blackberry 10
            top.msRequestAnimationFrame ||
            top.mozRequestAnimationFrame ||
            top.msRequestAnimationFrame;

        nativeCancelAnimationFrame = top.webkitCancelAnimationFrame ||
            top.webkitCancelRequestAnimationFrame ||
            top.msCancelRequestAnimationFrame ||
            top.mozCancelAnimationFrame;
    }

    nativeRequestAnimationFrame && nativeRequestAnimationFrame(function() {
        RAF.hasNative = true;
    });
}());

function RAF(options) {

    if (!(this instanceof RAF)) {
        return new RAF.prototype.init(options);
    }

    return new RAF.prototype.init(options);
}

hAzzle.RAF = RAF;

RAF.prototype = {

    constructor: RAF,

    // Default 60 fps

    fps: 60,

    init: function(options) {

        options = options || {};

        // Its a frame rate.

        if (typeof options == 'number') options = {
            frameRate: options
        };

        options.useNative != null || (options.useNative = true);

        this.options = options;
        this.frameRate = options.frameRate || this.fps;
        this.frameLength = 1000 / this.frameRate;
        this.isCustomFrameRate = this.frameRate !== this.fps;
        this.timeoutId = null;
        this.callbacks = {};
        this.lastTickTime = 0;
        this.tickCounter = 0;
    },

    shim: function(options) {

        var animationFrame = RAF(options);

        window.requestAnimationFrame = function(callback) {

            return animationFrame.request(callback);
        };

        window.cancelAnimationFrame = function(id) {

            return animationFrame.cancel(id);
        };

        return animationFrame;
    },

    hasNative: false,

    request: function(callback) {

        var self = this,
            delay;

        ++this.tickCounter;

        if (RAF.hasNative && self.options.useNative && !this.isCustomFrameRate) {

            return nativeRequestAnimationFrame(callback);
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
                ++self.tickCounter;

                for (id in self.callbacks) {

                    if (self.callbacks[id]) {

                        if (RAF.hasNative && self.options.useNative) {

                            nativeRequestAnimationFrame(self.callbacks[id]);

                        } else {

                            self.callbacks[id](self.perfNow());
                        }

                        delete self.callbacks[id];
                    }
                }
            }, delay);
        }

        this.callbacks[this.tickCounter] = callback;
        return this.tickCounter;
    },

    cancel: function(id) {

        if (this.hasNative && this.options.useNative) {
            nativeCancelAnimationFrame(id);
        }

        delete this.callbacks[id];
    },

    perfNow: function() {

        if (window.performance) {
            return window.performance.now() ||
                window.performance.webkitNow() ||
                window.performance.msNow() ||
                window.performance.mozNow();
        }
        return hAzzle.now() - this.navigationStart;
    },

    navigationStart: hAzzle.now()
};

RAF.prototype.init.prototype = RAF.prototype;