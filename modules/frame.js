/**
 * frame.js
 */
var win = this,
    perf = win.performance || {},
    top,
    requestFrame,
    cancelFrame,

    // Use the best resolution timer that is currently available

    perfNow = perf && (perf.now || 
	perf.webkitNow || 
	perf.msNow || 
	perf.mozNow || 
	perf.oNow);

/*
if (!win.performance.now){
    
    var nowOffset = Date.now();
 
    if (performance.timing && performance.timing.navigationStart){
      nowOffset = performance.timing.navigationStart
    }
 
 
    win.performance.now = function now(){
      return Date.now() - nowOffset;
    }
 
  }
*/

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
        win.mozRequestAnimationFrame;

    cancelFrame = win.cancelAnimationFrame ||
        win.cancelRequestAnimationFrame ||
        win.webkitCancelAnimationFrame ||
        win.webkitCancelRequestAnimationFrame ||
        win.mozCancelAnimationFrame ||
        win.oCancelAnimationFrame ||
        win.mozCancelRequestAnimationFrame;
}

if (!requestFrame || !cancelFrame) {
    var last = 0,
        id = 0,
        queue = [],
        frameDuration = 1000 / 60;

    requestFrame = function (callback) {
        if (queue.length === 0) {
            var _now = hAzzle.pnow(),
                next = Math.max(0, frameDuration - (_now - last));

            last = next + _now;

            win.setTimeout(function () {
                var cp = queue.slice(0),
                    i = 0,
                    len = cp.length;

                // Clear queue here to prevent
                // callbacks from appending listeners
                // to the current frame's queue

                queue.length = 0;

                for (; i < len; i++) {
                    if (!cp[i].cancelled) {
                        try {
                            cp[i].callback(last);
                        } catch (e) {}
                    }
                }
            }, next);
        }
        queue.push({
            handle: ++id,
            callback: callback,
            cancelled: false
        });
        return id;
    };

    cancelFrame = function (handle) {
        var i = 0,
            len = queue.length;
        for (; i < len; i++) {
            if (queue[i].handle === handle) {
                queue[i].cancelled = true;
                //	clearTimeout(queue[i]); // Need to be tested  !!
            }
        }
    };
}
requestFrame(function(timestamp) {
    // feature-detect if rAF and now() are of the same scale (epoch or high-res),
    // if not, we have to do a timestamp fix on each frame
    hAzzle.fixTs = timestamp > 1e12 !== hAzzle.pnow() > 1e12
  })

// Extend the hAzzle object

hAzzle.extend({
	
	fixTs: false,

    pnow: perfNow ? function () {
        return perfNow.call(perf);
    } : function () {
        var nowOffset;
        if (perf.timing && perf.timing.navigationStart) {
            nowOffset = perf.timing.navigationStart;
        }
        return hAzzle.now() - nowOffset;
    },
    requestFrame: requestFrame,
    cancelFrame: cancelFrame
}, hAzzle);