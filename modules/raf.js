/**
 * RAF
 *
 *
 * Contains:
 *
 * - hAzzle.requestFrame
 *
 * - hAzzle.cancelFrame
 *
 * - hAzzle.pnow
 *
 * - hAzzle.fixTick
 *
 */
var top = window.top.name ? window.top : window,
    requestFrame = top.requestAnimationFrame,
    cancelFrame = top.cancelAnimationFrame || top.cancelRequestAnimationFrame,
    perf = top.performance && top.performance.now ? top.performance : {},
    fixTick,

    // Use the best resolution timer that is currently available

    perfNow = perf && (perf.now ||
        perf.webkitNow ||
        perf.msNow ||
        perf.mozNow ||
        perf.oNow);


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
}

if (requestFrame) {

    // Expose performance.now to the globale hAzzle Object

    hAzzle.pnow = perfNow ? function () {
        return perfNow.call(perf);
    } : function () {
        var nowOffset;
        if (perf.timing && perf.timing.navigationStart) {
            nowOffset = perf.timing.navigationStart;
        }
        return hAzzle.now() - nowOffset;
    };

    requestFrame(function (tick) {

        fixTick = hAzzle.fixTick = tick > 1e12 != perf > 1e12;
    });

}

/* =========================== FALLBACK FOR IE 9 ========================== */

if (!requestFrame) {

    var _aq = [],
        _process = [],
        _irid = 0,
        _iid;

    requestFrame = function (callback) {

        _aq.push([++_irid, callback]);

        if (!_iid) {
            _iid = window.setInterval(function () {
                if (_aq.length) {
                    var time = hAzzle.pnow(),
                        temp = _process;
                    _process = _aq;
                    _aq = temp;

                    while (_process.length) {

                        _process.shift()[1](time);
                    }

                } else {
                    // don't continue the interval, if unnecessary
                    window.clearInterval(_iid);
                    _iid = undefined;
                } // Estimating support for 60 frames per second
            }, 1000 / 60);
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

// Throw the last function to the globale hAzzle Object

hAzzle.requestFrame = requestFrame;
hAzzle.cancelFrame = cancelFrame;