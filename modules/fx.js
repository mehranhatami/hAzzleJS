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

    animate: function (options, speed, easing, callback) {

        var el,
            anim,

            // Check if the 'queue' are activated on the system

            queue = typeof hAzzle.Core['queue'] !== 'undefined';

        /**
         * If the "queue" plugin are used, and length are more then 1, we
         * run the queue system. Else we run normal 'each'
         */

        return this[typeof queue && this.length > 1 ? 'queue' : 'each'](function () {

            el = this;

            anim = new hAzzle.hACE()
                .from(options.start)
                .to(options.to)
                .duration(options.duration)
                .ease(hAzzle.easing[options.easing])
                .step(function (val) {
                    hAzzle(el).css('opacity', val);
                })

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
            start: name === 'fadeIn' ? 0 : 1,
            to: name === 'fadeIn' ? 1 : 0,
            duration: speed,
            callback: callback,
            easing: easing
        });
    }
});