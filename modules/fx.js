/**
 *
 * Animation engine for hAzzle
 *
 * IMPORTANT TODO!!!
 * ==================
 *
 * - Add 'window.performance'
 * - clean up the animation frame code
 * - Make sure the iOS6 bug are solved
 * - Add animation queue
 *
 ****/
;
(function ($) {

    var win = window,
        doc = win.document,
        cache = {},

        /**
         * Regular expressions used to parse a CSS color declaration and extract the rgb values
         */
        hex6 = (/^#(\w{2})(\w{2})(\w{2})$/),
        hex3 = (/^#(\w{1})(\w{1})(\w{1})$/),
        rgb = (/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/),

        rgbOhex = /^rgb\(|#/,

        relVal = /^([+\-])=([\d\.]+)/,

        // RAF

        nativeRequestAnimationFrame,
        nativeCancelAnimationFrame;

    // Grab the native request and cancel functions.
    
    (function () {

        var top;

        // Test if we are within a foreign domain. Use raf from the top if possible.
        try {
            // Accessing .name will throw SecurityError within a foreign domain.
            window.top.name;
            top = window.top;
        } catch (e) {
            top = window;
        }

        nativeRequestAnimationFrame = top.requestAnimationFrame;
        nativeCancelAnimationFrame = top.cancelAnimationFrame || top.cancelRequestAnimationFrame;

        // Grab the native implementation.
        if (!nativeRequestAnimationFrame) {
            nativeRequestAnimationFrame = hAzzle.support.nativeRequestAnimationFrame = $.prefix('RequestAnimationFrame');
            nativeCancelAnimationFrame = hAzzle.support.nativeCancelAnimationFrame = $.prefix('CancelAnimationFrame') || $.prefix('CancelRequestAnimationFrame');
        }

        nativeRequestAnimationFrame && nativeRequestAnimationFrame(function () {

            FX.hasNative = true;
        });								
    }());

    /**
     * Constructor - initiate with the new operator
     * @param {Element/String} el The element or the id of the element to which the animation(s) will be performed against
     * @param {Object} attributes Object containing all the attributes to be animated and the values
     * @param {Number} duration How long should the animation take in seconds (optional)
     * @param {String} transition Name of the method in charge of the transitional easing of the element (optional)
     * @param {Function} callback The function to be executed after the animation is complete (optional)
     */

    function FX(el, attributes, duration, transition, callback) {
        this.el = el;
        this.attributes = attributes;
        this.duration = duration || 0.7;
        this.transition = FX.transitions[transition || 'easeInOut'];
        this.callback = callback || $.noop();
        this.animating = false;

        /**
         * The object that holds the CSS unit for each attribute
         * @type Object
         */
        this.units = {};

        /**
         * The object to carry the current values for each frame
         * @type Object
         */
        this.frame = {};

        /**
         * The object containing all the ending values for each attribute
         * @type Object
         */
        this.endAttr = {};

        /**
         * The object containing all the starting values for each attribute
         * @type Object
         */
        this.startAttr = {};
    }

    /**
     * Object containing all the transitional easing methods.
     * Is available to the global context to facilitate adding additionial transitions as desired
     */
    FX.transitions = {

        linear: function (t, b, c, d) {
            return c * t / d + b;
        },

        easeIn: function (t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },

        easeOut: function (t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },

        easeInOut: function (t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },


        quadIn: function (t, b, c, d) {
            return c * (t /= d) * t + b;
        },

        quadOut: function (t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },

        quadInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },

        cubicIn: function (t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },

        cubicOut: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },

        cubicInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },

        quartIn: function (t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },

        quartOut: function (t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },

        quartInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },

        quintIn: function (t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },

        quintOut: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },

        quintInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },

        expoIn: function (t, b, c, d) {
            return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b - c * 0.001;
        },

        expoOut: function (t, b, c, d) {
            return (t === d) ? b + c : c * 1.001 * (-Math.pow(2, -10 * t / d) + 1) + b;
        },

        expoInOut: function (t, b, c, d) {
            if (t === 0) return b;
            if (t === d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b - c * 0.0005;
            return c / 2 * 1.0005 * (-Math.pow(2, -10 * --t) + 2) + b;
        },

        circIn: function (t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },

        circOut: function (t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },

        circInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },

        backIn: function (t, b, c, d, s) {
            s = s || 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },

        backOut: function (t, b, c, d, s) {
            s = s || 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },

        backBoth: function (t, b, c, d, s) {
            s = s || 1.70158;
            if ((t /= d / 2) < 1) {
                return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            }
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },

        elasticIn: function (t, b, c, d, a, p) {
			var s;
            if (t === 0) {
                return b;
            }
            if ((t /= d) == 1) {
                return b + c;
            }
            if (!p) {
                p = d * .3;
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else {
                 s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },

        elasticOut: function (t, b, c, d, a, p) {
			
			var s;
			
            if (t === 0) {
                return b;
            }
            if ((t /= d) == 1) {
                return b + c;
            }
            if (!p) {
                p = d * .3;
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        },

        elasticBoth: function (t, b, c, d, a, p) {
			var s;
            if (t === 0) {
                return b;
            }
            if ((t /= d / 2) == 2) {
                return b + c;
            }
            if (!p) {
                p = d * (.3 * 1.5);
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            if (t < 1) {
                return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            }
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        },

        bounceIn: function (t, b, c, d) {
            return c - FX.transitions.bounceOut(d - t, 0, c, d) + b;
        },

        bounceOut: function (t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            }
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        },

        bounceBoth: function (t, b, c, d) {
            if (t < d / 2) {
                return FX.transitions.bounceIn(t * 2, 0, c, d) * .5 + b;
            }
            return FX.transitions.bounceOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        }


    };

    FX.prototype = {

        /**
         * start the animation
         */
        start: function () {
            var fx = this,
                run;
            fx.getAttributes();
            fx.duration = fx.duration * 1000;
            fx.time = $.now();
            fx.animating = true;

            fx.timer = run = function () {
                var time = $.now();
                if (time < (fx.time + fx.duration)) {
                    fx.elapsed = time - fx.time;
                    fx.setCurrentFrame();
                    nativeRequestAnimationFrame(run);
                } else {
                    fx.frame = fx.endAttr;
                    fx.complete();
                }
                fx.setAttributes();
            };

            if (FX.hasNative) {
                return nativeRequestAnimationFrame(run);
            }
            run();

        },

        /**
         * stop the animation
         */
        stop: function (finish) {
            if (finish) {
                this.frame = this.endAttr;
                this.setAttributes();
            }
            this.complete();
        },

        /**
         * Is this instance currently animating
         * @return {Boolean} True if the element is in transition false if it is not
         */
        isAnimating: function () {
            return this.animating;
        },

        /**
         * Perform a transitional ease to keep the animation smooth
         * @param {Number} start The starting value for the attribute
         * @param {Number} end The ending value for the attribute
         * @return {Number} Calculated percentage for the frame of the attribute
         */
        ease: function (start, end) {
            return this.transition(this.elapsed, start, end - start, this.duration);
        },

        /**
         * Complete the animation by clearing the interval and nulling out the timer,
         * set the animating property to false, and execute the callback
         */

        complete: function () {

            nativeCancelAnimationFrame(this.timer);
            this.timer = null;
            this.animating = false;
            this.callback.call(this);
        },

        /**
         * Set the current frame for each attribute by calculating the ease and setting the new value
         */
        setCurrentFrame: function () {

            var start, end;

            for (var attr in this.startAttr) {
                start = this.startAttr[attr];
                end = this.endAttr[attr];
                if ($.isArray(start)) {
                    this.frame[attr] = [];
                    for (var i = 0, len = start.length; i < len; i++) {
                        this.frame[attr][i] = this.ease(start[i], end[i]);
                    }
                } else {
                    this.frame[attr] = this.ease(start, end);
                }
            }
        },

        /**
         * Get all starting and ending values for each attribute
         */
        getAttributes: function () {
            var attr, 
			    attributes = this.attributes, 
				el = this.el;

            for (attr in attributes) {

                var v = getStyle(el, attr),
                  	 tmp = attributes[attr];
                attr = toCamelCase(attr);
                if (typeof tmp == 'string' &&
                    rgbOhex.test(tmp) &&
                    !rgbOhex.test(v)) {
                    delete attributes[attr]; // remove key :(
                    continue; // cannot animate colors like 'orange' or 'transparent'
                    // only #xxx, #xxxxxx, rgb(n,n,n)
                }

                this.endAttr[attr] = typeof tmp == 'string' && rgbOhex.test(tmp) ?
                    parseColor(tmp) :
                    by(tmp, parseFloat(v));


                this.startAttr[attr] = typeof tmp == 'string' && tmp.charAt(0) == '#' ?
                    parseColor(v) :
                    parseFloat(v);
            }
        },

        /**
         * Set the current value for each attribute for every frame
         */

        setAttributes: function () {
            var attr, frame, el = this.el;

            for (attr in this.frame) {
                frame = this.frame[attr];


                $.style(el, attr, frame);
                $.style(el, attr, 'rgb(' + Math.floor(frame[0]) + ',' + Math.floor(frame[1]) + ',' + Math.floor(frame[2]) + ')');
            }
        }
    };

    function by(val, start, m, r, i) {
        return (m = relVal.exec(val)) ?
            (i = parseFloat(m[2])) && (start + (m[1] == '+' ? 1 : -1) * i) :
            parseFloat(val);
    }

    /**
     * Get a style of an element
     * @param {Element} el The element for the style to be retrieved from
     * @param {String} prop The property or style that is to be found
     * @return {Number} The value of the property
     */

    function getStyle (el, property) {
        property = toCamelCase(property);
        var value = null,
            computed = doc.defaultView.getComputedStyle(el, '');
        computed && (value = computed[property]);
        return el.style[property] || value;
    }

    FX.hasNative = false;

    /**
     * Add the getStyle method to the FX namespace to allow for external use,
     * primarily the Node plugin
     */
    FX.getStyle = getStyle;

    /**
     * Convert a CSS property to camel case (font-size to fontSize)
     * @param {String} str The property that requires conversion to camel case
     * @return {String} The camel cased property string
     */
    function toCamelCase(s) {

        return s.replace(/-(.)/g, function (m, m1) {
            return m1.toUpperCase();
        });
    }

    /**
     * parse a color to be handled by the animation, supports hex and rgb (#FFFFFF, #FFF, rgb(255, 0, 0))
     * @param {String} str The string value of an elements color
     * @return {Array} The rgb values of the color contained in an array
     */
    function parseColor(str) {
        if (str in cache) {
            return cache[str];
        }
        var color = str.match(hex6);
        if (color && color.length == 4) {
            return cache[str] = [parseInt(color[1], 16), parseInt(color[2], 16), parseInt(color[3], 16)];
        }
        color = str.match(rgb);
        if (color && color.length == 4) {
            return cache[str] = [parseInt(color[1], 10), parseInt(color[2], 10), parseInt(color[3], 10)];
        }
        color = str.match(hex3);
        if (color && color.length == 4) {
            return cache[str] = [parseInt(color[1] + color[1], 16), parseInt(color[2] + color[2], 16), parseInt(color[3] + color[3], 16)];
        }
    }

    FX.hasNative = false;




    $.extend($.fn, {

        fadeOut: function (config) {

            config = config || {};

            this.each(function () {

                new FX(
                    this, {
                        'opacity': 0
                    },
                    config.duration || 0.3,
                    config.transition || 'easeInOut',
                    config.callback || function () {
                        console.log("callback!!");
                    }
                ).start();

            });
        },

        fadeIn: function (config) {

            config = config || {};

            this.each(function () {

                new FX(
                    this, {
                        'opacity': 1
                    },
                    config.duration || 0.3,
                    config.transition || 'easeInOut',
                    config.callback || function () {
                        console.log("bilat");
                    }
                ).start();

            });
        },

        animate: function (to, config) {

            config = config || {};

            return this.each(function () {

                new FX(
                    this,
                    to,
                    config.duration || .8,
                    config.transition || 'easeInOut',
                    config.callback || function () {
                        console.log("bilat");
                    }
                ).start();

            });
        }
    });

})(hAzzle);