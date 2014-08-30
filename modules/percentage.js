// percentage.js
var percent = '%';

function Percentage(elem, to, options) {

    if (!(this instanceof Percentage)) {
        return new Percentage.prototype.init(elem, to, options);
    }

    return new Percentage.prototype.init(elem, to, options);
}

Percentage.prototype = {

    constructor: Percentage,

    init: function(elem, to, options) {

        length = hAzzle.dictionary.length;

        this.elem = elem;
        this.complete = options.callback;
        this.completeParams = options.callbackParams;
        this.originalState = [];

        var i = 0,
            ar = [],
            prop, begin, end,
            newbs = to.to,
            from = to.from,
            style = elem.style,
            self = hAzzle.private(elem, 'fxDta', hAzzle.dictionary[length++] = this),
            easing = options.ease || hAzzle.defaultEasing,

            // Support for jQuery's named durations.
            // Duration '0' will likely never happen, it will see it as false,
            // and set 'hAzzle.defaultDuration'

            duration = options.duration ?
            (hAzzle.speeds[options.duration] || options.duration) :
            hAzzle.defaultDuration;

			self.percentage = true;
			
        // Height/width overflow pass

        if (elem.nodeType === 1 && ('height' in to.to || 'width' in to.to)) {
            this.originalState.overflow = [style.overflow, style.overflowX, style.overflowY];
            display = hAzzle.css(elem, 'display');
            checkDisplay = display === 'none' ?
                hAzzle.getPrivate(elem, 'olddisplay') || defaultDisplay(elem.nodeName) : display;
            if (checkDisplay === 'inline' && hAzzle.css(elem, 'float') === 'none') {
                style.display = 'inline-block';
            }
        }

        if (this.originalState.overflow) {
            style.overflow = 'hidden';
        }

        for (prop in from) {

            end = parseInt(newbs[prop], 10);
            begin = parseInt(from[prop], 10);

            // Create the array

            ar[i++] = [end > begin, prop, end, begin];
        }

        // Make visible if hidden

        elem.style.visibility = 'visible';

        self.transitions = self.animate(elem, ar, duration, easing);

        // Start the animation

        if (!hAzzle.isRunning) {

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
            len = to.length;

        return function(force) {

            now = pnow();
            timed += now - then;
            then = now;
            tick = hAzzle.easing[ease](timed / duration);

            i = len;

            if (tick < 0.99 && !force) {

                // Note! For now we are setting the styles directly - better performance.
                // I'm going to change this in the future

                while (i--) {

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

        var self = this,
            state = self.originalState,
            elem = self.elem,
            transitions = self.transitions,
            style = elem.style;

        this.originalState = [];

        if (state) {

            style.overflow = state.overflow[0];
            style.overflowX = state.overflow[1];
            style.overflowY = state.overflow[2];
        }

        hAzzle.removePrivate(elem, 'fxDta');

        if (complete && transitions) {

            transitions(true);
        }

        if (callback) {
            callback = this.complete;
        }

        if (!popped) {
            popTween(this, elem, callback, this.completeParams);
        }

    }
};

Percentage.prototype.init.prototype = Percentage.prototype;

// Transform a CSS3 percentage call to a regular animation

function percCSS(obj, to, options) {

    var newTo = {},
        prop, goTo = to.to;

    for (prop in goTo) {
        newTo[prop] = goTo[prop];
    }

    hAzzle.tween(obj, newTo, options);
}

/** 
 * Animation by percentage
 *
 * @param {Object} obj
 * @param {Object} to
 * @param {Object} options
 * @return {hAzzle|Object}
 */

hAzzle.percentage = function(elem, to, options) {

    var fxDta = hAzzle.private(elem, 'fxDta');

    // Stop all running animations

    if (fxDta) {
        fxDta.stop();
    }

    if (!('from' in to) || !('to' in to)) {
        return;
    }

    if (!options) {
        options = {};
    }

    if (!options.mode && (supportTransform && hAzzle.useTransform)) {
        percCSS(elem, to, options);
    } else if (!options.mode) {
        Percentage(elem, to, options);
    }

    if (options.mode === 'transform' && supportTransform) {

        percCSS(elem, to, options);
        return;
    }

    Percentage(elem, to, options);
};