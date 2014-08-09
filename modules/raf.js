/**
 * rAF and cAF
 */
var foreign, nRAF, nCAF,
    perf = window.performance,
    lastTime = 0;

// Test if we are within a foreign domain. Use raf from the top if possible.
try {
    // Accessing .name will throw SecurityError within a foreign domain.
    foreign = window.top;
} catch (e) {
    foreign = window;
}

// Performance.now()

var perfNow = perf.now || perf.webkitNow || perf.msNow || perf.mozNow,
    now = perfNow ? function() {
        return perfNow.call(perf);
    } : function() {
        return hAzzle.now();
    };

// Grab the native implementation.

nRAF = foreign.requestAnimationFrame;
nCAF = foreign.cancelAnimationFrame || foreign.cancelRequestAnimationFrame;

// if native rAF and cAF fails, fallback to a vendor
// prefixed one	, or the polyfill ( IE9)

if (!nRAF && !nCAF) {

    // RequestAnimationFrame

    nRAF =
        foreign.webkitRequestAnimationFrame ||
        foreign.mozRequestAnimationFrame ||
        foreign.oRequestAnimationFrame ||
        foreign.msRequestAnimationFrame ||
        function(callback) {
            var currTime = hAzzle.now(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                id = window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
            lastTime = currTime + timeToCall;
            return id; // return the id for cancellation capabilities
        };

    // CancelAnimationFrame
    nCAF =
        foreign.webkitCancelAnimationFrame ||
        foreign.webkitCancelRequestAnimationFrame ||
        foreign.mozCancelAnimationFrame ||
        foreign.oCancelAnimationFrame ||
        foreign.msCancelAnimationFrame ||
        function(id) {
            clearTimeout(id);
        };
}

// rAF Core settings

var rAF = {

    version: '0.0.2b',

    has: {

        // Check for foreign domain       

        'foreign-domain': foreign ? false : true,

        // Detect if the browser supports native rAF, because there are
        // issues with iOS6, so check if the native rAF and cAF works
        // http://shitwebkitdoes.tumblr.com/post/47186945856/native-requestanimationframe-broken-on-ios-6

        'native-rAF': (foreign.requestAnimationFrame && (foreign.cancelAnimationFrame ||
            foreign.cancelRequestAnimationFrame)) ? true : false,

        // Detect if performance.now() are supported

        'perfNow': perfNow,
    },
};

/* =========================== GLOBAL FUNCTIONS ========================== */

// requestAnimationFrame
// prop: Mehran Hatami

hAzzle.extend({

    requestFrame: function(callback) {

        var rafCallback = (function(callback) {
            // Wrap the given callback to pass in performance timestamp   
            return function(tick) {
                // feature-detect if rAF and now() are of the same scale (epoch or high-res),
                // if not, we have to do a timestamp fix on each frame
                if (tick > 1e12 != hAzzle.now() > 1e12) {
                    tick = now();
                }
                callback(tick);
            };
        })(callback);

        // Call original rAF with wrapped callback

        return nRAF(rafCallback);
    },

    cancelFrame: function() {

        nCAF.apply(window, arguments);
    },

    // performance.now()

    pnow: now


}, hAzzle);


// Detect if native rAF or not

hAzzle.nativeRAF = rAF.has['native-rAF'];

// Foreign domain detection

hAzzle.foreignDomain = rAF.has['foreign-domain'];