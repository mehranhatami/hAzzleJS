// CSS transform
var transform = function () {
    var styles = doc.createElement('a').style,
        props = ['webkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform'],
        i = 0,
        len = props.length;
    for (; i < len; i++) {
        if (props[i] in styles) return props[i]
    }
}();


function getStyle(el, property) {
    var value = null;
    var computed = document.defaultView.getComputedStyle(el, '');
    computed && (value = computed[hAzzle.camelize(property)]);
    return el.style[property] || value;
}


function by(val, start, m, r, i) {
    return (m = /^([+\-])=([\d\.]+)/.exec(val)) ?
        (i = parseInt(m[2], 10)) && (r = (start + i)) && m[1] == '+' ?
        r : start - i :
        parseInt(val, 10);
}

/**
 * hAzzle CSS animation engine ( hCAE )
 */
hAzzle.extend({

    /**
     * Animate CSS nodes
     *
     * @param {Object} options
     * @return {hAzzle}
     */

    animate: function (options) {

        var el,
            k,
            v,
            from,
            to,
            property,
            anim,

            // Check if the 'queue' are activated on the system

            queue = typeof hAzzle.Core['queue'] !== 'undefined';

        /**
         * If the "queue" plugin are used, and length are more then 1, we
         * run the queue system. Else we run normal 'each'
         */

        return this[typeof queue && this.length > 1 ? 'queue' : 'each'](function () {

            el = this;

            // Start hACE

            anim = new hAzzle.hACE()

            /* Set duration, callback and easing
             *
             * NOTE!! We are deleting this after this
             * param have been set so we don't get
             * trouble with our CSS animation
             *
             */

            anim.duration(options.duration);
            anim.complete(options.complete);
            anim.ease(hAzzle.easing[options.easing]);

            delete options.complete;
            delete options.duration;
            delete options.easing;

            /**
             * CSS animation starts here...
             */

            // Collect CSS styles
            // I choose not to use our CSS module for this so
            // we can gain better performance

            for (k in options) {

                // CSS style

                v = getStyle(el, k);

                property = k;

                from = parseFloat(v, 10);
                to = by(options[k], parseFloat(v, 10))

            }

            anim.from(from);
            anim.to(to);

            anim.step(function (val) {

                el.style[hAzzle.camelize(property)] = val + (property === "opacity" ? '' : 'px');

            });

            /**
             * If no animation queue, we start the animation
             * directly. Else the animation are started
             * within the queue
             */

            if (!queue) {
                anim.start();
            }
        });
    },
})

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
    }
});