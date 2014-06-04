/**
 * hAzzle CSS animation engine ( hCAE )
 *
 * SUPORTS:
 * --------
 *
 *  CSS transform:
 *  
 * - rotate
 * - scale
 * - skew
 * - skewX
 * - skewY  
 * - translate
 * - translateX
 * - translateY
 *
 *
 *
 */
var cached = [],

    // Only check for vendor prefix upon page refresh

    transform = hAzzle.cssProperties().transform,
    keys = Object.keys,
    rotate = /rotate\(((?:[+\-]=)?([\-\d\.]+))deg\)/,
    scale = /scale\(((?:[+\-]=)?([\d\.]+))\)/,
    skew = /skew\(((?:[+\-]=)?([\-\d\.]+))deg, ?((?:[+\-]=)?([\-\d\.]+))deg\)/,
    translate = /translate\(((?:[+\-]=)?([\-\d\.]+))px, ?((?:[+\-]=)?([\-\d\.]+))px\)/;

//    doc = win.document;


// If a +=/-= token was provided, we're doing a relative animation	
function by(val, start, m, r, i) {
    return (m = /^([+\-])=([\d\.]+)/.exec(val)) ?
        (i = parseInt(m[2], 10)) && (r = (start + i)) && m[1] == '+' ?
        r : start - i :
        parseInt(val, 10);
}



function parseTransform(el, style) {
    var values = {},
        m;

    if (m = style.match(rotate)) {
        values.to = by(m[1], null);
        values.stepping = createStepping(el, '', 'rotate');
    }

    if (m = style.match(scale)) {

        values.to = by(m[1], null);
        values.stepping = createStepping(el, '', 'scale');
    }
    if (m = style.match(skew)) {

        values.to = {
            x: by(m[1], null),
            y: by(m[3], null)
        };

        values.stepping = createStepping(el, '', 'skew');
    }

    if (m = style.match(translate)) {

        values.to = {
            x: by(m[1], null),
            y: by(m[3], null)
        };
        values.stepping = createStepping(el, '', 'translate');
    }
	
    return values;
}


/**
 * Create animation stepping
 *
 * @param {Object} el
 * @param {String} property
 * @param {String} cat
 * @return {Function}
 *
 */

function createStepping(el, property, cat) {

    return function (val) {

        var style = el.style,

            /**
             * Note! If we are not caching this, we
             * get performance loss because the same
             * request will be requested for each 'tick'.
             *
             * Multiple elements will be created multiple
             * times e.g.
             *
             */

            prop = cached[property] ?
            cached[property] :
            cached[property] = property === '' ?
            transform :
            hAzzle.camelize(property),
            display;

        if (cat === 'rotate') {
            style[prop] = 'rotate(' + val + 'deg)';
        } else if (cat === 'scale') {
            style[prop] = 'scale(' + val + ')';
        } else if (cat === 'skew') {


            if (val.y === 0) {

              style[prop] = 'skewX(' + val.x + 'deg)';
			  
            } else if (val.x === 0) {

                style[prop] = 'skewY(' + val.y + 'deg)';

            } else {

                style[prop] = 'skew(' + val.x + 'deg,' + val.y + 'deg)';
            }


        } else if (cat === 'translate') {

            if (val.y === 0) {

            style[prop] = 'translateX(' + val.x + 'px)';

            } else if (val.x === 0) {

                style[prop] = 'translateY(' + val.y + 'px)';

            } else {

                style[prop] = 'translate(' + val.x + 'px,' + val.y + 'px)';
            }
        } else 
		
		
		

        /**
         * Special threatment for when we are hiding an element.
         * We need to save current state, and hide the
         * element after the animation.
         *
         * Mostly used for 'opacity'
         *
         */

        if (cat === "hide") {

            /**
             * Note!  We only save display state on the start of
             * the 'stepping' - when the 'val' === 1.
             */

            if (val === 1) {

                display = hAzzle.getStyle(el, 'display');

                if (display === 'none' && !hAzzle.data(el, 'fxshow')) {
                    hAzzle.data(el, 'fxshow', display);
                }
            }
            // Do the animation

            style[prop] = val;

            // Hide the element when the counter reach 0

            if (val === 0) {

                style.display = 'none';
            }
            /**
             * Special threatment for when we are showing an element.
             * We need to get the current state, and show the
             * element before the animation.
             *
             * The element can have been hidden by an previous
             * animation, or with CSS stylesheet
             *
             * Mostly used for 'opacity'
             *
             */

        } else if (cat === "show") {

            display = style.display;

            /**
             * Note!  We have to have this 'block' check here, else
             * everything will run for every step count
             */

            if (display !== 'block') {

                if (!hAzzle.data(el, "fxshow") && display === "none") {
                    display = style.display = "";
                }

                // Set elements which have been overridden with display: none
                // in a stylesheet to whatever the default browser style is
                // for such an element

                if (display === "" || hAzzle.getStyle(el, "display") === "none") {
                    hAzzle.data(el, "fxshow", defaultDisplay(el.nodeName));
                }

                // Make the element visible

                if (display === "" || display === "none") {
                    style.display = hAzzle.data(el, "fxshow") || "";
                }
            }
            // Do the animation

            el.style[prop] = val;

            /**
             * Regular animation without any special threatments
             */

        } else {

            /**
             * Don't use 'px' on certain CSS styles
             */
            if (!hAzzle.unitless[property]) {

                val += 'px';
            }

            style[prop] = val;
        }
    };
}


/**
 * Clean up after the animation
 *
 * @param{Object} el
 * @param{Object} restore
 *
 * @return {hAzzle}
 *
 */


function cleanUp(el, restore) {

    return (function () {

        var style = el.style;

        if (restore.display) {

            // Reset the overflow

            if (restore.overflow !== null) {
                style.overflow = restore.overflow[0];
                style.overflowX = restore.overflow[1];
                style.overflowY = restore.overflow[2];
            }

            // Hide the element if the "hide" operation was done

            if (restore.hide) {

                style.display = "none";
            }
        }

        return false;

    });
}

hAzzle.extend({

    /**
     * Animate CSS nodes
     *
     * @param {Object} options
     * @return {hAzzle}
     */

    animate: function (opt, value, cb) {

        var iter = opt,
            v,
            tmp,
            ae,
            m,
            style,
            from = [],
            to = [],
            step = [],
            restore = {},
            display,
            checkDisplay,
            duration,
            callback,
            easing,
            anim;

        if (typeof opt === 'string') {
            iter = {};
            iter[opt] = value;
        }

        /*
           Example:

           hAzzle('#node').animate( {}, speed);
		*/

        if (typeof value !== "undefined") {

            duration = value;
        }

        if (value && typeof cb === "function") {

            callback = cb;
        }

        function fn(el) {

            // Never do animation on hidden CSS nodes

            style = el.style;

            // Start hACE

            anim = new hAzzle.hACE();

            // Allways zero out 'restore' for each iteration

            restore = {};

            // Save it on the node

            hAzzle.data(el, "anim", anim);

            // Duration

            if (iter.duration) {
                duration = iter.duration;
                delete iter.duration;
            }

            // Easing

            if (iter.easing) {
                easing = hAzzle.easing[iter.easing];
                delete iter.easing;
            }

            // Callback

            if (iter.callback) {
                callback = iter.callback;
                delete iter.callback;
            }

            if (el.nodeType === 1 && ('height' in iter || 'width' in iter)) {

                // Record all 3 overflow attributes because IE9-10 do not
                // change the overflow attribute when overflowX and
                // overflowY are set to the same value

                restore.overflow = [style.overflow, style.overflowX, style.overflowY];

                // Backup 'display' so we can restore it back to normal later on

                restore.display = display = hAzzle.getStyle(el, 'display');

                // Test default display if display is currently "none"

                checkDisplay = display === 'none' ?
                    hAzzle.data(el, 'fxshow') || defaultDisplay(el.nodeName) : display;

                if (checkDisplay === 'inline' && hAzzle.getStyle(el, 'float') === 'none') {
                    style.display = 'inline-block';
                }
            }

            // Fix the overflow property

            if (restore.overflow) {
                style.overflow = 'hidden';
            }

            // Iterate through the 'iter' object. I'm using
            // Object keys for this

            ae = keys(iter);

            for (var i = 0; i < ae.length; i++) {


                /**
                 * Special effects
                 *
                 * Note!! This is just temporary. A lot of things
                 * will be changed here.
                 */

                if (iter[ae[i]] === "hide") {
                    from[i] = 1;
                    to[i] = 0;
                    step[i] = createStepping(el, ae[i], 'hide');
                } else if (iter[ae[i]] === "show") {
                    to[i] = 1;
                    from[i] = 0;
                    step[i] = createStepping(el, ae[i], 'show');

                } else { // Normal animation and CSS Transform


                    // So, now we had a little fun, let us do the real magic...

                    v = hAzzle.getStyle(el, ae[i]);
                    tmp = iter[ae[i]];

                    /**
                     * CSS Transformation
                     */

                    if (ae[i] === 'transform') {

                        var pt = parseTransform(el, tmp);

                        /**
                         * Note!
                         *
                         * All transform properties start with 0,
                         * Nothing we can do with it. Or ??
                         *
                         */

                        step[i] = pt.stepping;
                        to[i] = pt.to;

                    } else {

                        from[i] = parseFloat(v);

                        to[i] = by(tmp, parseFloat(v));


                        step[i] = createStepping(el, ae[i]);
                    }

                }
            }

            // Here starts the fun ........... NOT AT ALL !!!	

            if (!ae.length) {

                anim.from(from[0])
                    .to(to[0])
                    .ease(easing)
                    .duration(duration)
                    .step(step[0])
                    .complete(callback)
                    .end(cleanUp(el, restore))
                    .start();

            } else {

                for (var b = 0; b < step.length; b++) {

                    // The first animation in the set - no queue

                    if (b === 0) {

                        anim.from(from[b])
                            .to(to[b])
                            .ease(easing)
                            .duration(duration)
                            .step(step[b])
                            .start();

                        if (b === step.length - 1) {

                            anim.complete(callback); // Only run 'callback' once

                            // Restore current element after animation

                            anim.end(cleanUp(el, restore));

                        }

                        // Series of animation on the same CSS node, 
                        // So we need to queue

                    } else {

                        anim.queue()
                            .from(from[b])
                            .to(to[b])
                            .ease(easing)
                            .duration(duration)
                            .step(step[b])
                            .start();

                        if (b === step.length - 1) {

                            anim.complete(callback); // Only run 'callback' once

                            // Restore current element after animation

                            anim.end(cleanUp(el, restore));

                        }
                    }
                }
            }
        }



        // Return the function

        return this.each(fn);

    },

    stop: function () {
        hAzzle.data(this[0], "anim").stop();
    },

    pause: function () {
        hAzzle.data(this[0], "anim").pause();
    },

    resume: function () {
        hAzzle.data(this[0], "anim").resume();
    },

    rewind: function (count) {
        hAzzle.data(this[0], "anim").rewind(count);
    },

    forward: function (count) {
        hAzzle.data(this[0], "anim").forward(count);
    },

    /**
     * FadeIn an element
     *
     * @param{Number} speed
     * @param{Fumction} callback
     * @param{String} easing
     * @return {hAzzle}
     *
     */

    fadeIn: function (speed, callback, easing) {
        return hAzzle.getStyle(this[0], 'display') === 'none' ?
            this.animate({
                opacity: 'show',
                duration: speed,
                callback: callback,
                easing: easing
            }) : this;
    },

    /**
     * FadeOut an element
     *
     * @param{Number} speed
     * @param{Fumction} callback
     * @param{String} easing
     * @return {hAzzle}
     *
     */

    fadeOut: function (speed, callback, easing) {
        return hAzzle.getStyle(this[0], 'display') === 'block' ?
            this.animate({
                opacity: 'hide',
                duration: speed,
                callback: callback,
                easing: easing
            }) : this;
    }
});