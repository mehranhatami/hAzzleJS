/**
 * Mehran animation engine
 */
var win = this,
    Mehran = hAzzle.Mehran,

    // Deal with foreign domains
    // Accessing .name will throw SecurityError within a foreign domain.

    foreign = win.top.name ? win.top : win,
    perf = foreign.performance,
    perfNow = perf.now || perf.webkitNow || perf.msNow || perf.mozNow,
    now = perfNow ? function () {
        return perfNow.call(perf);
    } : function () {
        return hAzzle.now();
    },
    lastTime = 0,
    polyfill = function (callback) {
        var currTime = new Date().getTime(),
            timeToCall = Math.max(0, 16 - (currTime - lastTime)),
            id = win.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
        lastTime = currTime + timeToCall;
        return id; // return the id for cancellation capabilities
    },

    // Checks for iOS6 will only be done if no native frame support

    ios6 = /iP(ad|hone|od).*OS 6/.test(win.navigator.userAgent),

    // Feature detection

    reqframe = function () {
        // native animation frames
        // http://webstuff.nfshost.com/anim-timing/Overview.html
        // http://dev.chromium.org/developers/design-documents/requestanimationframe-implementation

        return foreign.requestAnimationFrame ||
            // no native rAF support
            (ios6 ? // iOS6 is buggy
                foreign.requestAnimationFrame ||
                foreign.webkitRequestAnimationFrame || // Chrome <= 23, Safari <= 6.1, Blackberry 10
                foreign.mozRequestAnimationFrame ||
                foreign.msRequestAnimationFrame :
                // IE <= 9, Android <= 4.3, very old/rare browsers
                polyfill);
    }(),

    cancelframe = function () {
        return foreign.cancelAnimationFrame ||
            // no native cAF support
            (!ios6 ? foreign.cancelAnimationFrame ||
                foreign.webkitCancelAnimationFrame ||
                foreign.webkitCancelRequestAnimationFrame ||
                foreign.mozCancelAnimationFrame :
                function (id) {
                    clearTimeout(id);
                });
    }();

// Set up Mehran

hAzzle.extend({

    version: '0.0.1a',

    has: {

        // Check for foreign domain       

        'foreign-domain': foreign ? false : true,

        // Detect if the browser supports native rAF

        'native-rAF': (foreign.requestAnimationFrame && (foreign.cancelAnimationFrame ||
            foreign.cancelRequestAnimationFrame)) ? true : false,

        // Detect if performance.now() are supported

        'perfNow': perfNow,
    },

}, Mehran);

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
    return reqframe(rafCallback);
};
// cancelAnimationFrame

hAzzle.cancelFrame = cancelframe;

// Detect if native rAF or not

hAzzle.nativeRAF = Mehran.has['native-rAF'];

// Foreign domain detection

hAzzle.foreignDomain = Mehran.has['foreign-domain'];

// performance.now()

hAzzle.pnow = now;

/* =========================== ANIMATION ENGINE ========================== */

// Mehran.fx

var fx = Mehran.fx = function (elem, options) {
    var self;
    self.elem = elem;
    self.options = options;
};

// Mehran.fx prototype

fx.prototype = {};

// animation function

hAzzle.Core.animate = function (options, duration, callback) {
    this.each(function (el) {
        var fx = new fx(el, options, duration, callback);
    });
};