/**
 * frame.js
 */
var win = this,
    perf = win.performance || {},
    top,
    requestFrame = false,
    cancelFrame = false,

    // Use the best resolution timer that is currently available

    perfNow = perf && (perf.now ||
        perf.webkitNow ||
        perf.msNow ||
        perf.mozNow ||
        perf.oNow);

if (!hAzzle.rafOff) {

    // Test if we are within a foreign domain. Use raf from the top if possible.

    try {

        // Accessing .name will throw SecurityError within a foreign domain.

        win.top.name;
        top = win.top;
    } catch (e) {
        top = win;
    }

    requestFrame = top.requestAnimationFrame;
    cancelFrame = top.cancelAnimationFrame || top.cancelRequestAnimationFrame;

    if (!requestFrame) {
        requestFrame = win.requestAnimationFrame ||
            win.webkitRequestAnimationFrame ||
            win.oRequestAnimationFrame ||
            win.msRequestAnimationFrame ||
            win.mozRequestAnimationFrame || null;

        cancelFrame = win.cancelAnimationFrame ||
            win.cancelRequestAnimationFrame ||
            win.webkitCancelAnimationFrame ||
            win.webkitCancelRequestAnimationFrame ||
            win.mozCancelAnimationFrame ||
            win.oCancelAnimationFrame ||
            win.mozCancelRequestAnimationFrame || null;
    }
}
// This is when we expect a fall-back to setTimeout as it's much more fluid

if (!requestFrame) {
    var _aq = [],
        _process = [],
        _irid = 0,
        _iid;

    requestFrame = function (callback) {

        _aq.push([++_irid, callback]);

        if (!_iid) {
            _iid = win.setInterval(function () {
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
                    win.clearInterval(_iid);
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

        var i, j;

        for (i = 0, j = _aq.length; i < j; i += 1) {
            if (_aq[i][0] === rid) {
                _aq.splice(i, 1);
                return;
            }
        }
        for (i = 0, j = _process.length; i < j; i += 1) {
            if (_process[i][0] === rid) {
                _process.splice(i, 1);
                return;
            }
        }
    };
}


// Extend the hAzzle object

hAzzle.extend({

    // Windows performance now
    // with fallback to normal timer

    pnow: perfNow ? function () {
        return perfNow.call(perf);
    } : function () {
        var nowOffset;
        if (perf.timing && perf.timing.navigationStart) {
            nowOffset = perf.timing.navigationStart;
        }
        return hAzzle.now() - nowOffset;
    },

    // RequestAnimationFrame

    requestFrame: requestFrame,

    // CancelAnimationFrame

    cancelFrame: cancelFrame

}, hAzzle);