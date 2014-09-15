// fx.js
// NOTE!! For 'converters' from jQuery to hAzzle, this
// animation engine have the same basics as jQuery regarding
// tweening and preFilters, but the code itself are different.
var
// 'fxFrame' is the requestAnimationFrame shim we are using
// Sending a number into the shim will adjust the 
// framerate. E.g. hAzzle.RAF(20) change the frame rate to
// 20 FPS

    fxFrame = hAzzle.RAF(),
    fxRelVal = /^([+-\/*])=/,
    fxFontLineVal = /^(fontSize|lineHeight)$/,
    fxScaleVal = /^scale/,
    fxReGrBlVal = /(Red|Green|Blue)$/i,
    fxOpVal = /[\/*]/,
    fxMplrwtwlVal = /margin|padding|left|right|width|text|word|letter/i,
    fxVal = /X$/,
    fxQueueHooks = /fxQueueHooks$/,
    sheets = [],
    fxPrefix = 'oTween',
    rafId,

    // Ticker 

    runAnimation = function() {

        var raf = (function(timestamp) {

            // Ignore the first timestamp arguments since it's empty / undefined and indicates that this is 
            // the first tick occurence since ticking was turned on.

            if (timestamp) {

                if (rafId) {

                    var sheet, i = 0;

                    fxFrame.request(raf);

                    for (; i < sheets.length; i++) {

                        sheet = sheets[i];

                        if (!sheet(timestamp) && sheets[i] === sheet) {
                            sheets.splice(i--, 1);
                        }
                    }

                    // If no length, cancel the animation

                    if (!sheets.length) {
                        fxFrame.cancel(rafId);
                        rafId = null;
                    }
                }
            }
        });

        // Only run the animation if there is no rafId

        if (!rafId) {
            rafId = fxFrame.request(raf);
        }
    },

    // Compability with jQuery API

    tweeners = {

        '*': [
            function(prop, value) {

                // Create a new 'tween' instance

                var tween = this.createTween(prop, value),
                    elem = tween.elem,
                    start = tween.cur(),
                    end = value,
                    unitConversionData,
                    splittedValues,
                    endUnit,
                    startUnit,
                    operator;
                if (!hAzzle.unitless[prop]) {
                    // Split the start value ...

                    splittedValues = splitValues(prop, start);

                    // .. grab it, and...

                    start = splittedValues[0];

                    // get the correct unit type

                    startUnit = splittedValues[1];

                    // Same process for end value as for start value

                    splittedValues = splitValues(prop, end);

                    // Extract a value operator (e.g. '+=', '*=', '/=') if one exists

                    end = splittedValues[0].replace(fxRelVal, function(match, subMatch) {
                        operator = subMatch;
                        return '';
                    });

                    endUnit = splittedValues[1];

                    // ParseFloat end and start value. Default to 0 if NaN is returned.

                    start = parseFloat(start) || 0;
                    end = parseFloat(end) || 0;

                    if (endUnit === '%') {
                        if (fxFontLineVal.test(prop)) {
                            end = end / 100;
                            endUnit = 'em';
                        } else if (fxScaleVal.test(prop)) {
                            end = end / 100;
                            endUnit = '';
                        } else if (fxReGrBlVal.test(prop)) {
                            end = (end / 100) * 255;
                            endUnit = '';
                        }
                    }

                    // The '*' and '/' operators, which are not passed in with an associated unit,
                    // inherently use start's unit. Skip value and unit conversion.

                    if (fxOpVal.test(operator)) {
                        endUnit = startUnit;
                    } else if ((startUnit !== endUnit) && start !== 0) {

                        if (end === 0) {
                            endUnit = startUnit;
                        } else {

                            unitConversionData = unitConversionData || calculateUnitRatios(elem);

                            var axis = (fxMplrwtwlVal.test(prop) ||
                                fxVal.test(prop) || prop === 'x') ? 'x' : 'y';

                            if (startUnit === '%') {

                                start *= (axis === 'x' ? unitConversionData.percentToPxWidth :
                                    unitConversionData.percentToPxHeight);

                                // px acts as our midpoint in the unit conversion process; do nothing.                                    

                            } else if (startUnit === 'px') {} else {
                                start *= unitConversionData[startUnit + 'ToPx'];
                            }

                            // Invert the px ratios to convert into to the target unit.

                            if (endUnit === '%') {

                                start *= 1 / (axis === 'x' ? unitConversionData.lastpToPW :
                                    unitConversionData.lastToPH);
                                // start is already in px, do nothing; we're done.                                    

                            } else if (endUnit === 'px') {} else {
                                start *= 1 / unitConversionData[endUnit + 'ToPx'];
                            }
                        }
                    }

                    // Support for relative movement via '+=n', '-=n', '*=n' or '/=n'

                    if (operator === '+') {
                        end = start + end;
                    } else if (operator === '-') {
                        end = start - end;
                    } else if (operator === '*') {
                        end = start * end;
                    } else if (operator === '/') {
                        end = start / end;
                    }

                    // Prototype value...

                    tween.end = end;
                    tween.start = start;
                    tween.unit = endUnit;

                    // Return the newly created tween object
                }
                return tween;
            }
        ]
    },
    animationPrefilters = [defaultPrefilter];

// Extend the global hAzzle object

hAzzle.extend({

    // Default duration - can be overwritten with
    // plug-ins

    defaultEasing: 'swing',

    // Default duration - can be overwritten with
    // plug-ins

    defaultDuration: 500,

    // Contains a object over CSS properties that should
    // be backed up before animation, and restored after
    // animation are completed

    originalValues: {
        boxSizing: null,
    },

    // Support jQuery's named durations

    speeds: {
        fast: 100,
        medium: 400,
        slow: 1200,
    }

}, hAzzle);

hAzzle.extend({

    animate: function(prop, speed, easing, callback) {

        // Process everything before we start the animation

        var opt = {};

        if (typeof speed === 'object') {
            opt = speed;
        }

        /**********************
         Option: complete
        **********************/

        opt.complete = opt.complete ?
            opt.complete :
            callback ? callback :
            !callback && easing ? easing :
            (callback || !callback && easing || hAzzle.isFunction(speed) && speed);

        // 'complete' has to be function. Otherwise, default to null.

        if (opt.complete && typeof opt.complete !== 'function') {
            opt.complete = null;
        }

        /**********************
         Option: begin
        **********************/

        // 'begin' has to be function. Otherwise, default to null.

        if (opt.begin && typeof opt.begin !== 'function') {
            opt.begin = null;
        }

        /**********************
         Option: duration
        **********************/

        if (document.hidden) {
            opt.duration = 0;
        } else {
            opt.duration = typeof speed === 'number' ? speed :
                typeof opt.duration === 'number' ?
                opt.duration : opt.duration in hAzzle.speeds ?
                hAzzle.speeds[opt.duration] : hAzzle.defaultDuration;
        }

        /**********************
         Option: easing
        **********************/

        opt.easing = opt.easing ?
            opt.easing :
            callback && easing ? easing :
            !callback && speed && easing ? easing :
            !callback && !easing && typeof speed === 'number' ? speed :
            typeof easing !== 'function' && easing;

        /**********************
         Option: mobile
        **********************/

        // When set to true, and if this is a mobile device, mobile automatically 
        // enables hardware acceleration (via a null transform hack) on animating elements.
        // Note! This are only for plugins such as CSS transformation

        opt.mobile = opt.mobile && hAzzle.isMobile;

        /**********************
         Option: Queueing
        **********************/

        if (opt.queue == null || opt.queue === true) {
            opt.queue = 'fx';
        }

        opt.old = opt.complete;

        opt.complete = function() {
            if (hAzzle.isFunction(opt.old)) {
                opt.old.call(this);
            }

            if (opt.queue) {
                hAzzle.dequeue(this, opt.queue);
            }
        };

        // Start the animation

        var empty = hAzzle.isEmptyObject(prop),
            doAnimation = function() {

                // Function to be 'fired before the animation starts
                // Executed functions param will be same as the animated element

                if (opt.begin) {

                    // We throw callbacks in a setTimeout so that thrown errors don't halt the execution 
                    // of hAzzle itself.

                    try {
                        opt.begin.call(this, this);
                    } catch (error) {
                        setTimeout(function() {
                            throw 'Something went wrong!';
                        }, 1);
                    }
                }

                // Set up the elements cache

                hAzzle.styleCache(this);

                var anim = Animation(this, quickCopy({}, prop), opt);

                // Empty animations, or finishing resolves immediately

                if (empty || hAzzle.private(this, 'finish')) {
                    anim.stop(true);
                }
            };

        doAnimation.finish = doAnimation;

        if (empty || opt.queue === false) {
            return this.each(doAnimation);
        } else {
            return this.queue(opt.queue, doAnimation);
        }
    },
    stop: function(type, clearQueue, gotoEnd) {

        if (typeof type !== 'string') {
            gotoEnd = clearQueue;
            clearQueue = type;
            type = undefined;
        }

        var i = this.length,
            index = type != null && type + 'fxQueueHooks',
            data, dequeue = true,
            elem,
            stopQueue = function(hooks) {
                var stop = hooks.stop;
                delete hooks.stop;
                stop(gotoEnd);
            };

        if (clearQueue && type !== false) {
            this.queue(type || 'fx', []);
        }

        while (i--) {

            elem = this[i];
            data = hAzzle.private(elem);

            if (index) {

                if (data[index] && data[index].stop) {
                    stopQueue(data[index]);
                }

            } else {

                for (index in data) {

                    if (data[index] && data[index].stop && fxQueueHooks.test(index)) {
                        stopQueue(data[index]);
                    }
                }
            }


            for (index = sheets.length; index--;) {
                if (sheets[index].elem === elem &&
                    (type == null || sheets[index].queue === type)) {

                    sheets[index].anim.stop(gotoEnd);
                    dequeue = false;
                    sheets.splice(index, 1);
                }
            }

            if (dequeue || !gotoEnd) {

                hAzzle.dequeue(elem, type);
            }
        }
    },
    finish: function(type) {
        if (type !== false) {
            type = type || 'fx';
        }
        return this.each(function() {
            var index,
                data = hAzzle.private(this),
                queue = data[type + 'queue'],
                hooks = data[type + 'fxQueueHooks'],
                length = queue ? queue.length : 0;

            // Enable finishing flag on private data
            data.finish = true;

            // Empty the queue first
            hAzzle.queue(this, type, []);

            if (hooks && hooks.stop) {
                hooks.stop.call(this, true);
            }

            // Look for any active animations, and finish them
            for (index = sheets.length; index--;) {
                if (sheets[index].elem === this && sheets[index].queue === type) {
                    sheets[index].anim.stop(true);
                    sheets.splice(index, 1);
                }
            }

            // Look for any animations in the old queue and finish them
            for (index = 0; index < length; index++) {
                if (queue[index] && queue[index].finish) {
                    queue[index].finish.call(this);
                }
            }

            // Turn off finishing flag
            delete data.finish;
        });
    }
});

/* ============================ UTILITY METHODS =========================== */

function defaultPrefilter(elem, props, opts) {

    var prop, value, toggle, tween,
        hooks, oldfire, display, checkDisplay,
        anim = this,
        orgValueProp,
        orig = {},
        style = elem.style,
        hidden = elem.nodeType && isHidden(elem),
        storage = hAzzle.private(elem, fxPrefix);

    if (!opts.queue) {
        hooks = hAzzle._fxQueueHooks(elem, 'fx');
        if (hooks.unqueued == null) {
            hooks.unqueued = 0;
            oldfire = hooks.empty.fire;
            hooks.empty.fire = function() {
                if (!hooks.unqueued) {
                    oldfire();
                }
            };
        }
        hooks.unqueued++;

        anim.always(function() {
            // Ensure the complete handler is called before this completes
            anim.always(function() {
                hooks.unqueued--;
                if (!hAzzle.queue(elem, 'fx').length) {
                    hooks.empty.fire();
                }
            });
        });
    }

    /********************
      Options parsing
    ********************/

    if (props.display !== undefined && props.display !== null) {
        props.display = props.display.toString().toLowerCase();

        if (props.display === 'auto') {
            props.display = hAzzle.getDisplayType(elem);
        }

        // Save the state

        hAzzle.private(elem, 'CSS').opts.display === props.display;

        anim.done(function() {
            elem.style.display = props.display;
        });
    }

    if (props.visibility) {
        props.visibility = props.visibility.toString().toLowerCase();

        // Save the state

        hAzzle.private(elem, 'CSS').opts.visibility === props.visibility;

        anim.done(function() {
            elem.style.visibility = props.visibility;
        });
    }

    /********************
      Reversing
    ********************/

    if (opts.reverse) {
        props = reversing(elem, props);
    }

    /********************
         Original values
      ********************/

    opts.originalValues = {};

    for (orgValueProp in hAzzle.originalValues) {
        opts.originalValues[orgValueProp] = elem.style[orgValueProp];
    }

    // Restore original CSS values after animation are finished 

    anim.done(function() {
        var oVP, oValues = opts.originalValues;
        for (oVP in oValues) {
            style[oVP] = oValues[oVP];
        }
    });

    /********************
      Height / width
    ********************/

    if (elem.nodeType === 1) {

        if ('height' in props ||
            'width' in props) {

            opts.overflow = [style.overflow, style.overflowX, style.overflowY];
        }

        /**********************
          Display / Visibility
        ***********************/

        // Get correct display. Its faster for us to use hAzzle.curCSS directly then
        // hAzzle.css. In fact we gain better performance skipping a lot of checks

        display = curCSS(elem, 'display');

        // Test default display if display is currently 'none'
        checkDisplay = display === 'none' ?
            hAzzle.getPrivate(elem, 'olddisplay') || getDisplayType(elem) : display;

        if (checkDisplay === 'inline') {
            style.display = 'inline-block';
        }
    }

    if (opts.overflow) {
        style.overflow = 'hidden';
        anim.always(function() {
            style.overflow = opts.overflow[0];
            style.overflowX = opts.overflow[1];
            style.overflowY = opts.overflow[2];
        });
    }

    for (prop in props) {

        value = props[prop];

        /********************************************
          Support for jQuery's show, hide and toggle
        *******************************************/

        if (value === 'toggle' ||
            value === 'show' ||
            value === 'hide'
        ) {
            delete props[prop];

            toggle = toggle || value === 'toggle';

            if (value === (hidden ? 'hide' : 'show')) {

                if (value === 'show' && storage && storage[prop] !== undefined) {
                    hidden = true;
                } else {
                    continue;
                }
            }

            orig[prop] = storage && storage[prop] || elem.style[prop];

            // Any non-fx value stops us from restoring the original display value
        } else {
            display = undefined;
        }
    }

    // End of iteration

    if (!hAzzle.isEmptyObject(orig)) {
        if (storage) {
            if ('hidden' in storage) {
                hidden = storage.hidden;
            }
        } else {
            storage = hAzzle.private(elem, fxPrefix, {});
        }

        // Store state if its toggle - enables .stop().toggle() to 'reverse'
        if (toggle) {
            storage.hidden = !hidden;
        }

        if (hidden) {
            hAzzle(elem).show();
        } else {

            // Display can be set as a option, so no need to run
            // the 'done' function twice if the user choose to hide / show
            // the element through the options

            if (!opts.display) {
                anim.done(function() {
                    hAzzle(elem).hide();
                });
            }
        }
        anim.done(function() {
            var prop;

            hAzzle.removePrivate(elem, fxPrefix);
            for (prop in orig) {
                setCSS(elem, prop, orig[prop]);
            }
        });

        for (prop in orig) {
            tween = createTween(hidden ? storage[prop] : 0, prop, anim);

            if (!(prop in storage)) {
                storage[prop] = tween.start;
                if (hidden) {

                    tween.end = tween.start;
                    tween.start = prop === 'width' || prop === 'height' ? 1 : 0;
                }
            }
        }

    } else if ((display === 'none' ?
        defaultDisplay(elem.nodeName) :
        display) === 'inline') {
        style.display = display;
    }
}

// Create Tween

function createTween(value, prop, animation) {
    var tween, collection = (tweeners[prop] || []).concat(tweeners['*']),
        index = 0,
        length = collection.length;

    for (; index < length; index++) {

        if ((tween = collection[index].call(animation, prop, value))) {
            return tween;
        }
    }
}

function propFilter(elem, props, specialEasing) {

    var index, name, easing, value, hooks;

    for (index in props) {

        name = hAzzle.camelize(index);

        // Properties that are not supported by the browser will inherently produce no style changes 
        // when set, so they are skipped in order to decrease animation tick overhead.
        // Note: Since SVG elements have some of their properties directly applied as HTML attributes,
        // there is no way to check for their explicit browser support, and so we skip this check for them.

        if (!hAzzle.private(elem).isSVG && hAzzle.prefixCheck(name)[1] === false) {
            hAzzle.error('Skipping [' + name + '] due to a lack of browser support.');
            continue;
        }

        easing = specialEasing[name];

        value = props[index];

        if (hAzzle.isArray(value)) {

            easing = value[1];
            value = props[index] = value[0];
        }

        if (index !== name) {
            props[name] = value;
            delete props[index];
        }

        specialEasing[name] = easing;
    }
}

// Quick and fast copy of objects
function quickCopy(target, src) {
    for (var i in src) {
        target[i] = src[i];
    }
    return target;
}

// Unique Map function for the animation engine
// Optimized

function TweenMap(elems, callback, arg) {

    var value, i, ret = [];

    for (i in elems) {
        value = callback(elems[i], i, arg);


        if (value !== null) {
            ret.push(value);
        }
    }
    // Flatten any nested arrays

    return Array.prototype.concat.apply([], ret);
}

function reversing(elem, props) {

    // If the element was hidden via the display option in the 
    // previous call, revert display to block prior to reversal so 
    // that the element is visible again.

    if (hAzzle.private(elem, 'CSS').opts.display === 'none') {
        hAzzle.private(elem, 'CSS').opts.display = 'block';
    }

    // Swap around the object values

    var ara = {},
        arr = Object.keys(props),
        i = arr.length;

    while (i--) {
        ara[arr[i]] = props[arr[i]];
    }
    return ara;
}

// Separates a property value into its numeric value and its unit type.

function splitValues(prop, value) {
    var unitType,
        numericValue;

    numericValue = (value || 0)
        .toString()
        .toLowerCase()
        .replace(/[%A-z]+$/, function(match) {
            unitType = match;
            return '';
        });

    // If no unit type was supplied, assign one that is appropriate for this 
    // property (e.g. 'deg' for rotateZ or 'px' for width)

    if (!unitType) {
        unitType = hAzzle.getUnitType(prop);
    }

    return [numericValue, unitType];
}

function Animation(elem, properties, options) {

    var result,
        stopped,
        index = 0,
        length = animationPrefilters.length,
        promises = hAzzle.Promises().always(function() {
            delete tick.elem;
        }),
        tick = function() {
            if (stopped) {
                return false;
            }
            var currentTime = fxFrame.perfNow(),
                remaining = Math.max(0, animation.startTime + animation.duration - currentTime),
                temp = remaining / animation.duration || 0,
                percent = 1 - temp,
                index = 0,
                length = animation.tweens.length;


            // Iterate through each active animation

            for (; index < length; index++) {

                animation.tweens[index].run(percent);
            }

            // Progress indicator
            // Opt: progress {Function}

            promises.notifyWith(elem, [animation, percent, remaining]);

            if (percent < 1 && length) {
                return remaining;
            } else {
                stopped = true;
                promises.resolveWith(elem, [animation]);
                return false;
            }
        },
        animation = promises.promise({
            elem: elem,
            props: quickCopy({}, properties),
            opts: hAzzle.shallowCopy(true, {
                specialEasing: {}
            }, options),
            originalProperties: properties,
            originalOptions: options,
            startTime: fxFrame.perfNow(),
            duration: options.duration,
            tweens: [],
            createTween: function(prop, end) {
                var tween = hAzzle.Tween(elem, animation.opts, prop, end,
                    animation.opts.specialEasing[prop] || animation.opts.easing);
                animation.tweens.push(tween);
                return tween;
            },
            stop: function(gotoEnd) {

                var index = 0,
                    // If we are going to the end, we want to run all the tweens
                    // otherwise we skip this part
                    length = gotoEnd ? animation.tweens.length : 0;
                if (stopped) {
                    return this;
                }

                stopped = true;
                for (; index < length; index++) {
                    animation.tweens[index].run(1);
                }

                // Resolve when we played the last fxFrame; otherwise, reject
                if (gotoEnd) {
                    promises.resolveWith(elem, [animation, gotoEnd]);
                } else {
                    promises.rejectWith(elem, [animation, gotoEnd]);
                }

                return this;
            }
        }),
        props = animation.props;

    // Parse CSS properties, and decrease animation tick overhead

    propFilter(elem, props, animation.opts.specialEasing);

    for (; index < length; index++) {
        result = animationPrefilters[index].call(animation, elem, props, animation.opts);
        if (result) {
            return result;
        }
    }

    TweenMap(props, createTween, animation);

    if (typeof animation.opts.start === 'function') {
        animation.opts.start.call(elem, animation);
    }

    tick.elem = elem;
    tick.anim = animation;
    tick.queue = animation.opts.queue;

    // Create the animation sheets

    sheets.push(tick);

    // If 'tick' is a function, start the animation

    if (tick()) {
        runAnimation();

    } else {
        sheets.pop();
    }

    // attach callbacks from options
    return animation.progress(animation.opts.progress)
        .done(animation.opts.done, animation.opts.complete)
        .fail(animation.opts.fail)
        .always(animation.opts.always);
}

Animation.tweener = function(props, callback) {

    if (hAzzle.isFunction(props)) {
        callback = props;
        props = ['*'];
    } else {
        props = props.split(' ');
    }

    var prop,
        index = 0,
        length = props.length;

    for (; index < length; index++) {
        prop = props[index];
        tweeners[prop] = tweeners[prop] || [];
        tweeners[prop].unshift(callback);
    }
};

Animation.prefilter = function(callback, prepend) {

    if (prepend) {
        animationPrefilters.unshift(callback);
    } else {
        alert(callback)
        animationPrefilters.push(callback);
    }
};

function Tween(elem, options, prop, end, easing) {
    return new Tween.prototype.init(elem, options, prop, end, easing);
}

Tween.prototype = {
    constructor: Tween,
    init: function(elem, options, prop, end, easing) {

        this.elem = elem;
        this.prop = prop;
        this.easing = hAzzle.easing[easing] || hAzzle.easing[hAzzle.defaultEasing];
        this.duration = options.duration;
        this.options = options;
        this.step = options.step;
        this.start = this.now = this.cur();
        this.end = end;
        this.unit = '';
    },
    cur: function() {

        var value;

        // 'cssHook - animation' are special hooks' not natively supported
        // by the CSS module

        if (cssHook.animation[this.prop]) {
            value = cssHook.animation.get[this.prop](this.elem, this.prop)
        } else {
            value = getCSS(this.elem, this.prop);
        }

        // Since property lookups are for animation purposes (which entails 
        // computing the numeric delta between start and end values),
        // convert CSS null-values to an integer of value 0.

        if (hAzzle.isZeroValue(value)) {
            value = 0;
        }
        return value;
    },
    run: function(tick) {

        var pos;

        if (this.duration) {

            this.pos = pos = this.easing(tick);

        } else {

            this.pos = pos = tick;
        }

        // Current value
        this.now = (this.end - this.start) * pos + this.start;

        if (this.step) {
            this.step.call(this.elem, this.now, this);
        }

        setCSS(this.elem, this.prop, this.now + this.unit, true);

        return this;
    }
};

Tween.prototype.init.prototype = Tween.prototype;

// Expose

hAzzle.Tween = Tween;