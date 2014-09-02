hAzzle.extend({

    // The default `duration`.  This can be changed publicly.

    defaultDuration: 520,

    // The default easing formula.  This can be changed publicly.

    defaultEasing: 'linear',

    // Dictionary	

    dictionary: [],

    // Support for jQuery's named durations.

    speeds: {

        slow: 900,
        fast: 300,

        // Default duration

        _default: hAzzle.defaultDuration
    },

    propertyMap: {

        display: function(value) {

            value = value.toString().toLowerCase();

            if (value === 'auto') {

                value = hAzzle.getDisplayType(elem);
            }
            return value;
        },

        visibility: function(value) {

            return value.toString().toLowerCase();

        }
    },

    fxBefore: {},

    fxAfter: {

        opacity: {

            set: function(fx) {

                fx.elem.style.opacity = fx.now
            }
        },

        _default: {

            /**
             * _default getter / setter default CSS properties. getComputedStyle are
             * cached on the object itself for better performance, so we only
             * queuing the DOM once
             */

            get: function(fx) {

                var result,
                    prop = fx.elem[fx.prop];

                if (prop != null && (!getStyles(fx.elem) || prop == null)) {
                    return prop;
                }

                result = hAzzle.css(fx.elem, fx.prop, '');

                // Empty strings, null, undefined and 'auto' are converted to 0.
                return !result || result === 'auto' ? 0 : result;
            },

            set: function(fx) {

                if (getStyles(fx.elem) &&
                    (fx.elem.style[hAzzle.cssProps[fx.prop]] != null ||
                        hAzzle.cssHooks[fx.prop])) {

                    hAzzle.style(fx.elem, fx.prop, fx.now + fx.unit);

                } else {

                    hAzzle.style(fx.elem, fx.prop, fx.now);
                }
            }
        }
    }
}, hAzzle)