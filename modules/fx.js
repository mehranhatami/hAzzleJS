// fx.js
var
// 'frame' is the requestAnimationFrame shim we are using
// Sending a number into the shim will adjust the 
// framerate. E.g. hAzzle.RAF(20) change the frame rate to
// 20 FPS

    frame = hAzzle.RAF(),
    relVal = /^(?:([+-])=|)([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))([a-z%]*)$/i,
    queueHooks = /queueHooks$/,
    fixTick = false, // feature detected below
    rafId,

    // Ticker 

    runAnimation = function() {

        var raf = (function() {

            if (rafId) {

                var timer,
                    timers = hAzzle.timers,
                    i = 0;

                frame.request(raf);

                for (; i < timers.length; i++) {

                    timer = timers[i];

                    if (!timer() && timers[i] === timer) {
                        timers.splice(i--, 1);
                    }
                }

                // If no length, cancel the animation

                if (!timers.length) {
                    frame.cancel(rafId);
                    rafId = null;
                }
            }
        });

        // Only run the animation if there is no rafId

        if (!rafId) {
            rafId = frame.request(raf);
        }
    },

    // Support for jQuery API
    // NOTE!! This will be changed soon

    tweeners = {

        '*': [
            function(prop, value) {
                var tween = this.createTween(prop, value),
                    target = tween.cur(),
                    parts = relVal.exec(value),
                    unit = parts && parts[3] || (hAzzle.unitless[prop] ? '' : 'px'),

                    // Starting value computation is required for potential unit mismatches
                    start = (hAzzle.unitless[prop] || unit !== 'px' && +target) &&
                    relVal.exec(hAzzle.css(tween.elem, prop)),
                    scale = 1,
                    maxIterations = 20;

                if (start && start[3] !== unit) {

                    unit = unit || start[3];

                    // Make sure we update the tween properties later on
                    parts = parts || [];

                    // Iteratively approximate from a nonzero starting point
                    start = +target || 1;

                    do {
                        // If previous iteration zeroed out, double until we get *something*.
                        // Use string for doubling so we don't accidentally see scale as unchanged below
                        scale = scale || '.5';

                        // Adjust and apply
                        start = start / scale;
                        hAzzle.style(tween.elem, prop, start + unit);

                        // Update scale, tolerating zero or NaN from tween.cur(),
                        // break the loop if scale is unchanged or perfect, or if we've just had enough
                    } while (
                        scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations
                    );
                }

                // Update tween properties
                if (parts) {

                    start = tween.start = +start || +target || 0;
                    tween.unit = unit;

                    // If a +=/-= token was provided, we're doing a relative animation
                    tween.end = parts[1] ? start + (parts[1] + 1) * parts[2] : +parts[2];

                }

                return tween;
            }
        ]
    },

    animationPrefilters = [defaultPrefilter];

// Extend the global hAzzle object

hAzzle.extend({

    timers: [],

    // Contains a object over CSS properties that should
    // be backed up before animation, and restored after
    // animation are completed

    originalValues: {
        boxSizing: null,
    },

    // Plug-in / hook for overriding the values of CSS properties
    // that are being animated.

    propertyMap: {

        display: function(elem, value) {

            // If the element was hidden in the previous call, revert display 
            // to 'auto' prior to reversal so that the element is visible again.

            if ((value = hAzzle.data(elem, 'display')) === 'none') {
                hAzzle.data(elem, 'display', 'auto');
            }

            // Store the display value

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

            // Store the visibility value

            hAzzle.data(elem, 'visibility', value);

            return value;
        }
    },

    // Support for jQuery's named durations
    speeds: {
        slow: 600,
        fast: 200,
        // Default speed
        _default: 400
    }

}, hAzzle)


hAzzle.extend({

    animate: function(prop, speed, easing, callback) {

        if (typeof speed === 'object') {

            opt = hAzzle.shallowCopy({}, speed);

        } else {

            opt = {};

            // Callbacks

            opt.complete = callback || !callback && easing || hAzzle.isFunction(speed) && speed;

            // Duration

            opt.duration = speed;

            // Easing

            opt.easing = callback && easing || easing && !hAzzle.isFunction(easing) && easing;
        }

        // Go to the end state if fx are off or if document is hidden
        if (hAzzle.fx.off || document.hidden) {
            opt.duration = 0;

        } else {
            opt.duration = typeof opt.duration === 'number' ?
                opt.duration : opt.duration in hAzzle.speeds ?
                hAzzle.speeds[opt.duration] : hAzzle.speeds._default;
        }

        if (opt.queue == null || opt.queue === true) {
            opt.queue = 'fx';
        }

        // Queueing
        opt.old = opt.complete;

        opt.complete = function() {
            if (hAzzle.isFunction(opt.old)) {
                opt.old.call(this);
            }

            if (opt.queue) {
                hAzzle.dequeue(this, opt.queue);
            }
        };

        var empty = hAzzle.isEmptyObject(prop),
            optall = opt,
            doAnimation = function() {
                // Operate on a copy of prop so per-property easing won't be lost
                var anim = Animation(this, hAzzle.shallowCopy({}, prop), opt);

                // Empty animations, or finishing resolves immediately
                if (empty || hAzzle.private(this, 'finish')) {
                    anim.stop(true);
                }
            };

        doAnimation.finish = doAnimation;

        return empty || opt.queue === false ?
            this.each(doAnimation) :
            this.queue(opt.queue, doAnimation);
    },
    stop: function(type, clearQueue, gotoEnd) {
        var stopQueue = function(hooks) {
            var stop = hooks.stop;
            delete hooks.stop;
            stop(gotoEnd);
        };

        if (typeof type !== 'string') {
            gotoEnd = clearQueue;
            clearQueue = type;
            type = undefined;
        }
        if (clearQueue && type !== false) {
            this.queue(type || 'fx', []);
        }

        return this.each(function() {
            var dequeue = true,
                index = type != null && type + 'queueHooks',
                timers = hAzzle.timers,
                data = hAzzle.getPrivate(this);

            if (index) {
                if (data[index] && data[index].stop) {
                    stopQueue(data[index]);
                }
            } else {
                for (index in data) {
                    if (data[index] && data[index].stop && queueHooks.test(index)) {
                        stopQueue(data[index]);
                    }
                }
            }

            for (index = timers.length; index--;) {
                if (timers[index].elem === this &&
                    (type == null || timers[index].queue === type)) {

                    timers[index].anim.stop(gotoEnd);
                    dequeue = false;
                    timers.splice(index, 1);
                }
            }

            if (dequeue || !gotoEnd) {
                hAzzle.dequeue(this, type);
            }
        });
    },
    finish: function(type) {
        if (type !== false) {
            type = type || 'fx';
        }
        return this.each(function() {
            var index,
                data = hAzzle.private(this),
                queue = data[type + 'queue'],
                hooks = data[type + 'queueHooks'],
                timers = hAzzle.timers,
                length = queue ? queue.length : 0;

            // Enable finishing flag on private data
            data.finish = true;

            // Empty the queue first
            hAzzle.queue(this, type, []);

            if (hooks && hooks.stop) {
                hooks.stop.call(this, true);
            }

            // Look for any active animations, and finish them
            for (index = timers.length; index--;) {
                if (timers[index].elem === this && timers[index].queue === type) {
                    timers[index].anim.stop(true);
                    timers.splice(index, 1);
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
        originalValues,
        orig = {},
        style = elem.style,
        hidden = elem.nodeType && isHidden(elem),
        dataShow = hAzzle.getPrivate(elem, 'fxshow');

    // Handle queue: false promises
    if (!opts.queue) {
        hooks = hAzzle._queueHooks(elem, 'fx');
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
         Original values
      ********************/

    if (elem.nodeType === 1) {

        opts.originalValues = {};

        for (orgValueProp in hAzzle.originalValues) {
            opts.originalValues[orgValueProp] = elem.style[orgValueProp];
        }
    }

    /********************
      Height / width
    ********************/

    if (props === 'height' ||
        props === 'width') {

    }

    // Height/width overflow pass
    if (('height' in props || 'width' in props)) {

        // Make sure we are not overriding any effects

        props.overflow ? props.overflow : opts.originalValues.overflow = style.overflow;
        props.overflowX ? props.overflowX : opts.originalValues.overflowX = style.overflowX;
        props.overflowY ? props.overflowY : opts.originalValues.overflowY = style.overflowY;

        if (opts.originalValues.overflow) {
            style.overflow = 'hidden';
        }
    }

    anim.done(function() {

        originalValues = opts.originalValues;

        for (orgValueProp in originalValues) {
            style[orgValueProp] = originalValues[orgValueProp];
        }
    });

    /**********************
      Display / Visibility
    ***********************/

    // Get correct display. Its faster for us to use hAzzle.curCSS directly then
    // hAzzle.css. In fact we gain better performance skipping a lot of checks

    display = hAzzle.curCSS(elem, 'display');

    // Test default display if display is currently 'none'
    checkDisplay = display === 'none' ?
        hAzzle.getPrivate(elem, 'olddisplay') || hAzzle.getDisplayType(elem) : display;

    if (checkDisplay === 'inline') {
        style.display = 'inline-block';
    }

    // show/hide pass
    for (prop in props) {

        value = props[prop];

        // Properties that are not supported by the browser will inherently produce no style changes 
        // when set, so they are skipped in order to decrease animation tick overhead.
        // Note: Since SVG elements have some of their properties directly applied as HTML attributes,
        // there is no way to check for their explicit browser support, and so we skip this check for them.

        if (!hAzzle.private(elem).isSVG && hAzzle.prefixCheck(prop)[1] === false) {
            hAzzle.error('Skipping [' + prop + '] due to a lack of browser support.');
            continue;
        }

        // propertyMap hook for option parsing

        if (hAzzle.propertyMap[prop]) {
            value = hAzzle.propertyMap[name](elem, name);
        }

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

                if (value === 'show' && dataShow && dataShow[prop] !== undefined) {
                    hidden = true;
                } else {
                    continue;
                }
            }
            orig[prop] = dataShow && dataShow[prop] || hAzzle.style(elem, prop);

            // Any non-fx value stops us from restoring the original display value
        } else {
            display = undefined;
        }
    }

    // End of iteration

    if (!hAzzle.isEmptyObject(orig)) {
        if (dataShow) {
            if ('hidden' in dataShow) {
                hidden = dataShow.hidden;
            }
        } else {
            dataShow = hAzzle.private(elem, 'fxshow', {});
        }

        // Store state if its toggle - enables .stop().toggle() to 'reverse'
        if (toggle) {
            dataShow.hidden = !hidden;
        }
        if (hidden) {
            hAzzle(elem).show();
        } else {
            anim.done(function() {
                hAzzle(elem).hide();
            });
        }
        anim.done(function() {
            var prop;

            hAzzle.removePrivate(elem, 'fxshow');
            for (prop in orig) {
                hAzzle.style(elem, prop, orig[prop]);
            }
        });
        for (prop in orig) {
            tween = createTween(hidden ? dataShow[prop] : 0, prop, anim);

            if (!(prop in dataShow)) {
                dataShow[prop] = tween.start;
                if (hidden) {
                    tween.end = tween.start;
                    tween.start = prop === 'width' || prop === 'height' ? 1 : 0;
                }
            }
        }

        // If this is a noop like .hide().hide(), restore an overwritten display value
    } else if ((display === 'none' ? defaultDisplay(elem.nodeName) : display) === 'inline') {
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

            // We're done with this property
            return tween;
        }
    }
}


function propFilter(props, specialEasing) {

    var index, name, easing, value, hooks;

    for (index in props) {

        name = hAzzle.camelize(index);

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

        hooks = hAzzle.cssHooks[name];
        if (hooks && 'expand' in hooks) {
            value = hooks.expand(value);
            delete props[name];

            for (index in value) {
                if (!(index in props)) {
                    props[index] = value[index];
                    specialEasing[index] = easing;
                }
            }
        } else {
            specialEasing[name] = easing;
        }
    }
}

function Animation(elem, properties, options) {
    var result,
        stopped,
        index = 0,
        length = animationPrefilters.length,
        deferred = hAzzle.Promises().always(function() {
            // Don't match elem in the :animated selector
            delete tick.elem;
        }),
        tick = function() {
            if (stopped) {
                return false;
            }
            var currentTime = hAzzle.now(),
                remaining = Math.max(0, animation.startTime + animation.duration - currentTime),
                // Support: Android 2.3
                // Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
                temp = remaining / animation.duration || 0,
                percent = 1 - temp,
                index = 0,
                length = animation.tweens.length;

            for (; index < length; index++) {
                animation.tweens[index].run(percent);
            }

            deferred.notifyWith(elem, [animation, percent, remaining]);

            if (percent < 1 && length) {
                return remaining;
            } else {
                deferred.resolveWith(elem, [animation]);
                return false;
            }
        },
        animation = deferred.promise({
            elem: elem,
            props: hAzzle.shallowCopy({}, properties),
            opts: hAzzle.shallowCopy(true, {
                specialEasing: {}
            }, options),
            originalProperties: properties,
            originalOptions: options,
            startTime: hAzzle.now(),
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

                // Resolve when we played the last frame; otherwise, reject
                if (gotoEnd) {
                    deferred.resolveWith(elem, [animation, gotoEnd]);
                } else {
                    deferred.rejectWith(elem, [animation, gotoEnd]);
                }
                return this;
            }
        }),
        props = animation.props;

    propFilter(props, animation.opts.specialEasing);

    for (; index < length; index++) {
        result = animationPrefilters[index].call(animation, elem, props, animation.opts);
        if (result) {
            return result;
        }
    }

    hAzzle.map(props, createTween, animation);

    if (hAzzle.isFunction(animation.opts.start)) {
        animation.opts.start.call(elem, animation);
    }

    var XXX = hAzzle.shallowCopy(tick, {
        elem: elem,
        anim: animation,
        queue: animation.opts.queue
    });

    hAzzle.timers.push(XXX);



    if (XXX()) {

        runAnimation();

    } else {
        hAzzle.timers.pop();
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
}

Animation.prefilter = function(callback, prepend) {
    if (prepend) {
        animationPrefilters.unshift(callback);
    } else {
        animationPrefilters.push(callback);
    }
}