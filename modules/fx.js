var frame = hAzzle.RAF(),
    fixTs = false, // feature detected below
    dictionary = [],
    rafId;

frame.request(function(timestamp) {
    fixTs = timestamp > 1e12 != frame.perfNow() > 1e12;
});

function Tween(elem, options, prop) {
    return new Tween.prototype.init(elem, options, prop);
}

hAzzle.Tween = Tween;

Tween.prototype = {

    constructor: Tween,

    init: function(elem, options, prop) {

        // Activate RAF and CAF with default framerate

        this.elem = elem;
        this.prop = prop;
        this.easing = options.easing || 'linear';
        this.duration = options.duration || 600;
        this.complete = options.complete;
    },

    run: function(from, to) {

        this.diff = to - from;
        this.start = frame.perfNow();
        this.pos = 0;
        this.to = to;
        this.from = from;

        var self = this,
            callback = {

                animate: function(currentTime, jumpToEnd) {

                    return self.step(currentTime, jumpToEnd);
                },

                elem: this.elem
            };

        dictionary.push(callback);

        if (callback.animate()) {

            rafId = frame.request(raf);
        }
    },

    step: function(currentTime, jumpToEnd) {

        var delta = currentTime - this.start;

        if (delta > this.duration || jumpToEnd) {

            this.pos = this.end;
            //this.elem.style[this.prop] = this.pos + 'px';

            return false;
        }

        // Calculate position and easing

        this.pos = this.diff * hAzzle.easing[this.easing](delta / this.duration) + this.from;

        // Update the CSS style(s)

        this.elem.style[this.prop] = this.pos + 'px';

        return this;
    }
};

Tween.prototype.init.prototype = Tween.prototype;

function raf(timestamp) {
    if (rafId) {
        frame.request(raf);
        tick(timestamp);
    }
}

function tick(tock) {

    var timer, i = 0;

    for (; i < dictionary.length; i++) {

        timer = dictionary[i];

        if (!timer.animate(tock) && dictionary[i] === timer) {
            dictionary.splice(i--, 1);
        }
    }

    if (!dictionary.length) {

        frame.cancel(rafId);

        // Avoid memory leaks

        rafId = null;
    }
}

hAzzle.extend({

    animate: function(options) {

        return this.each(function() {

            for (var i in options) {

                var anim = new Tween(this, options, i);

                anim.run(parseFloat(hAzzle.css(this, i)), options[i]);
            }
        });
    },

    stop: function(gotoEnd) {

        return this.each(function() {
            var timers = dictionary,
                i = timers.length;

            while (i--) {
                if (timers[i].elem === this) {
                    if (gotoEnd) {
                        // force the next step to be the last
                        timers[i](null, true);
                    }

                    timers.splice(i, 1);
                }
            }
        });
    }
});