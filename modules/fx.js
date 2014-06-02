/**
 * hAzzle CSS animation engine ( hCAE )
 *
 * NOTE!!
 *
 * hCAE are only using some of the functions
 * that exist in hAzzle Animation Core engine ( hACE ).
 * 
 * Therefor, it is recomended only to use hCAE for
 * 'normal' CSS animations and effects
 * such as fadeIn and fadeOut.
 *
 * If you want to perform more powerfull
 * animation, hACE are what you need to use.
 *
 * Some of the features supported in hACE
 * and not in hCAE, are:
 *
 * - Chainable animation with different
 *   easing, callbacks on each animation
 *   in the queue
 *
 * - reverse of all or selected animations
 *   in the queue
 *
 * - repetation of all or selected animations
 *   in the queue
 *
 */
 
var win = this,
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

/**
 * Create animation stepping
 *
 * @param {Object} el
 * @param {String} property
 * @param {Function}
 *
 */

function createStepping(el, property, partOne, partTwo, partThree, partFour) {

    return function (val) {

        var style = el.style,
            prop = hAzzle.camelize(property),
            display;

        /**
         * Used for Transform rotate
         *
         * Example:
         *
         * rotate(30deg)
         *
         */

        if (partOne && partTwo && !partThree) {

            style[prop] = partOne + val + partTwo;

            /**
             * Used for Transform skew and translate
             *
             * Examples:
             *
             * skew(30deg, 90deg)
             *
             * translate(-10px, 0px)
             *
             * FIX ME!!!
             *
             * Need to do some changes in hACE, so we get
             * returned two different 'val' values for
             * x and y coordinates
             *
             * Also need to fix it so we can do relative animation
             * on the values itself
             *
             */

        } else if (partThree && partFour) {

            style[prop] = partOne + val + partTwo + partThree + val + partFour;

            /**
             * 'Normal' CSS animation without extra parts
             */

        } else {

            /**
             * Special threatment for when we are hiding an element.
             * We need to save current state, and hide the
             * element after the animation.
             *
             * Mostly used for 'opacity'
             *
             */

            if (partOne === "hide") {

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

            } else if (partOne === "show") {

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
                    //alert("d")
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
        }
    };
}

hAzzle.extend({

    /**
     * Animate CSS nodes
     *
     * @param {Object} options
     * @return {hAzzle}
     */

    animate: function (opt, value, cb) {
        //alert(callback)
        var iter = opt,
            v,
            tmp,
            ae,
            m,
            style,
            from = [],
            to = [],
            step = [],
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

        if (typeof value === "number") {

            duration = value;
        }

        if (typeof cb === "function") {

            callback = cb;
        }

        function fn(el) {

            // Never do animation on hidden CSS nodes

            style = el.style;

            // Start hACE

            anim = new hAzzle.hACE();

            // Save it on the node

            hAzzle.data(el, "anim", anim);


            /**
             * IMPORTANT!!
             *
             * We have to do all the CSS checks in the beginning of this
             * loop and update / remove from the options BEFORE
             * we use 'hAzzle.getStyle()' and get the CSS node
             * values and animates them.
             *
             */

            if (el.nodeType === 1 && ('height' in iter || 'width' in iter)) {

                iter.overflow = [style.overflow, style.overflowX, style.overflowY];

                display = hAzzle.getStyle(el, 'display');

                checkDisplay = display === 'none' ?
                    hAzzle.data(el, 'fxshow') || defaultDisplay(el.nodeName) : display;

                if (checkDisplay === 'inline' && hAzzle.getStyle(el, 'float') === 'none') {
                    style.display = 'inline-block';
                }
            }
		 
            // Fix the overflow property

            if (iter.overflow) {
                style.overflow = 'hidden';
            }

            ae = keys(iter);

            for (var i = 0; i < ae.length; i++) {

                // Duration

                if (ae[i] === "duration") {
                    duration = iter[ae[i]];
                    delete iter.duration;
                }

                // Callback

                if (ae[i] === "callback") {
                    callback = iter[ae[i]];
                    delete iter.callback;
                }

                // Easing

                if (ae[i] === "easing") {
                    easing = hAzzle.easing[iter[ae[i]]];
                    delete iter.easing;
                }

                // So, now we had a little fun, let us do the real magic...

                v = hAzzle.getStyle(el, ae[i]);
                tmp = iter[ae[i]];


                /**
                 * CSS Transformation
                 */

                if (ae[i] === 'transform') {

                    /**
                     * Mehran!!
                     *
                     * A lot of work still remains with CSS transform. Some of it has to do
                     * with hACE. I will change this later on.
                     *
                     * For now we have the same X and Y values for skew and translate
                     */

                    // Rotation

                    if ((m = tmp.match(rotate))) {
                        step[i] = createStepping(el, ae[i], "rotate(", "deg)");
                        to[i] = by(m[1], null);

                        // Scale 

                    } else if ((m = tmp.match(scale))) {
                        step[i] = createStepping(el, ae[i], "scale(", ")");
                        to[i] = by(m[1], null);

                        // Skew

                    } else if ((m = tmp.match(skew))) {
                        step[i] = createStepping(el, ae[i], "skew(", "deg", ',', "deg)");
                        to[i] = by(m[1], null);

                        // Translate

                    } else if ((m = tmp.match(translate))) {
                        step[i] = createStepping(el, ae[i], "translate(", "px", ',', "px)");
                        to[i] = by(m[1], null);
                    }

                } else {

                    if (tmp === "hide") {
                        from[i] = 1;
                        to[i] = 0;
                        step[i] = createStepping(el, ae[i], 'hide');
                    } else if (tmp === "show") {
                        to[i] = 1;
                        from[i] = 0;
                        step[i] = createStepping(el, ae[i], 'show');
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
                            .complete(callback) // Only run 'callback' once
                        .start();

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
        })
		: this;
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
        })
		: this;
    }
})


