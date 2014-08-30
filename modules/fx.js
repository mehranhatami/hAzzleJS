// engine.js
var
    rafId, pre, run, length = 0,
    ua = navigator.userAgent,
    skeleton, browser, trans, run, itm,
    transitionend, rafId,

    // Detect platform support for transitions

    detectPlatform = {

        'WebkitTransition': !!window.chrome && !window.opera || ua.indexOf(' OPR/') >= 0 ? 'chrome' : 'safari',

        'MozTransition': 'firefox',

        'MSTransition': 'ie',

        'OTransition': 'opera',

        'transition': null
    },

    platformTransitions = detectPlatform[hAzzle.cssCore.transition]

/**
 * Detect who can use CSS transitions
 *
 * true = use CSS3 above all else when available, false = use requestAnimationFrame with Timer fallback
 * combining browsers + mobile devices is not currently supported (i.e. all Android browsers will be passed the 'android' parameter)
 * Microsoft added for the future, will fallback to request/timer for now
 */

var isTransform = {
    ios: false,
    android: false,
    winMobile: false,
    firefox: false,
    chrome: false,
    safari: false,
    opera: false,
    ie: false
};

// if CSS transitions are supported

if ((pre = hAzzle.cssCore.transition)) {

    // Create stylesheet and append the rules

    var sheet = document.createElement('style');

    // Create a CSS stylesheet with this rule:
    // .hAzzleFX{transition-property:none !important;}

    sheet.type = 'text/css';
    sheet.innerHTML = '.hAzzleFX{' + pre + '-property:none !important;}';

    // Append the sheet do the document head

    document.head.appendChild(sheet);

    // Create a 'skeleton' we need to use with CSS Transform for transitions
    // It's dummy values will be replaces later on

    skeleton = pre + '-property:{props};' + pre + '-duration:{duration}s;' + pre + '-timing-function:cubic-bezier({easing});';

    // Detect mobile browser

    browser = !hAzzle.getMobile ? platformTransitions /*null*/ : hAzzle.getMobile;

    // Mobile devices have hardware acceleration removed at the end of the animation in order to 
    // avoid hogging the GPU's memory.
    // As a workaround, we force hardware acceleration in Safari and iOS.

    hAzzle.accelerate = browser === 'safari' || browser === 'ios';

    transitionend = pre + 'end';

    setDefaults();
}

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
                    (!elem.style || elem.style[prop] == null)) {

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

    // Overrride default engine

    setEngines: function(settings) {

        var prop;

        for (prop in settings) {

            if (isTransform.hasOwnProperty(prop)) {

                isTransform[prop] = settings[prop];
            }
        }

        setDefaults();
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

    var leg = length;

    while (leg--) {

        itm = hAzzle.dictionary[leg];

        if (!itm) break;
        if (itm.isCSS) continue;

        if (itm && !itm.cycle()) {

            itm.stop(false, itm.complete, false, true);

        } else {
            hAzzle.activated = true;

        }
    }

    if (hAzzle.activated) {

        rafId = nRAF(ticker);

    } else {

        nCAF(rafId);
        itm = trans = null;
    }

    hAzzle.isRunning = run;
}

// Sets the default animation behaviour ('transform, 'rAF', timer)

function setDefaults() {

    var prop;

    for (prop in isTransform) {


        if (prop === browser) {
            hAzzle.useTransform = isTransform[prop];
            break;

        }
    }
}