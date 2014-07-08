/**
 * Mehran animation engine
 */
var win = this,
    Mehran = hAzzle.Mehran,
    perf = top.performance,
    perfNow = perf && (perf.now || perf.webkitNow || perf.msNow || perf.mozNow),
    now = perfNow ? function () {
        return perfNow.call(perf);
    } : function () {
        return +new Date();
    },
    fixTick = false,

    frame = function () {
        // native animation frames
        // http://webstuff.nfshost.com/anim-timing/Overview.html
        // http://dev.chromium.org/developers/design-documents/requestanimationframe-implementation
        return win.requestAnimationFrame ||
            win.webkitRequestAnimationFrame ||
            win.mozRequestAnimationFrame ||
            win.msRequestAnimationFrame ||
            win.oRequestAnimationFrame ||
            function (callback) {
                win.setTimeout(function () {
                    callback(+new Date());
                }, 17);
            };
    }(),

    cancel = function () {
        return top.cancelAnimationFrame ||
            win.webkitCancelAnimationFrame ||
            win.webkitCancelRequestAnimationFrame ||
            win.mozCancelAnimationFrame ||
            win.oCancelAnimationFrame ||
            function (id) {
                clearTimeout(id);
            };
    }();


// Bug detection

frame(function (timestamp) {
    // feature-detect if rAF and now() are of the same scale (epoch or high-res),
    // if not, we have to do a timestamp fix on each frame
    fixTick = timestamp > 1e12 != hAzzle.now() > 1e12;
});

// Set up Mehran

hAzzle.extend({

    version: '0.0.1a',

    has: {

        // Check for foreign domain       

        'foreign-domain': (win.top === win.self) ? false : true,

        // Detect if the browser supports native rAF

        'native-rAF': (top.requestAnimationFrame && (top.cancelAnimationFrame ||
            top.cancelRequestAnimationFrame)) ? true : false,

        // Detect if Performance now are supported

        'perfNow': perfNow,
    },

    // Feature detection

    requestAnimationFrame: frame,

    cancelAnimationFrame: cancel,

    // Expose performance.now to the globale hAzzle Object

    pnow: now

}, Mehran);


/* =========================== GLOBAL FUNCTIONS ========================== */

// performance.now()

hAzzle.pnow = Mehran.pnow;

// requestAnimationFrame

hAzzle.requestFrame = function (callback) {
    var rafCallback = (function (callback) {
        return function (tick) {
            if (fixTick) {
                tick = Mehran.pnow();
            }
            callback(tick);
        };
    })(callback);

    // Need return value her, so we get the frame ID 
    // in return

    return Mehran.requestAnimationFrame.call(rafCallback);
};

// cancelAnimationFrame

hAzzle.cancelFrame = Mehran.cancelAnimationFrame;

// Detect if native rAF or not

hAzzle.nativeRAF = Mehran.has['native-rAF'];

// Foreign domain detection

hAzzle.foreignDomain = Mehran.has['foreign-domain'];