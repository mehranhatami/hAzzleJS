/**
 * rAF and cAF
 */
var win = this,
    foreign,
    vendors = ['webkit', 'moz', 'ms', 'o'],
    i = 0,
    len = vendors.length,
    nRAF,
    nCAF;

// Test if we are within a foreign domain. Use raf from the top if possible.
try {
    // Accessing .name will throw SecurityError within a foreign domain.
    window.top.name;
    foreign = window.top;
} catch (e) {
    foreign = window;
}

var perf = window.performance,
    perfNow = perf.now || perf.webkitNow || perf.msNow || perf.mozNow,
    now = perfNow ? function () {
        return perfNow.call(perf);
    } : function () {
        return hAzzle.now();
    },
    lastTime = 0;

// Grab the native implementation.

nRAF = top.requestAnimationFrame;
nCAF = top.cancelAnimationFrame || top.cancelRequestAnimationFrame;

// Feature detection
// if native rAF and cAF fails, fallback to a vendor
// prefixed one	

for (; i < len && !nRAF; i++) {
    nRAF = top[vendors[i] + 'RequestAnimationFrame'];
    nCAF = top[vendors[i] + 'CancelAnimationFrame'] ||
        top[vendors[i] + 'CancelRequestAnimationFrame'];
}

// Polyfill (IE9)

if (!nRAF && !nCAF) {

    // RequestAnimationFrame

    nRAF = function (callback) {
        var currTime = new Date().getTime(),
            timeToCall = Math.max(0, 16 - (currTime - lastTime)),
            id = win.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
        lastTime = currTime + timeToCall;
        return id; // return the id for cancellation capabilities
    };

    // CancelAnimationFrame

    nCAF = function (id) {
        clearTimeout(id);
    };
}

// Overwrite default window.rAF and window.cAF

win.requestAnimationFrame = nRAF;
win.cancelAnimationFrame = nCAF;

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

hAzzle.requestFrame = function (callback) {

    var rafCallback = (function (callback) {
        // Wrap the given callback to pass in performance timestamp   
        return function (tick) {
            // feature-detect if rAF and now() are of the same scale (epoch or high-res),
            // if not, we have to do a timestamp fix on each frame
            if (tick > 1e12 != hAzzle.now() > 1e12) {
                tick = now();
            }
            callback(tick);
        };
    })(callback);

    // Call original rAF with wrapped callback

    return win.requestAnimationFrame(rafCallback);
};

// Expose to the globale hAzzle Object

hAzzle.rAF = rAF;
// Detect if native rAF or not

hAzzle.nativeRAF = rAF.has['native-rAF'];

// Foreign domain detection

hAzzle.foreignDomain = rAF.has['foreign-domain'];

// performance.now()

hAzzle.pnow = now;