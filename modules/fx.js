// engine.js
var rafId, run, length = 0,
    browser = hAzzle.getMobile,
    trans, run,
    rafId,
    transitionend = hAzzle.cssCore.transition + 'end';

hAzzle.extend({

    // Holds all animations

    dictionary: [],

    // Default duration

    defaultDuration: 500,

    // Default easing

    defaultEasing: 'linear',

    // Default beizer easing

    defaultBeizer: 'easeNoneLinear',

    // Check if the animation engine are running 

    isRunning: false,

    useTransform: false,

    activated: false,

    length: 0,

    /**
     * fxHooks similar to cssHooks, but optimized for
     * animation
     */

    fxHook: {

        opacity: {
            set: function(elem, prop, value) {

                elem.style[prop] = value;
            },
        },
        _default: {

            get: function(elem, prop) {

                var result;

                if (!elem[prop] &&
                    (!elem.style || elem.style[prop] === null)) {

                    return elem[prop];
                }

                result = hAzzle.css(elem, prop, '');

                // Empty strings, null, undefined and 'auto' are converted to 0.

                return !result || result === 'auto' ? 0 : result;
            },

            set: function(elem, prop, value, unit) {

                unit = unit || 'px';

                hAzzle.style(elem, prop, value + unit);
            }
        }
    },

    // Support for jQuery's named durations.

    speeds: {
        slow: 600,
        fast: 200,
        // Default speed
        _default: 400
    },

    /** 
     * Stop running animation
     *
     * @param {Object} elem
     * @param {Function} complete
     * @param {Object} callback
     * @return {hAzzle|Object}
     */

    stop: function(elem, jumpToEnd, callback, popped) {

        var fxDta = hAzzle.private(elem, 'fxDta');

        if (!fxDta) {
            return;
        }

        if (!fxDta.isCSS) {

            fxDta.stop(jumpToEnd, true, popped);

        } else {

            fxDta.stop(callback);
        }
    },

    // Stop all running animations

    stopAll: function(complete) {

        nCAF(ticker);

        var i = hAzzle.dictionary.length,
            fxDta;

        length = 0;

        while (i--) {

            fxDta = hAzzle.dictionary[i];

            if (fxDta.isCSS) {

                fxDta.stop(false, true);

            } else {

                fxDta.stop(complete, false, true, true);
            }
        }

        hAzzle.dictionary = [];
        hAzzle.isRunning = false;
        fxDta = trans = null;
    },

    fx: function(elem, to, settings) {

        var fxDta = hAzzle.private(elem, 'fxDta');

        // Stop all running animations

        if (fxDta) {
            fxDta.stop();
        }

        if (!settings) {
            settings = {};
        }

        if (!settings.mode) {

            if (!transitionend || !hAzzle.useTransform) {

                Tween(elem, to, settings);

            } else {

                Transform(elem, to, settings);
            }

        } else if (settings.mode === 'timeline' || !transitionend) {

            Tween(elem, to, settings);

        } else {

            Transform(elem, to, settings);
        }
    }

}, hAzzle);


// The damn ticker

function ticker() {

    var leg = length,
        fxDta;

    while (leg--) {

        fxDta = hAzzle.dictionary[leg];

        if (!fxDta) {

            break;
        }

        if (fxDta.isCSS) {

            continue;

        }

        if (fxDta && !fxDta.cycle()) {

            fxDta.stop(false, fxDta.complete, false, true);

        } else {

            hAzzle.activated = true;

        }
    }

    if (hAzzle.activated) {

        rafId = nRAF(ticker);

    } else {

        nCAF(rafId);
        fxDta = trans = null;
    }

    hAzzle.isRunning = run;
}