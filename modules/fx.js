var frame = hAzzle.RAF(),
    fixTick = false, // feature detected below
    dictionary = [],
    rafId;

frame.request(function(timestamp) {
    fixTick = timestamp > 1e12 != frame.perfNow() > 1e12;
});

function Tween(elem, options, prop) {
    return new Tween.prototype.init(elem, options, prop);
}

hAzzle.Tween = Tween;

Tween.prototype = {

    constructor: Tween,

    init: function(elem, options, prop) {

        this.elem = elem;
        this.prop = prop;
        this.currentState = {};
        this.options = options;
        this.easing = options.easing || 'linear';
        this.duration = options.duration || 600;
    },

    run: function(from, to) {

        this.diff = to - from;
        this.start = frame.perfNow();
        this.pos = 0;
        this.to = to;
        this.from = from;

        var self = this,
            done = true,
            callback = {

                animate: function(currentTime, jumpToEnd) {

                    var delta = currentTime - self.start;

                    if (delta > self.duration || jumpToEnd) {

                        self.currentState[self.currentState.prop] = true;

                        for (i in self.currentState) {
                            if (self.currentState[i] !== true) {
                                done = false;
                            }
                        }
                        if (done) {

                            if (jumpToEnd) {

                                self.pos = to;

                                // Only do style update if jumpToEnd 

                                self.update();
                            }

                            // Execute the complete function

                            complete = self.options.complete;

                            if (complete) {

                                self.options.complete = false;
                                complete.call(self.elem);
                            }
                        }
                        return false;
                    }
                    // Calculate position and easing

                    self.pos = self.diff * hAzzle.easing[self.easing](delta / self.duration) + self.from;

                    // Update the CSS style(s)
                    console.log(self.pos)
                    self.update();

                    return true;
                },

                elem: this.elem
            };

        if (callback.animate() && dictionary.push(callback)) {
            if (!rafId) {
                rafId = frame.request(function render(tick) {

                    var timer, i = 0;

                    if (fixTick) {
                        tick = frame.perfNow();
                    }
                    frame.request(render);

                    for (; i < dictionary.length; i++) {

                        timer = dictionary[i];

                        if (!timer.animate(tick) && dictionary[i] === timer) {
                            dictionary.splice(i--, 1);
                        }
                    }

                    if (!dictionary.length) {

                        frame.cancel(rafId);

                        // Avoid memory leaks

                        rafId = null;
                    }
                });
            }
        }
    },

    update: function() {
        this.elem.style[this.prop] = this.pos + 'px';
    }
};

Tween.prototype.init.prototype = Tween.prototype;

hAzzle.extend({

    animate: function(options, speed, easing, callback) {


        var opt;

        if (typeof speed === 'object') {

            opt = hAzzle.shallowCopy({}, speed);

        } else {

            opt = {

                complete: callback || !callback && easing ||
                    hAzzle.isFunction(speed) && speed,
                duration: speed,
                easing: callback && easing || easing && !hAzzle.isFunction(easing) && easing
            };

            // Support for jQuery's named durations.

            switch (opt.duration.toString().toLowerCase()) {
                case 'fast':
                    opt.duration = 200;
                    break;
                case 'normal':
                    opt.duration = 500;
                    break;
                case 'medium':
                    opt.duration = 400;
                    break;
                case 'slow':
                    opt.duration = 1500;
                    break;
                default:

                    // If the user is attempting to set a duration of 0 (in order to produce an immediate style change).
                    opt.duration = parseFloat(opt.duration) || 1;
            }
        }

        return this.each(function() {

            var index;

            for (index in options) {

                var anim = new Tween(this, opt, index);

                anim.run(parseFloat(hAzzle.css(this, index)), options[index]);
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

                        // Force the next step to be the last

                        timers[i].animate(null, true);
                    }

                    timers.splice(i, 1);
                }
            }
        });
    }
});