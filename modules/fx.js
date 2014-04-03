// FX

var win = window,
    cancel = hAzzle.prefix('CancelAnimationFrame'),
    request = hAzzle.prefix('RequestAnimationFrame'),
    compute = win.getComputedStyle ? win.getComputedStyle : null,
    dictionary = [],
    cached = [],

    defaultEase = hAzzle.defaultEase = 'easeOutQuad',
	defaultDuration = hAzzle.defaultDuration = 500,
	intervalSpeed = 33.33,

        nativeKeys = Object.keys || function (obj) {
            if (obj !== Object(obj)) throw "Syntax error, unrecognized expression: Invalid object";
            var keys = [];
            for (var key in obj)
                if (own[call](obj, key)) keys.push(key);
            return keys;
        },

 Pattern = {

        // Animation

        positions: /(right|bottom|center)/,
        aabbcc: /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/,
        abc: /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/,
        rgbnn: /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/,
        rgbann: /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9\.]*)\s*\)/
	 
	 
	 },

    engineRunning = false;

/**
 *  Animation engine
 */

function engine() {
    for (var run = false, i = length, itm; i--;) {
        itm = dictionary[i];
        if (!itm) break;
        itm.cycle() ? run = true : itm.stop(false, itm.onComplete, false, true);
    }
    request ? run ? request(engine) : cancel(engine) : run ? engineRunning || (timer = setInterval(engine, intervalSpeed)) : clearInterval(timer);
    engineRunning = run;
}

/**
 * Animation objects
 */

function Tween(obj, to, sets, callback) {

    // FadeIn / FadeOut settings
    // Hack for now

    sets.fadeOut ? this.fadeOut = true : sets.fadeIn && (this.fadeIn = true);

    this.obj = obj;
    this.onComplete = sets.onComplete || callback;
    this.onCompleteParams = sets.onCompleteParams;

    length = dictionary.length;

    hAzzle.data(obj, 'animate', dictionary[length++] = this);

    var self = this;

    if (typeof sets === "number") {

        sets = {
            duration: sets
        };

        animation(this, obj, to, sets);

    } else {

        // If duration set to '0', stop the animation at once

        if (sets.duration === 0) {

            this.stop();
            return;
        }

        // If delayed

        if (sets.delay) {

            var _this = this;

            this.delayed = setTimeout(function () {

                animation(self, obj, to, sets);

            }, sets.delay);

        } else animation(this, obj, to, sets);
    }
}

Tween.prototype = {

    /**
     * Cycles through and updates animated properties
     */

    cycle: function () {

        var trans = this.transitions;
        if (!trans) return true;

        var rip = trans.length,
            moved;

        while (rip--) {

            if (trans[rip]()) moved = true;

        }

        return moved;

    },

    /**
     * Stops a tween
     */
    stop: function (complete, callback, popped) {

        var element = this.obj;

        hAzzle.removeData(element, 'animate');

        if (complete) {

            var group = this.transitions,
                i, ar, prop;

            if (group) {

                i = group.length;

                while (i--) {

                    ar = group[i].stored;
                    prop = ar[0];

                    element.style[prop] = ar[1];
                    continue;

                    if (prop !== 'Opacity') {

                        element.style[prop] = ar[1];

                    } else {

                        element.filters.item('DXImageTransform.Microsoft.Alpha').Opacity = ar[1] * 100;

                    }

                }

            }

        }

        checkElement(this, element);
        if (callback) callback = this.onComplete;
        if (!popped) popTween(this, element, callback, this.onCompleteParams);

    }

};

// simulates a Tween and triggers 'onUpdate' callback on every frame/interval
function Tick(obj, sets) {

    if (!sets || !sets.onUpdate) return;

    length = dictionary.length;
    dictionary[length++] = obj['animate'] = this;

    var params = this.onCompleteParams = sets.onCompleteParams,
        callback = this.onComplete = sets.onUpdate,
	    easing = hAzzle.isFunction(hAzzle.easing[defaultEase]) ? hAzzle.easing[defaultEase] : hAzzle.easing[sets.ease];
 
    this.obj = obj;
    this.transitions = tick(obj, sets.duration || defaultDuration, easing, callback, params);

    (engineRunning) ? setTimeout(checkEngine, 10) : engine();

}

Tick.prototype = {

    // transition step
    cycle: function () {

        return this.transitions();

    },

    // stops a Tick tween
    stop: function (complete, callback, popped, finished) {

        var obj = this.obj;

        if (!obj) return;

        hAzzle.removeData(obj, 'animate');

        if (!popped) popTween(this);
        if (complete || finished) this.onComplete.apply(obj, [1, this.onCompleteParams]);

    }

};

// prepares a tween
function animation($this, obj, to, sets) {

    var key, 
	    i = 0,
        tweens = [],
        style = obj.style,
        duration = sets.duration || defaultDuration,
	    easing = hAzzle.isFunction(hAzzle.easing[defaultEase]) ? hAzzle.easing[defaultEase] : hAzzle.easing[sets.ease];
        style.visibility = 'visible';

       // FadeIn effect

        if (sets.fadeIn) {

            style.display = sets.display || 'block';
            style.opacity = 0;
        }

      if (to.borderColor) {

        var clr = to.borderColor;
         to.borderTopColor = clr;
         to.borderRightColor = clr;
         to.borderBottomColor = clr;
         to.borderLeftColor = clr;

         delete to.borderColor;
      }
	  
	  
    for (key in to) {

        if (!to.hasOwnProperty(key)) continue;
	
            if (key === "backgroundPosition") {

              tweens[i++] = bgPosition(obj, key, to[key], duration, easing);
            } else {

                tweens[i++] = animate(obj, key, to[key], duration, easing);
            }
    }

    $this.transitions = tweens;
    (engineRunning) ? setTimeout(checkEngine, 10) : engine();

}


   /**
    * Background animation
    **/

    function bgPosition(elem, prop, value, duration, ease) {

        var style = elem.style,
            val = style[prop],
            then = hAzzle.now(),
            passed = true,
            timed = 0,
            finalX,
            finalY,
            finish,
            prevX,
            prevY,
            hasX,
            hasY,
            difX,
            difY,
            tick,
            now,
            xx,
            yy,
            x,
            y;

        tick = (val !== "") ? val.split(" ") : compute(elem, null).backgroundPosition.split(" ");

        x = tick[0];
        y = tick[1];


        if (x.search("%") !== -1) {

            if (x !== "0%") passed = false;
        }

        if (y.search("%") !== -1) {

            if (y !== "0%") passed = false;
        }

        x = parseInt(x, 10);
        y = parseInt(y, 10);

        if (value.hasOwnProperty("x")) {

            xx = value.x;
            hasX = true;
        } else {
            xx = x;
            hasX = false;
        }

        if (value.hasOwnProperty("y")) {

            yy = value.y;
            hasY = true;

        } else {

            yy = y;
            hasY = false;

        }

        hasX = hasX && x !== xx;
        hasY = hasY && y !== yy;
        if (!hasX && !hasY) passed = false;

        difX = xx - x;
        difY = yy - y;
        finalX = xx + "px";
        finalY = yy + "px";
        finish = finalX + " " + finalY;

        function trans() {

            now = hAzzle.now();
            timed += now - then;
            then = now;

            tick = ease(timed, 0, 1, duration);

            if (tick < 0.99) {

                if (hasX) {

                    xx = ((x + (difX * tick)) + 0.5) | 0;

                }

                if (hasY) {

                    yy = ((y + (difY * tick)) + 0.5) | 0;

                }

                if (xx === prevX && yy === prevY) return true;

                prevX = xx;
                prevY = yy;

                style.backgroundPosition = xx + "px" + " " + yy + "px";

                return true;

            } else {
                style[prop] = finish;

                return false;
            }
        }

        function cancelled() {

            return false;
        }

        if (passed) {

            trans.stored = [prop, finish];
            return trans;

        } else {

            cancelled.stored = [prop, finish];
            return cancelled;
        }
    }




 /**
     * Parse colors
     *
     * @param {string} color
     */

    function parseColor(color) {
        var a;
        return (a = Pattern.aabbcc.exec(color)) ? [parseInt(a[1], 16), parseInt(a[2], 16), parseInt(a[3], 16), 1] : (a = Pattern.abc.exec(color)) ? [17 * parseInt(a[1], 16), 17 * parseInt(a[2], 16), 17 * parseInt(a[3], 16), 1] : (a = Pattern.rgbnn.exec(color)) ? [parseInt(a[1]), parseInt(a[2]), parseInt(a[3]), 1] : (a = Pattern.rgbann.exec(color)) ? [parseInt(a[1], 10), parseInt(a[2], 10), parseInt(a[3], 10), parseFloat(a[4])] : colors[color];

    }

    /**
     * Convert and animate colors. Background, borders etc.
     *
     * @param {Object} elem
     * @param {String} prop
     * @param {String} tick
     * @param {String} value
     * @param {String} duration
     * @param {Function} ease
     *
     * @return {Object}
     */

    function color(elem, prop, tick, value, duration, ease) {

        var pound = value.search("#") !== -1 ? "" : "#",
            finish = pound + value,
            then = hAzzle.now(),
            style = elem.style,
            passed = false,
            starts = [],
            ends = [],
            timed = 0,
            i = -1,
            now,
            clr,

            st;

        // Get start color from where we are going to animate
        starts = parseColor(tick);

        // Get end colors from where we are going to stop the animation
        ends = parseColor(value);

        i = -1;

        while (++i < 3)
            if (starts[i] !== ends[i]) passed = true;

        function trans() {

            now = hAzzle.now();
            timed += now - then;
            then = now;

            tick = ease(timed, 0, 1, duration);

            if (tick < 0.99) {

                i = -1;
                st = "rgb(";

                while (++i < 3) {

                    clr = starts[i];
                    st += (clr + tick * (ends[i] - clr)) | 0;
                    if (i < 2) st += ",";
                }


                style[prop] = st + ")";
                return true;

            } else {

                style[prop] = finish;
                return false;
            }
        }
        /**
         * Animation cancelled
         */
        function cancelled() {

            return false;
        }

        if (passed) {

            trans.stored = [prop, finish];
            return trans;

        } else {

            cancelled.stored = [prop, finish];
            return cancelled;
        }
    };










// function that runs for each animated property
function animate(obj, prop, value, duration, ease) {

    var opacity = prop === 'opacity',
        px = !opacity ? 'px' : 0,
        timed = 0,
        constant,
        finish,
        range,
        pTick,
        style,
        begin,
        then,
        tick,
        now,
        val;
//		alert(prop);

    style = obj.style;
    val = style[prop];

    tick = compute(obj, null)[prop];
;
  // Make sure we are not animation the background

        if (!/(auto|inherit|rgb|rgba|%|#)/.test(tick)) {

            tick = parseFloat(tick);

        } else {

            // If no RGB or RGBA colors, set tick to 0.

            if (!/(#|rgb|rgba)/.test(tick)) {

                tick = 0;

            } else {

                // Get the correct colors, and animate the background

                return color(obj, prop, tick, value, duration, ease);
            }
        }
  
    constant = value - tick;
    range = tick < value;
    finish = value + px;
    then = hAzzle.now();
    begin = tick;

    (range) ? value -= 1 : value += 1;

    function trans() {

        now = hAzzle.now();
        timed += now - then;
        tick = ease(timed, begin, constant, duration);
        then = now;


        tick = range ? (tick + 0.5) | 0 : (tick - 0.5) | 0;

        if (tick === pTick) return true;

        if (range) {

            if (tick >= value) {

                style[prop] = finish;

                return false;

            }

        } else if (tick <= value) {

            style[prop] = finish;

            return false;

        }

        pTick = tick;

        style[prop] = tick + px;

        return true;

    }

    trans.stored = [prop, finish];
    return trans;

}

// function that runs for every Tick step
function tick(obj, duration, ease, callback) {

    var tck, timed = 0,
        then = hAzzle.now(),
        now;

    return function () {

        now = hAzzle.now();
        timed += now - then;
        then = now;

        tck = ease(timed, 0, 1, duration);

        if (tck < 0.98) {

            callback.call(obj, tck);
            return true;

        }

        return false;

    };

}

// sets display for fadeIn/fadeOut
function checkElement(instance, element) {

    if (instance.fadeIn) {

        element.style.opacity = 1;
        element.style.visibility = 'visible';

    } else if (instance.fadeOut) {

        element.style.display = 'none';

    }

}

// checks to make sure the RAF ticker gets started
function checkEngine() {

    if (!engineRunning) engine();

}

// removes a tween from the animation stack
function popTween($this, element, callback, params) {

    dictionary.splice(dictionary.indexOf($this), 1);

    length = dictionary.length;

    if (callback) callback.apply(element, [params]);

}




hAzzle.extend({

easing: {

            'easeInQuad': function (t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            'easeOutQuad': function (t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            'easeInOutQuad': function (t, b, c, d) {
                return ((t /= d / 2) < 1) ? c / 2 * t * t + b : -c / 2 * ((--t) * (t - 2) - 1) + b;
            },
            easeInCubic: function (t, b, c, d) {
                return c * (t /= d) * t * t + b;
            },
            easeOutCubic: function (t, b, c, d) {
                return c * ((t = t / d - 1) * t * t + 1) + b;
            },
            easeInOutCubic: function (t, b, c, d) {
                return ((t /= d / 2) < 1) ? c / 2 * t * t * t + b : c / 2 * ((t -= 2) * t * t + 2) + b;
            },
            easeInQuart: function (t, b, c, d) {
                return c * (t /= d) * t * t * t + b;
            },
            easeOutQuart: function (t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            },
            easeInOutQuart: function (t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
                return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
            },
            easeInQuint: function (t, b, c, d) {
                return c * (t /= d) * t * t * t * t + b;
            },
            easeOutQuint: function (t, b, c, d) {
                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
            },
            easeInOutQuint: function (t, b, c, d) {
                return ((t /= d / 2) < 1) ? c / 2 * t * t * t * t * t + b : c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
            },
            easeInSine: function (t, b, c, d) {
                return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
            },
            easeOutSine: function (t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b;
            },
            easeInOutSine: function (t, b, c, d) {
                return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
            },
            easeInExpo: function (t, b, c, d) {
                return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
            },
            easeOutExpo: function (t, b, c, d) {
                return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
            },
            easeInOutExpo: function (t, b, c, d) {
                if (t === 0) return b;
                if (t === d) return b + c;
                if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;

                return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
            },
            easeInCirc: function (t, b, c, d) {
                return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
            },
            easeOutCirc: function (t, b, c, d) {
                return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
            },
            easeInOutCirc: function (t, b, c, d) {
                return ((t /= d / 2) < 1) ? -c / 2 * (Math.sqrt(1 - t * t) - 1) + b : c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
            },
            easeInElastic: function (t, b, c, d) {
                var s = 1.70158;
                var p = 0;
                var a = c;
                if (t === 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                if (a < Math.abs(c)) {
                    a = c;
                    s = p / 4;
                } else s = p / (2 * Math.PI) * Math.asin(c / a);
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            },
            easeOutElastic: function (t, b, c, d) {
                var s = 1.70158,
                    p = 0,
                    a = c;
                if (t === 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                if (a < Math.abs(c)) {
                    a = c;
                    var s = p / 4;
                } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
            },
            easeInOutElastic: function (t, b, c, d) {
                var s = 1.70158;
                var p = 0;
                var a = c;
                if (t === 0) return b;
                if ((t /= d / 2) == 2) return b + c;
                if (!p) p = d * (.3 * 1.5);
                if (a < Math.abs(c)) {
                    a = c;
                    s = p / 4;
                } else s = p / (2 * Math.PI) * Math.asin(c / a);
                if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
            },
            easeInBack: function (t, b, c, d, s) {
                if (s === undefined) s = 1.70158;
                return c * (t /= d) * t * ((s + 1) * t - s) + b;
            },

            easeOutBack: function (t, b, c, d, s) {
                if (s === undefined) s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            },
            easeInOutBack: function (t, b, c, d, s) {
                if (s === undefined) s = 1.70158;
                if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
            },
            easeOutBounce: function (t, b, c, d) {
                if ((t /= d) < (1 / 2.75)) {
                    return c * (7.5625 * t * t) + b;
                } else if (t < (2 / 2.75)) {
                    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                } else if (t < (2.5 / 2.75)) {
                    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                } else {
                    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                }
            }

     },

    stopAll: function (complete) {

        length = 0;
        (cancel) ? cancel(engine) : clearInterval(timer);

        var i = dictionary.length;
        while (i--) dictionary[i].stop(complete, false, true, true);

        dictionary = [];
        engineRunning = false;

    },

    /**
	 * Set the default easing function	
	 */ 

    setEase: function (easing) {
        defaultEase = easing;
    },

    /**
	 * Set default duration
	 */ 

    setDuration: function (num) {
        defaultDuration = num;
    }

});


hAzzle.fn.extend({


    animate: function (to, sets, callback) {
        return this.each(function () {
            new Tween(this, to, sets || {}, callback);
        });
    },

    /**
     * Simulate a tween and call a custom onUpdate function
     */

    tick: function (sets) {

        return this.each(function () {
            if (this['animate']) this['animate'].stop();
            new Tick($this, sets);
        });
    },

    /**
     *  FadeIn an element
     *
     */

    fadeIn: function (sets) {

    },

    /**
     *  FadeOut an element
     *
     */

    fadeOut: function (sets) {},

    /** 
     * Stop any running tweens on the element
     */

    stop: function (complete, triggerCallback) {

        return this.each(function () {
            var itm = this['animate'];
            if (!itm) return this;
            itm.stop(complete, triggerCallback)
        });
    },

    /**
     * Stops all tweens of a given element and all its children
     */

    stopAll: function (complete, triggerCallback) {

        return this.each(function () {
            var children = this.getElementsByTagName('*'),
                leg = children.length;
            while (leg--) checkInstance(children[leg]).stop(complete, triggerCallback);
            return this;
        });

    }


});
