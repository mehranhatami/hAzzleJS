/*!
 * Touch
 */
var win = this,
    doubleTap = false,

    touchEvents = {
        tap: '',
        doubleTap: '',
        twoFingerTap: '',
        longTouch: '',
        swipeleft: '',
        swiperight: '',
        swipeup: '',
        swipedown: ''
    },

    /**
     * Swipe Events (swE).
     */

    swipeEvents = ['tap', 'doubleTap', 'twoFingerTap', 'longTouch', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown'];

hAzzle.extend({

    TouchOrMicrosoft: function () {
        return "ontouchstart" in win ? { // Webkit
            start: "touchstart",
            move: "touchmove",
            end: "touchend"
        } : navigator.msMaxTouchPoints ? { // MS Pointer
            start: "MSPointerDown",
            move: "MSPointerMove",
            end: "MSPointerUp"
        } : false; // No touch
    },

    /**
     * Check if the browser and / or platform supports touch
     *
     * @return {Object|false}
     */

    supportTouch: function () {
        return typeof hAzzle.TouchOrMicrosoft() === "object" ? true : false;

    },

    /**
     * Activate touch on touch enabled devices
     */

    ActivateTouch: function (set) {

        set = set || {};
        /*
         * Touch settings
         *
         * target - element to use touch functions. Default document
         * delay - timestamp for when the gesture should fire. Default 500.
         */

        var target = set.target || document,
            delay = set.delay || 500;

        // Check if we are dealing with Microsoft or normal touch gestures

        var evts = hAzzle.TouchOrMicrosoft();

        // Stop here if the browser or platform don't support touch gestures


        if (!hAzzle.supportTouch()) return false; //throw new Error('Your browser does not support touch gestures');

        // Create UIEvent objects

        hAzzle.each(swipeEvents, function (evt) {
            touchEvents[evt] = document.createEvent('UIEvents');
            touchEvents[evt].initEvent(evt, true, true);
        });

        // Attach touch handlers to the document

        hAzzle(target).on(evts.start, function (evt) {

            var startTime = hAzzle.now(),
                touch = evt.touches[0],
                nrOfFingers = evt.touches.length,
                startX, startY, hasMoved;

            startX = touch.clientX;
            startY = touch.clientY;
            hasMoved = false;

            hAzzle(target).on(evts.move, onMove, false);
            hAzzle(target).on(evts.end, onEnd, false);

            function onMove(e) {
                hasMoved = true;
                nrOfFingers = e.touches.length;
            }

            function onEnd(e) {
                var endX, endY, diffX, diffY,
                    absDiffX, absDiffY, dirX, dirY,
                    ele = e.target,
                    changed = e.changedTouches[0],
                    customEvent = '',
                    endTime = hAzzle.now(),
                    timeDiff = endTime - startTime;

                if (nrOfFingers === 1) {
                    if (!hasMoved) {
                        if (timeDiff <= 500) {
                            if (doubleTap) ele.dispatchEvent(touchEvents.doubleTap);
                            else {
                                ele.dispatchEvent(touchEvents.tap);
                                doubleTap = true;
                            }

                            // Reset DoubleTap

                            setTimeout(function () {
                                doubleTap = false;
                            }, 400);
                        } else {
                            ele.dispatchEvent(touchEvents.longTouch);
                        }
                    } else {
                        if (timeDiff < delay) {
                            endX = changed.clientX;
                            endY = changed.clientY;
                            diffX = endX - startX;
                            diffY = endY - startY;
                            dirX = diffX > 0 ? 'right' : 'left';
                            dirY = diffY > 0 ? 'down' : 'up';
                            absDiffX = Math.abs(diffX);
                            absDiffY = Math.abs(diffY);

                            if (absDiffX >= absDiffY) customEvent = 'swipe' + dirX;
                            else customEvent = 'swipe' + dirY;

                            ele.dispatchEvent(touchEvents[customEvent]);
                        }
                    }
                } else if (nrOfFingers === 2) ele.dispatchEvent(touchEvents.twoFingerTap);

                hAzzle(target).off(evts.move, onMove, false);

                hAzzle(target).off(target, evts.end, onEnd, false);
            }
        });
    }

}, hAzzle);


hAzzle.extend({


    /**
     * Tap on a elem to fire a action
     *
     * @param {function} fn
     *
     */

    tap: function (fn) {
        return this.on('tap', fn, false);
    },

    /**
     * Double Tap on a elem to fire a action
     *
     * @param {function} fn
     *
     */


    doubleTap: function (fn) {
        return this.on('doubleTap', fn, false);
    },

    /**
     * Use two finger to tap
     *
     * @param {function} fn
     *
     */

    twoFingerTap: function (fn) {
        return this.on('twoFingerTap', fn, false);
    },

    /**
     * Hold a finger on the element to fire an action
     *
     * @param {function} fn
     *
     */

    longTouch: function (fn) {
        return this.on('longTouch', fn, false);
    },

    /**
     * Swipe left
     *
     * @param {function} fn
     *
     */

    swipeLeft: function (fn) {
        return this.on('swipeLeft', fn, false);
    },

    /**
     * Swipe right
     *
     * @param {function} fn
     *
     */

    swipeRight: function (fn) {
        return this.on('swipeRight', fn, false);
    },

    /**
     * Swipe up
     *
     * @param {function} fn
     *
     */

    swipeUp: function (fn) {
        return this.on('swipeUp', fn, false);
    },

    /**
     * Swipe down
     *
     * @param {function} fn
     *
     */

    swipeDown: function (fn) {
        return this.on('swipeDown', fn, false);
    }
});