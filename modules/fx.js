
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

            // Set duration, callback and easing
			
			anim.duration(options.duration);
			anim.complete(options.complete);
			anim.ease(hAzzle.easing[options.easing]);

            delete options.complete;
            delete options.duration;
            delete options.easing;

			// CSS animation starts here...
			
			anim.from(options.start);						 
			anim.to(options.to);
			
			anim.step(function(val) {
			
			    hAzzle(el).css('opacity', val);
			
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
            start: name === 'fadeIn' ? 0 : 1,
            to: name === 'fadeIn' ? 1 : 0,
            duration: speed,
            complete: callback,
            easing: easing
        });
    }
});