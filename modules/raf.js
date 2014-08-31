// raf.js

var nRAF, nCAF,
    perf = window.performance,
    lastTime = 0,

    // Checks for iOS6 will only be done if no native frame support

    ios6 = /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent),

    fixTick = false,

    // Performance.now()

    perfNow = perf.now || perf.webkitNow || perf.msNow || perf.mozNow,
    pnow = perfNow ? function() {
        return perfNow.call(perf);
    } : function() {
        return hAzzle.now();
    };

(function() {

    nRAF = function() {
        // native animation frames
        // http://webstuff.nfshost.com/anim-timing/Overview.html
        // http://dev.chromium.org/developers/design-documents/requestanimationframe-implementation

        return top.requestAnimationFrame ||
            // no native rAF support
            (ios6 ? // iOS6 is buggy
                top.requestAnimationFrame ||
                top.webkitRequestAnimationFrame || // Chrome <= 23, Safari <= 6.1, Blackberry 10
                top.mozRequestAnimationFrame ||
                top.msRequestAnimationFrame :
                // IE <= 9, Android <= 4.3, very old/rare browsers
                function(callback) {
                    var currTime = hAzzle.now(),
                        timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                        id = window.setTimeout(function() {
                                callback(currTime + timeToCall);
                            },
                            timeToCall);
                    lastTime = currTime + timeToCall;
                    return id; // return the id for cancellation capabilities
                });
    }();

    nCAF = function() {
        return top.cancelAnimationFrame ||
            // no native cAF support
            (!ios6 ? top.cancelAnimationFrame ||
                top.webkitCancelAnimationFrame ||
                top.webkitCancelRequestAnimationFrame ||
                top.mozCancelAnimationFrame :
                function(id) {
                    clearTimeout(id);
                });
    }();

}());

nRAF(function(timestamp) {
    // feature-detect if rAF and now() are of the same scale (epoch or high-res),
    // if not, we have to do a timestamp fix on each frame
    fixTick = timestamp > 1e12 != pnow() > 1e12;
});

