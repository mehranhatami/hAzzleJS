/**
 * RAF
 *
 * - hAzzle.requestFrame
 *
 * - hAzzle.cancelFrame
 *
 * - hAzzle.pnow
 *
 * - hAzzle.fixTick
 *
 * - hAzzle.nativeRAF = native
 *
 */
var win = this,

    // Deal with foreign domains

    top = win.top.name ? win.top : win,

    requestFrame = top.requestAnimationFrame,
    cancelFrame = top.cancelAnimationFrame || top.cancelRequestAnimationFrame,
    perf = top.performance && top.performance.now ? top.performance : {},
    native = true,
    fixTick = false,

    // Use the best resolution timer that is currently available

    perfNow = perf && (perf.now || perf.webkitNow || perf.msNow || perf.mozNow || perf.oNow);

// If no native RequestAnimationFrame, grab a vendor prefixed one

if (!requestFrame) {

    requestFrame = top.mozRequestAnimationFrame ||
        top.oRequestAnimationFrame ||
        top.msRequestAnimationFrame ||
        null;

    cancelFrame = top.webkitCancelAnimationFrame ||
        top.webkitCancelRequestAnimationFrame ||
        top.mozCancelAnimationFrame ||
        top.oCancelAnimationFrame ||
        top.mozCancelRequestAnimationFrame ||
        null;

    // Vendor prefixed rAF, so set to false

    native = false;
}

if (requestFrame) {

    requestFrame(function (tick) {

        // feature-detect if rAF and now() are of the same scale (epoch or high-res),
        // if not, we have to do a timestamp fix on each frame		

        fixTick = hAzzle.fixTick = tick > 1e12 != perf > 1e12;
    });

}


// Expose performance.now to the globale hAzzle Object

hAzzle.pnow = perfNow ? function () {
    return perfNow.call(perf);
} : function () {

    // polyfill for IE 9 and browsers who don't
    // support performance.now

    var nowOffset;
    if (perf.timing && perf.timing.navigationStart) {
        nowOffset = perf.timing.navigationStart;
    }
    return hAzzle.now() - nowOffset;
};

/* =========================== FALLBACK FOR IE 9 ========================== */

if (!requestFrame) {

    // No rAF, so set to false

    native = false;

    var _aq = [],
        _process = [],
        _irid = 0,
        _iid;

    requestFrame = function (callback) {

        _aq.push([++_irid, callback]);

        if (!_iid) {
            _iid = win.setInterval(function () {
                if (_aq.length) {

                    // Use performance.now polyfill

                    var time = hAzzle.pnow(),
                        temp = _process;
                    _process = _aq;
                    _aq = temp;

                    while (_process.length) {

                        _process.shift()[1](time);
                    }

                } else {
                    // don't continue the interval, if unnecessary
                    win.clearInterval(_iid);
                    _iid = undefined;
                } // Estimating support for 50 frames per second
            }, 1000 / 50);
        }

        return _irid;
    };

    /**
     * Find the request ID and remove it
     */

    cancelFrame = function (rid) {

        var i,
            x = _aq.length,
            y = _process.length;

        for (; i < x; i += 1) {
            if (_aq[i][0] === rid) {
                _aq.splice(i, 1);
                return;
            }
        }
        for (; i < y; i += 1) {
            if (_process[i][0] === rid) {
                _process.splice(i, 1);
                return;
            }
        }
    };
}

// Throw the last of the functions
// to the globale hAzzle Object

hAzzle.requestFrame = requestFrame;
hAzzle.cancelFrame = cancelFrame;

/**
 * Boolean true/false if we support
 * native rAF or not. Used to
 * avoid iOS6 bugs e.g.
 *
 */

hAzzle.nativeRAF = native;