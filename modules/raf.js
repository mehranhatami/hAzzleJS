var nRAF,
    nCAF,

    // Default 60 fps
	
	defaultFPS = hAzzle.defaultFPS = 60;

// Grab the native request and cancel functions.

(function() {

    var top;

    // Test if we are within a foreign domain. Use raf from the top if possible.

    try {
        // Accessing .name will throw SecurityError within a foreign domain.
        var name = window.top.name
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
            top.msRequestAnimationFrame;

        nCAF = top.webkitCancelAnimationFrame ||
            top.webkitCancelRequestAnimationFrame ||
            top.msCancelRequestAnimationFrame ||
            top.mozCancelAnimationFrame;
    }

    nRAF && nRAF(function() {
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

    init: function(options) {

        options = options || {};

        // It's a frame rate.

        if (typeof options == 'number') {
		
			options = {
            frameRate: options
          };
		}
		
        this.frameRate = options.frameRate || hAzzle.defaultFPS.toString();
        this.frameLength = 1000 / this.frameRate;
        this.isCustomFPS = this.frameRate !== hAzzle.defaultFPS;

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

    pollify: function(options) {

        var _RAF = RAF(options);

        window.requestAnimationFrame = function(callback) {
            return _RAF.request(callback);
        };

        window.cancelAnimationFrame = function(id) {
            return _RAF.cancel(id);
        };

        return _RAF;
    },

    hasNative: false,

    request: function(callback) {

        var self = this, delay;

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

       var wPerf = window.performance;

        if (wPerf) {

			return wPerf.now() ||
                wPerf.webkitNow() ||
                wPerf.msNow() ||
                wPerf.mozNow();
        }
        return hAzzle.now() - this.navigationStart;
    },

    navigationStart: hAzzle.now()
};

RAF.prototype.init.prototype = RAF.prototype;