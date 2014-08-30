// engine.js
var
    rafId,
    run,
    length = 0,
    ua = navigator.userAgent,
    skeleton,
    browser,
    trans,
    run,
    itm,
    accelerate,
    rafId,
    transit = {

        "WebkitTransition": ["webkitTransitionEnd", "-webkit-transition", !!window.chrome && !window.opera || ua.indexOf(' OPR/') >= 0 ? "chrome" : "safari"],
        "MozTransition": ["transitionend", "-moz-transition", "firefox"],
        "MSTransition": ["transitionend", "-ms-transition", "ie"],
        "OTransition": ["otransitionend", "-o-transition", "opera"],
        "transition": ["transitionend", "transition", null],
    },

    supportTransform = transit[hAzzle.cssCore.transition],

    /**
     * Detect who can use CSS transitions
     *
     * true = use CSS3 above all else when available, false = use requestAnimationFrame with Timer fallback
     * combining browsers + mobile devices is not currently supported (i.e. all Android browsers will be passed the "android" parameter)
     * Microsoft added for the future, will fallback to request/timer for now
     */

    canUseTransitions = {
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

if (supportTransform) {

    // Create stylesheet and append the rules

    var pre = supportTransform[1],
        sheet = document.createElement("style");

    sheet.type = "text/css";
    sheet.innerHTML = ".hAzzleFX{" + pre + "-property:none !important;}";

    // Append the sheet do the document head

    document.getElementsByTagName('head')[0].appendChild(sheet);

    // Create a 'skeleton' we need to use with CSS Transform for transitions

    skeleton = pre + "-property:{props};" + pre + "-duration:{duration}s;" + pre + "-timing-function:cubic-bezier({easing});";

    // Detect mobile browser

    browser = !hAzzle.getMobile ? supportTransform[2] : hAzzle.getMobile;

    // Force hardware acceleration in Safari and iOS.

    accelerate = browser === 'safari' || browser === 'ios';

    supportTransform = supportTransform[0];

    setDefaults();
}

hAzzle.extend({

    // Holds all animations

    dictionary: [],

    // Default duration

    defaultDuration: 500,

    // Default easing

    defaultEase: 'linear',

    // Default beizer easing

    defaultBeizer: 'easeNoneLinear',

    // Check if the animation engine are running 

    isRunning: false,

    useTransform: false,

    activated: false,

    length: 0,


    fxHook: {

        opacity: {
            set: function(fx) {
                fx.elem.style['opacity'] = fx.tick;
            },
        },
        _default: {

            get: function(tween) {

                var result;

                if (tween.elem[tween.prop] != null &&
                    (!tween.elem.style || tween.elem.style[tween.prop] == null)) {
                    return tween.elem[tween.prop];
                }

                result = hAzzle.css(tween.elem, tween.prop, "");
                // Empty strings, null, undefined and "auto" are converted to 0.
                return !result || result === "auto" ? 0 : result;
            },
            set: function(tween) {

                hAzzle.style(tween.elem, tween.prop, tween.tick + 'px');
            }
        }
    },

    defaultEasing: 'linear',

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

            if (canUseTransitions.hasOwnProperty(prop)) {

                canUseTransitions[prop] = settings[prop];
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

    stopTween: function(elem, jumpToEnd, callback, popped) {

        if (!fxDta) {
            return;
        }

        if (!fxDta.isCSS) {

            fxDta.stop(jumpToEnd, true, popped);

        } else {

            fxDta.stop(callback);
        }
    },

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


    tween: function(elem, to, settings) {

        var fxDta = hAzzle.private(elem, 'fxDta');

        // Stop all running animations

        if (fxDta) {
            fxDta.stop();
        }

        if (!settings) {
            settings = {};
        }

        if (!settings.mode) {

            if (!supportTransform || !hAzzle.useTransform) {

                new FX(elem, to, settings);

            } else {

                new Transform(elem, to, settings);
            }

        } else if (settings.mode === "timeline" || !supportTransform) {

            new FX(elem, to, settings);

        } else {

            new Transform(elem, to, settings);
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

// Sets the default tween behaviour ('transfor, 'rAF', timer)

function setDefaults() {

    var prop;

    for (prop in canUseTransitions) {

        if (!canUseTransitions.hasOwnProperty(prop)) {
            continue;
        }

        if (prop === browser) {
            hAzzle.useTransform = canUseTransitions[prop];
            break;

        }
    }
}