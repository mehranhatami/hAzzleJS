;
(function ($) {


    var dictionary = [],
        blacklisted = /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent),
        compute = window.getComputedStyle,
        lastTime = 0,
        nativeRequestAnimationFrame = function () {
            var legacy = (function fallback(callback) {
                var currTime = $.now(),
                    timeToCall = Math.max(0, 16 - (currTime - lastTime));
                lastTime = currTime + timeToCall;
                return window.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
            });
            return !blacklisted ? (hAzzle.prefix('RequestAnimationFrame') || legacy) : legacy;
        }(),
        nativeCancelAnimationFrame = function () {
            var legacy = (function (fn) {
                clearTimeout(fn);
            });
            return !blacklisted ? (hAzzle.prefix('CancelAnimationFrame') || legacy) : legacy;
        }();


    var win = window,
        doc = win.document,
        view = doc.defaultView,
        toString = Object.prototype.toString,
        cache = {},
        empty = function () {},
        getStyle,

        /**
         * Regular expressions used to parse a CSS color declaration and extract the rgb values
         */
        hex6 = (/^#(\w{2})(\w{2})(\w{2})$/),
        hex3 = (/^#(\w{1})(\w{1})(\w{1})$/),
        rgb = (/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/),

        rgbOhex = /^rgb\(|#/,

        relVal = /^([+\-])=([\d\.]+)/,

        colorShema = ["backgroundColor", "borderBottomColor", "borderLeftColor", "borderRightColor", "borderTopColor", "color", "columnRuleColor", "outlineColor", "textDecorationColor", "textEmphasisColor"],


        /**
         * Constructor - initiate with the new operator
         * @param {Element/String} el The element or the id of the element to which the animation(s) will be performed against
         * @param {Object} attributes Object containing all the attributes to be animated and the values
         * @param {Number} duration How long should the animation take in seconds (optional)
         * @param {String} transition Name of the method in charge of the transitional easing of the element (optional)
         * @param {Function} callback The function to be executed after the animation is complete (optional)
         */

        FX = function (el, attributes, duration, transition, callback) {
            this.el = el;
            this.attributes = attributes;
            this.duration = duration || 0.7;
            this.transition = FX.transitions[transition || 'easeInOut'];
            this.callback = callback || empty;
            this.animating = false;
            this._lastTickTime = 0
            this._tickCounter = 0

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
        };

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
            var attr, attributes, el = this.el;

            for (attr in this.attributes) {

                var v = getStyle(el, attr),
                    unit, tmp = this.attributes[attr];
                attr = toCamelCase(attr);
                if (typeof tmp == 'string' &&
                    rgbOhex.test(tmp) &&
                    !rgbOhex.test(v)) {
                    delete this.attributes[attr]; // remove key :(
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
            var attr, frame, units, el = this.el;

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
            parseFloat(val)
    }


    /**
     * Set a style for an element
     * @param {Element} el The element the new value will be applied to
     * @param {String} prop The property or style that will be set
     * @param {String} value The value of the property to be set
     */
    function setStyle(el, prop, value) {
        if (prop == 'opacity') {
            el.style.filter = "alpha(opacity=" + value * 100 + ")";
            el.style.opacity = value;
        } else {
            prop = toCamelCase(prop);
            el.style[prop] = value;
        }
    }

    /**
     * Get a style of an element
     * @param {Element} el The element for the style to be retrieved from
     * @param {String} prop The property or style that is to be found
     * @return {Number} The value of the property
     */

    getStyle = function (el, property) {
        property = property == 'transform' ? transform : property
        property = toCamelCase(property)
        var value = null,
            computed = doc.defaultView.getComputedStyle(el, '')
        computed && (value = computed[property])
        return el.style[property] || value

    };

    FX.hasNative = false;

    /**
     * Add the getStyle method to the FX namespace to allow for external use,
     * primarily the Node plugin
     */
    FX.getStyle = getStyle;

    /**
     * Determine the start point for the element
     * @param {Element} el The element in question
     * @param {String} attr The property we must find the relative start position of
     * @param {String} end The value of the property at the end of the animation
     * @param {String} units The units we are using (px, em, pt, etc.)
     * @return {Number} The start value
     */
    function getStartValue(el, attr, end, units) {
        var start = parseFloat(getStyle(el, attr)) || 0;
        if (units != "px" && view) {
            setStyle(el, attr, (end || 1) + units);
            start = ((end || 1) / parseFloat(getStyle(el, attr))) * start;
            setStyle(el, attr, start + units);
        }
        return start;
    }

    /**
     * Convert a CSS property to camel case (font-size to fontSize)
     * @param {String} str The property that requires conversion to camel case
     * @return {String} The camel cased property string
     */
    function toCamelCase(s) {

        return s.replace(/-(.)/g, function (m, m1) {
            return m1.toUpperCase()
        })
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

    $.extend($.fn, {

        fadeOut: function (config) {

            config = config || {}

            this.each(function (elem) {

                new FX(
                    this,
                    {
                        'opacity': 0
                    },
                    config.duration || 0.3,
                    config.transition || 'easeInOut',
                    config.callback || function () {
                        console.log("callback!!");
                    },
                    config.scope || win
                ).start();

            });
        },

        fadeIn: function (config) {

            config = config || {}

            this.each(function (elem) {

                new FX(
                    this,
                    {
                        'opacity': 1
                    },
                    config.duration || 0.3,
                    config.transition || 'easeInOut',
                    config.callback || function () {
                        console.log("bilat");
                    },
                    config.scope || win
                ).start();

            });
        },

        animate: function (to, config) {

            config = config || {}

            return this.each(function (elem) {

                new FX(
                    this,
                    to,
                    config.duration || .8,
                    config.transition || 'easeInOut',
                    config.callback || function () {
                        console.log("bilat");
                    },
                    config.scope || win
                ).start();

            });
        }
    });

})(hAzzle);