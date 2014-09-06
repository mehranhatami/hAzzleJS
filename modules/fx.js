var frame = hAzzle.RAF(),
    relarelativesRegEx = /^(?:([+-])=|)([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))([a-z%]*)$/i,
    fixTick = false, // feature detected below
    tweens = [],
    rafId,
    colorProps = ['color',
        'backgroundColor',
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor',
        'outlineColor',
        'columnRuleColor',
        'textDecorationColor',
        'textEmphasisColor',
        'borderColor',
        'stopColor'
    ],

    // Usefull regexes

    aabbcc = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/,
    abc = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/,
    rgb = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/,
    rgba = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9\.]*)\s*\)/,
    colorNames = {
        'aqua': [0, 255, 255, 1],
        'azure': [240, 255, 255, 1],
        'beige': [245, 245, 220, 1],
        'black': [0, 0, 0, 1],
        'blue': [0, 0, 255, 1],
        'brown': [165, 42, 42, 1],
        'cyan': [0, 255, 255, 1],
        'darkblue': [0, 0, 139, 1],
        'darkcyan': [0, 139, 139, 1],
        'darkgrey': [169, 169, 169, 1],
        'darkgreen': [0, 100, 0, 1],
        'darkkhaki': [189, 183, 107, 1],
        'darkmagenta': [139, 0, 139, 1],
        'darkolivegreen': [85, 107, 47, 1],
        'darkorange': [255, 140, 0, 1],
        'darkorchid': [153, 50, 204, 1],
        'darkred': [139, 0, 0, 1],
        'darksalmon': [233, 150, 122, 1],
        'darkviolet': [148, 0, 211, 1],
        'fuchsia': [255, 0, 255, 1],
        'gold': [255, 215, 0, 1],
        'green': [0, 128, 0, 1],
        'indigo': [75, 0, 130, 1],
        'khaki': [240, 230, 140, 1],
        'lightblue': [173, 216, 230, 1],
        'lightcyan': [224, 255, 255, 1],
        'lightgreen': [144, 238, 144, 1],
        'lightgrey': [211, 211, 211, 1],
        'lightpink': [255, 182, 193, 1],
        'lightyellow': [255, 255, 224, 1],
        'lime': [0, 255, 0, 1],
        'magenta': [255, 0, 255, 1],
        'maroon': [128, 0, 0, 1],
        'navy': [0, 0, 128, 1],
        'olive': [128, 128, 0, 1],
        'orange': [255, 165, 0, 1],
        'pink': [255, 192, 203, 1],
        'purple': [128, 0, 128, 1],
        'violet': [128, 0, 128, 1],
        'red': [255, 0, 0, 1],
        'silver': [192, 192, 192, 1],
        'white': [255, 255, 255, 1],
        'yellow': [255, 255, 0, 1],
        'transparent': [255, 255, 255, 0]
    };

frame.request(function(timestamp) {
    fixTick = timestamp > 1e12 != frame.perfNow() > 1e12;
});

function FX(elem, options, prop) {
    return new FX.prototype.initialize(elem, options, prop);
}

hAzzle.FX = FX;

FX.prototype = {

    // constructor

    constructor: FX,

    /**
     * initialize
     * @param {Object} elem
     * @param {Object} options
     * @param {String} prop
     */

    initialize: function(elem, options, prop) {

        this.elem = elem;
        this.prop = prop;
        this.currentState = {};
        this.options = options;
        this.easing = options.easing || hAzzle.defaultEasing;

    },

    /**
     * Get current CSS styles for the animated object.
     *
     * The current CSS style are cached on the object, so we
     * only perform DOM querying once when we do a sequence of
     * animations.
     */

    cur: function() {
        var hooks = hAzzle.fxAfter[this.prop];
        return hooks && hooks.get ?
            hooks.get(this) :
            hAzzle.fxAfter._default.get(this);
    },

    /**
     * Run animation
     * @param {Number|Object} from
     * @param {Number|Object} to
     * @param {Number} unit
     */

    run: function(from, to, unit) {

        this.from = from;
        this.unit = unit || this.unit || (hAzzle.unitless[this.prop] ? '' : 'px');
        this.start = frame.perfNow();
        this.pos = 0;
        this.to = to;

        // Set some variabels

        var self = this,
            done = true,
            isRunning = true;

        buhi({

            setPosition: function(currentTime) {

                var i, delta = currentTime - self.start;

                self.currentTime = currentTime;

                if (delta > self.options.duration && isRunning) {
                    
					// Mark it as stopped
					
					isRunning = false;

                    // Save the property state so we know when we have completed 
                    // the animation

                    self.currentState[self.currentState.prop] = true;

                    for (i in self.currentState) {
                        if (self.currentState[i] !== true) {
                            done = false;
                        }
                    }

                    if (done) {
                        self.finished();
                    }

                    return false;
                }

                // Calculate position, and update the CSS properties

                self.calculate(delta);

                return true;
            },

            stop: function(jump) {

                isRunning = false;

                if (jump) {

                    // Only do style update if jump 

                    self.pos = self.to;
                    self.deldu = 1;
                    self.update();

                } else {

                    self.options.complete = null; // remove callback if not jumping to end
                }

                self.finished();
            },

            elem: this.elem
        });
    },

    /**
     * Calculate position
     *
     * @param {Number} delta
     */

    calculate: function(delta) {

        var v, from = this.from,
            to = this.to,
            easing = this.easing,
            duration = this.options.duration;

        // NOTE!! There exist bugs in this calculations for Android 2.3, but
        // hAzzle are not supporting Android 2.x so I'm not going to fix it

        if (typeof from === 'object') {

            // Calculate easing for Object.
            // Note!! This will only run if the 'start' value are a object

            for (v in from) {
                this.pos = {};
                this.deldu = hAzzle.easing[easing](delta / duration);
                this.pos[v] = from[v] + (to[v] - from[v]) * this.deldu;
            }

        } else {

            // Do not use Math.max for calculations it's much slower!
            // http://jsperf.com/math-max-vs-comparison/3

            this.deldu = hAzzle.easing[easing](delta / duration);
            this.pos = from + ((to - from) * this.deldu);
        }
        // Set CSS styles

        this.update();

        //    return pos;
    },

    // Restore properties, and fire callback

    finished: function() {

        // Set the overflow back to the state the properties 
        // had before animation started

        if (this.options.overflow) {

            var style = this.elem.style,
                options = this.options;

            style.overflow = options.overflow[0];
            style.overflowX = options.overflow[1];
            style.overflowY = options.overflow[2];
        }

        // Execute the complete function

        var complete = this.options.complete;

        if (complete) {
            this.options.complete = false;
            complete.call(this.elem);
        }
    },

    // Update current CSS properties

    update: function() {

        /**
         * Future plans after animation queue are finished will be
         * to cache the end state of each property on the object
         * so if we have a sequence, it will remember the previous
         * state, so there will be no need for DOM querying
         */

        var hooks = hAzzle.fxAfter[this.prop];

        if (hooks && hooks.set) {
            hooks.set(this);
        } else {
            hAzzle.fxAfter._default.set(this);
        }
    }
};

FX.prototype.initialize.prototype = FX.prototype;

hAzzle.extend({

    /**
     *  Perform a custom animation of a set of CSS properties.
     *
     *  hAzzle( ELEMENT ).animate ( { PROPERTIES}, { SETTINGS}   )
     *
     * Example:
     *
     * hAzzle(div).animate ( { width:200, height:200}, {
     *
     *   easing: 'linear',
     *    duration: 900
     *  })
     *
     * Short hand exist also:
     *
     *  hAzzle( ELEMENT ).animate ( { PROPERTIES}, DURATION, CALLBACK )
     *
     * Example:
     *
     * hAzzle(div).animate ( { width:200, height:200}, 999, function() {
     *
     * console.log('Hello! I'm a callback!' );
     * });
     *
     */

    animate: function(opts, speed, callback) {

        // opts has to be a object, 

        if (typeof opts !== 'object') {
            return false;
        }

        var opt;

        if (typeof speed === 'object') {

            opt = hAzzle.shallowCopy({}, speed);

        } else {

            opt = {};

            // Callback

            opt.complete = (!callback && typeof speed === 'function') ? speed : callback;

            // Duration

            opt.duration = typeof speed === 'number' ? speed :
                opt.duration in hAzzle.speeds ?
                // Support for jQuery's named durations
                hAzzle.speeds[opt.duration] : /* Default speed */ hAzzle.defaultDuration;

            // If the user is attempting to set a duration under 100, adjust it back to
            // 100 to avoid bugs that can occur ( 100 is fast enough)

            if (opt.duration < 100) {
                opt.duration = 100;
            }
        }

        opt.duration = (hAzzle.speeds[opt.duration] || opt.duration) || hAzzle.defaultDuration;

        return this.each(function(elem) {

            var index, val, anim, hooks, name, style = elem.style,
                parts, display;

            // Height/width overflow pass

            if (elem.nodeType === 1 && ('height' in opts || 'width' in opts)) {

                opt.overflow = [style.overflow, style.overflowX, style.overflowY];

                display = hAzzle.css(elem, 'display');

                // Test default display if display is currently 'none'
                display === 'none' ?
                    (hAzzle.getPrivate(elem, 'olddisplay') || defaultDisplay(elem.nodeName)) : display;

                if (display === 'inline' && hAzzle.css(elem, 'float') === 'none') {

                    style.display = 'inline-block';
                }
            }

            if (opt.overflow) {
                style.overflow = 'hidden';
            }

            for (index in opts) {

                val = opts[index];

                // Auto-set vendor prefixes. 
                // This is cached for better performance

                name = hAzzle.camelize(hAzzle.prefixCheck(index)[0]);

                if (index !== name) {
                    opts[name] = opts[index];
                    delete opts[index];
                }

                if (hAzzle.propertyMap[index]) {
                    val = hAzzle.propertyMap[index](elem, index);
                }

                anim = new FX(elem, opt, index);

                hooks = hAzzle.fxBefore[index];

                if (hooks) {

                    hooks = hooks(elem, index, val, opts);

                    // Animation are started from inside of this hook 

                    anim.run(anim.cur(), hooks, ' ');

                } else {

                    // Unit Conversion	

                    if ((parts = relarelativesRegEx.exec(val))) {

                        calculateRelatives(elem, parts, index, anim);

                    } else {

                        anim.run(anim.cur(), val, '');
                    }
                }
            }
        });
    },

    stop: function(jump) {

        return this.each(function() {

            var tween,
                target = this,
                i = tweens.length;

            while (i--) {
                tween = tweens[i];
                if (tween.elem === target) {
                    if (jump) {
                        tween.stop(true);
                    }
                    tweens.splice(i, 1);
                }
            }
        });
    }
});

/* ============================ UTILITY METHODS =========================== */

function raf(timestamp) {
    if (rafId) {
        frame.request(raf);
        render(timestamp);
    }
}

function render(tick) {

    if (fixTick) {
        tick = frame.perfNow();
    }

    var tween, i = 0;

    for (; i < tweens.length; i++) {
        tween = tweens[i];
        // Check if the tween has not already been removed
        if (!tween.setPosition(tick) && tweens[i] === tween) {
            tweens.splice(i--, 1);
        }
    }

    if (!tweens.length) {

        frame.cancel(rafId);

        // Avoid memory leaks

        rafId = null;
    }
}

function calculateRelatives(elem, parts, index, anim) {

    var target = anim.cur(),
        end, start, unit, maxIterations, scale;

    if (parts) {
        end = parseFloat(parts[2]);
        unit = parts[3] || (hAzzle.unitless[index] ? '' : 'px');

        // Starting value computation is required for potential unit mismatches
        start = (hAzzle.unitless[index] || unit !== 'px' && +target) &&
            relarelativesRegEx.exec(hAzzle.css(elem, index)),
            scale = 1, maxIterations = 20;

        // We need to compute starting value
        if (start && start[3] !== unit) {

            unit = unit || start[3];

            // Make sure we update the FX properties later on
            parts = parts || [];

            // Iteratively approximate from a nonzero starting point
            start = +target || 1;

            do {

                scale = scale || '.5';

                // Adjust and apply
                start = start / scale;
                hAzzle.style(elem, index, start + unit);

            } while (
                scale !== (scale = anim.cur() / target) && scale !== 1 && --maxIterations
            );
        }

        if (parts) {

            start = +start || +target || 0;

            // If a +=/-= token was provided, we're doing a relative animation
            end = parts[1] ?
                start + (parts[1] + 1) * parts[2] :
                +parts[2];
        }

        anim.run(start, end, unit);
    }
}

function buhi(callback) {
    tweens.push(callback);
    if (callback.setPosition()) {
        if (!rafId) {
            rafId = frame.request(raf);
        }
    } else {
        tweens.pop();
    }
}

// Calculate an in-between color. Returns "#aabbcc"-like string.

function calculateColor(begin, end, pos) {
    var color = 'rgba' + '(' +
        parseInt((begin[0] + pos * (end[0] - begin[0])), 10) + ',' +
        parseInt((begin[1] + pos * (end[1] - begin[1])), 10) + ',' +
        parseInt((begin[2] + pos * (end[2] - begin[2])), 10);
    color += ',' + (begin && end ? parseFloat(begin[3] + pos * (end[3] - begin[3])) : 1);
    color += ')';
    return color;
}

function parseColor(color) {
    var match;

    // Match #aabbcc
    if ((match = aabbcc.exec(color))) {
        return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16), 1];
    }
    // Match #abc		
    if ((match = abc.exec(color))) {
        return [parseInt(match[1], 16) * 17, parseInt(match[2], 16) * 17, parseInt(match[3], 16) * 17, 1];
    }
    // Match rgb(n, n, n)
    if ((match = rgb.exec(color))) {


        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), 1];
    }
    // Match rgb(n, n, n)
    if ((match = rgba.exec(color))) {
        return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10), parseFloat(match[4])];

        // No browser returns rgb(n%, n%, n%), so little reason to support this format.
    }
    return colorNames[color];
}

/* ============================ INTERNAL =========================== */

hAzzle.extend({

    colors: colorNames,

    // Default duration

    defaultDuration: 500,

    propertyMap: {

        display: function(elem, value) {

            // If the element was hidden in the previous call, revert display 
            // to 'auto' prior to reversal so that the element is visible again.

            if ((value = hAzzle.data(elem, 'display')) === 'none') {
                hAzzle.data(elem, 'display', 'auto');
            }

            if (value === 'auto') {
                value = hAzzle.getDisplayType(elem);

            }

            hAzzle.data(elem, 'display', value);

            return value;
        },

        visibility: function(elem, value) {

            // If the element was hidden in the previous call, revert display 
            // to 'auto' prior to reversal so that the element is visible again.

            if ((value = hAzzle.data(elem, 'visibility')) === 'hidden') {
                hAzzle.data(elem, 'visibility', 'visible');

                return value;
            }

            value = value.toString().toLowerCase();

            hAzzle.data(elem, 'display', value);

            return value;
        }
    },

    fxBefore: {},

    fxAfter: {

        _default: {

            /**
             * _default getter / setter default CSS properties. getComputedStyle are
             * cached on the object itself for better performance, so we only
             * queuing the DOM once
             */

            get: function(fx) {

                var result,
                    prop = fx.elem[fx.prop];

                if (prop !== null && (!getStyles(fx.elem) || prop === null)) {
                    return prop;
                }

                result = hAzzle.css(fx.elem, fx.prop, '');

                // Empty strings, null, undefined and 'auto' are converted to 0.
                return !result || result === 'auto' ? 0 : result;
            },

            set: function(fx) {

                if (fx.elem.style &&
                    (fx.elem.style[hAzzle.cssProps[fx.prop]] !== null ||
                        hAzzle.cssHooks[fx.prop])) {
                    hAzzle.style(fx.elem, fx.prop, fx.pos + fx.unit);
                } else {
                    fx.elem[fx.prop] = fx.now;
                }
            }
        }
    },
    speeds: {
        slow: 1500,
        medium: 400,
        fast: 200
    },

}, hAzzle);

hAzzle.fxAfter.scrollTop = hAzzle.fxAfter.scrollLeft = {
    set: function(fx) {
        if (fx.elem.nodeType && fx.elem.parentNode) {
            fx.elem[fx.prop] = fx.pos;
        }
    }
};

// Color animation are cached on the object itself so we get
// faster look-up in animation sequences

hAzzle.each(colorProps, function(prop) {
    hAzzle.fxAfter[prop] = {
        set: function(fx) {

            if (!fx.init) {

                if (!hAzzle.data(fx.elem, 'CSS').prevState['colorStart' + prop]) {
                    fx.from = hAzzle.data(fx.elem, 'CSS').prevState['colorStart' + prop] = parseColor(curCSS(fx.elem, prop));
                } else {
                    fx.from = hAzzle.data(fx.elem, 'CSS').prevState['colorStart' + prop];
                }

                if (!hAzzle.data(fx.elem, 'CSS').prevState['colorEnd' + prop]) {
                    fx.to = hAzzle.data(fx.elem, 'CSS').prevState['colorEnd' + prop] = parseColor(fx.to);
                } else {
                    fx.to = hAzzle.data(fx.elem, 'CSS').prevState['colorEnd' + prop];
                }

                fx.init = true;
            }

            fx.elem.style[prop] = calculateColor(fx.from, fx.to, fx.deldu);
        }
    };
});

hAzzle.fxAfter.borderColor = {
    set: function(fx) {
        var i, style = fx.elem.style, end,
            start = [],
            borders = colorProps.slice(2, 6); // All four border properties
        hAzzle.each(borders, function(prop) {
            if (!hAzzle.data(fx.elem, 'CSS').prevState['colorStart' + prop]) {
                start[prop] = hAzzle.data(fx.elem, 'CSS').prevState['colorStart' + prop] = parseColor(curCSS(fx.elem, prop));
            } else {
                start[prop] = hAzzle.data(fx.elem, 'CSS').prevState['colorStart' + prop];
            }
        });
        if (!hAzzle.data(fx.elem, 'CSS').prevState.colorEndborderColor) {
            end = hAzzle.data(fx.elem, 'CSS').prevState.colorEndborderColor = parseColor(fx.to);
        } else {
            end = hAzzle.data(fx.elem, 'CSS').prevState.colorEndborderColor;
        }

        i = borders.length;

        while (i--) {
            style[borders[i]] = calculateColor(start[borders[i]], end, fx.deldu);
        }
    }
};