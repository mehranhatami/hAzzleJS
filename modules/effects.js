// effects.js
hAzzle.each({

    /**
     * Display or hide the matched elements with a sliding motion
     */

    slideToggle: createAnimation('toggle'),

    /**
     * Display the matched elements by fading them to opaque.
     */

    fadeIn: {
        opacity: 'show'
    },

    /**
     * Hide the matched elements by fading them to transparent.
     */

    fadeOut: {
        opacity: 'hide'
    },

    /**
     * Display or hide the matched elements by animating their opacity.
     */

    fadeToggle: {
        opacity: 'toggle'
    },

    /**
     * Display the matched elements with a sliding motion.
     */

    slideDown: createAnimation('show'),

    /**
     * Hide the matched elements with a sliding motion
     */

    slideUp: createAnimation('hide'),



}, function(props, name) {

    hAzzle.Core[name] = function(speed, easing, callback) {
        return this.animate(props, { duration: speed,
			                         easing: easing,
			                         complete: callback
			                         });
    };
});

function createAnimation(type, includeWidth) {

    var which, i = 0,
        attrs = {
            height: type
        };

    includeWidth = includeWidth ? 1 : 0;

    for (; i < 4; i += 2 - includeWidth) {
        which = directions[i];
        attrs['margin' + which] = attrs['padding' + which] = type;
    }

    if (includeWidth) {
        attrs.opacity = attrs.width = type;
    }

    return attrs;
}