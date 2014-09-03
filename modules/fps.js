// fps.js
var thousand = 1000;

function fps(opts) {
    return new fps.prototype.init(opts);
}

hAzzle.fps = fps;

fps.prototype = {

    constructor: fps,

    init: function(opts) {

        opts || (opts = {});
        this.updateRate = opts.updateRate || thousand;
        this.tickCounter = 0;
        this.updateTimeoutId = null;
    },

    calculate: function(callback) {

        var self = this;

        self.startTime = hAzzle.now();
        self.tickCounter = 0;
        self.updateTimeoutId = setTimeout(function() {

            if (self.tickCounter) {
                callback(Math.round(thousand / ((hAzzle.now() - self.startTime) / self.tickCounter)));
            }

            self.calculate(callback);

        }, self.updateRate);

        return self;
    },

    stop: function() {
        var self = this;
        clearTimeout(self.updateTimeoutId);
        return self;
    },

    tick: function() {
        var self = this;
        ++self.tickCounter;
        return self;
    }
}

fps.prototype.init.prototype = fps.prototype;