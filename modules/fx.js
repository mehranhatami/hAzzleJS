/**
 * hAzzle CSS animation engine ( hCAE )
 */
var win = this,
    keys = Object.keys;
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

function createStepping(el, property) {
    return function (val) {

        if (!hAzzle.unitless[property]) {

            val += 'px';
        }

        el.style[hAzzle.camelize(property)] = val;
    };
}

hAzzle.extend({

    /**
     * Animate CSS nodes
     *
     * @param {Object} options
     * @return {hAzzle}
     */

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

    animate: function (opt, value) {

        var iter = opt,
            v,
            tmp,
            from = [],
            to = [],
            step = [],
            display,
            checkDisplay,
            anim;

        if (typeof opt === 'string') {
            iter = {};
            iter[opt] = value;
        }

        /**
         * If the "queue" plugin are used, and length are more then 1, we
         * run the queue system. Else we run normal 'each'
         */

        function fn(el) {

            // Never do animation on hidden CSS nodes

            var style = el.style;

            // Start hACE

            anim = new hAzzle.hACE();

            // Save it on the node

            hAzzle.data(el, "anim", anim);

            // Single element

            var ae = keys(iter);

            for (var i = 0; i < ae.length; i++) {

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

                    display = hAzzle.getStyle(el, "display");

                    checkDisplay = display === 'none' ?
                        hAzzle.data(el, 'olddisplay') || defaultDisplay(el.nodeName) : display;

                    if (checkDisplay === 'inline' && hAzzle.getStyle(el, 'float') === 'none') {

                        style.display === 'inline-block';
                    }
                }

                // Fix the overflow property

                if (iter.overflow) {
                    style.overflow = 'hidden';
                }

                // So, now we had a little fun, let us do the real magic...

                v = hAzzle.getStyle(el, ae[i]);
                tmp = iter[ae[i]];

                from[i] = parseFloat(v, 10);
                to[i] = by(tmp, parseFloat(v, 10));
                step[i] = createStepping(el, ae[i]);
            }

            // Here starts the fun ........... NOT AT ALL !!!	

            if (ae.length === 1) {

                anim.from(from[0])
                    .to(to[0])
                    .ease(hAzzle.easing.easeOutBouncee)
                    .step(step[0])
                    .complete(function () {
                        this.reverse();

                    }).start();

            } else {

                for (var b = 0; b < step.length; b++) {

                    // The first animation in the set - no queue

                    if (b === 0) {

                        anim.from(from[b])
                            .to(to[b])
                            .ease(hAzzle.easing.easeOutBouncee)
                            .step(step[b])
                            .complete(function () {
                                this.reverse();

                            }).start();

                        // Series of animation on the same CSS node, 
                        // So we need to queue

                    } else {

                        anim.queue()
                            .from(from[b])
                            .to(to[b])
                            .ease(hAzzle.easing.easeOutBouncee)
                            .step(step[b])
                            .complete(function () {
                                this.reverse();

                            })
                            .start();
                    }
                }
            }
        }

        // Return the function

        return this.each(fn);
    },
});

/**
 * FadeIn and FadeOut
 */

hAzzle.each(['fadeIn', 'fadeOut'], function (name) {
    hAzzle.Core[name] = function (speed, callback, easing) {
        return this.animate({
            opacity: name === 'fadeIn' ? 1 : 0,
            duration: speed,
            complete: callback,
            easing: easing
        });
    };
});