// percentage.js
var percent = '%';

function Percentage(elem, to, options) {
    return new Percentage.prototype.init(elem, to, options);
}

hAzzle.Percentage = Percentage;

Percentage.prototype = {

    constructor: Percentage,

    init: function(elem, to, options) {

        length = dictionary.length

        this.elem = elem;
        this.complete = options.callback;
        this.completeParams = options.callbackParams;

        var i = 0,
            ar = [],
            prop, begin, end,
            newbs = to.to,
            from = to.from,
            self = hAzzle.private(elem, 'fxDta', dictionary[length++] = this),
            easing = options.ease || hAzzle.defaultEasing,
            duration = options.duration || defaultDuration;

        // Support for jQuery's named durations.

        switch (duration.toString().toLowerCase()) {
            case 'fast':
                duration = 200;
                break;

            case 'normal':
                duration = defaultDuration;
                break;

            case 'slow':
                duration = 600;
                break;

            default:

                // Default to 1 if the user is attempting to set a duration of 0 (in order to 
                // produce an immediate style change).
                duration = parseFloat(duration) || 1;
        }

        for (prop in from) {

            if (!from.hasOwnProperty(prop)) {
                continue;
            }

            end = parseInt(newbs[prop], 10);
            begin = parseInt(from[prop], 10);

            ar[i++] = [end > begin, prop, end, begin];
        }

        // Make visible if hidden

        elem.style.visibility = 'visible';

        self.transitions = self.animate(elem, ar, duration, easing);

        // Start the animation

        if (!engineRunning) {
            ticker();
        }
    },

    cycle: function() {
        return this.transitions();
    },

    // Animate percentages

    animate: function(elem, to, duration, ease) {

        var tick, timed = 0,
            then = pnow(),
            now, i, style = elem.style,
            leg = to.length,
            itm, begin;

        return function(force) {

            now = pnow();
            timed += now - then;
            then = now;

            tick = hAzzle.easing[ease](timed / duration);
            i = leg;

            if (tick < 0.99 && !force) {

                // Note! For now we are setting the styles directly - better performance.
                // I'm going to change this in the future

                while (i--) {

                    itm = to[i];

                    if (to[i][0]) {

                        style[to[i][1]] = (to[i][3] + ((to[i][2] - to[i][3]) * tick)) + percent;

                    } else {

                        style[to[i][1]] = (to[i][3] - ((to[i][3] - to[i][2]) * tick)) + percent;
                    }
                }

                return true;

            } else {

                while (i--) {

                    style[to[i][1]] = to[i][2] + percent;
                }

                return false;
            }

        };

    },

    // Stop a percentage animation

    stop: function(complete, callback, popped) {

        hAzzle.removePrivate(this.elem, 'fxDta');

        if (complete && this.transitions) {

            this.transitions(true);
        }

        if (callback) {
            callback = this.complete;
        }

        if (!popped) {
            popTween(this, this.elem, callback, this.completeParams);
        }

    }
};

Percentage.prototype.init.prototype = Percentage.prototype;