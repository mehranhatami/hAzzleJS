// fx.js
var moved,
    colarr = ('backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color ' +
        'columnRuleColor outlineColor textDecorationColor textEmphasisColor').split(' '),
    rip;

function Tween(elem, to, options) {

    if (!(this instanceof Tween)) {
        return new Tween.prototype.init(elem, to, options);
    }

    return new Tween.prototype.init(elem, to, options);
}

Tween.prototype = {

    constructor: Tween,

    init: function(elem, to, options) {

        length = hAzzle.dictionary.length;

        var self = hAzzle.private(elem, 'fxDta', hAzzle.dictionary[length++] = this),
            tweens = [];

        this.runner = function(force) {

            var key, i = 0;
		   
            self.elem = elem;
            self.complete = options.callback;
            self.completeParams = options.callbackParams;

            if (force === true) {

                self.transitions = [];
                return;
            }

            self.easing = options.easing || hAzzle.defaultEasing;

            // Duration '0' will likely never happen, it will see it as false,
            // and set 'hAzzle.defaultDuration'

            self.duration = options.duration ?
                (hAzzle.speeds[options.duration] || options.duration) :
                hAzzle.defaultDuration;


            // Allways visible???

            //            style.visibility = "visible";

            if ((hAzzle.isFirefox || hAzzle.ie) && to.borderColor) {

                to.borderTopColor = to.borderRightColor = to.borderBottomColor = to.borderLeftColor = to.borderColor;
                delete to.borderColor;
            }

            for (key in to) {

                if (!to.hasOwnProperty(key)) continue;

                tweens[i++] = self[key === "backgroundPosition" ? 'bgPosition' : 'animate'](elem, key, to[key]);
            }

            self.transitions = tweens;

            if (!hAzzle.isRunning) {

                ticker();
            }
        };

        if (options.duration === 0) {

            this.runner(true);
            this.stop();
            return;
        }

        if (!options.delay) {

            this.runner();

        } else {

            this.delayed = setTimeout(this.runner, options.delay);
        }
    },

    cycle: function() {

        var trans = this.transitions;

        if (!trans) {

            return true;

        }

        rip = trans.length;
        moved = false;

        while (rip--) {

            if (trans[rip]()) {

                moved = true;

            }
        }

        return moved;
    },

    update: function(elem, prop, tick) {

        var hooks = hAzzle.fxHook[prop];

        if (hooks && hooks.set) {

            hooks.set(elem, prop, tick);

        } else {

            hAzzle.fxHook._default.set(elem, prop, tick);
        }
    },

    // Each animation runs through this function

    animate: function(elem, prop, end) {

        var passed = true,

            // Check for fxHook, and fallback to _default if no hook
            // exist

            hooks = hAzzle.fxHook[prop],
            start = hooks && hooks.get ?
            hooks.get(elem, prop, end) :
            hAzzle.fxHook._default.get(elem, prop, end),
            startTime = pnow(),
            now = start,
            pos = 0,
            self = this,
            remaining,
            percent,
            state = 0;

        // Color animation

        if (hAzzle.inArray(colarr, prop) !== -1) {
            return this.color(elem, prop, start, end);
        }

        function trans() {

            var n, t = pnow();

            if (t >= self.duration + startTime) {

                now = end;
                pos = state = 1;

                Tween.prototype.update(elem, prop, now);
                return false;

            } else {

                remaining = Math.max(0, startTime + self.duration - t);
                percent = 1 - (remaining / self.duration || 0),

                    n = t - startTime;

                state = n / self.duration;

                // Perform the easing function, defaults to swing
                //	pos = hAzzle.easing['flicker']( state );
                pos = hAzzle.easing['flicker'](percent, self.duration * percent, 0, 1, self.duration);

                //	console.log(start)

                now = start + ((end - start) * pos);

                self.update(elem, prop, now);
            }

            return true;
        }

        function cancelled() {
            return false;
        }

        if (passed) {

            trans.stored = [prop, end];
            return trans;

        } else {

            cancelled.stored = [prop, end];
            return cancelled;
        }
    },

    // color transitions

    color: function(elem, prop, tick, value) {

        var startTime = pnow(),
            style = elem.style,
            passed = false,
            self = this,
            timed = 0,
            i = -1,
            now,

            start = hAzzle.parseColor(hAzzle.fxHook._default.get(elem, prop)),
            end = hAzzle.parseColor(value);


        while (++i < 3) {

            if (start[i] !== end[i]) {

                passed = true;
            }
        }

        function trans() {

            now = pnow();
            timed += now - startTime;
            startTime = now;

            tick = hAzzle.easing['mirror'](timed / self.duration);

            if (tick < 0.99) {

                style[prop] = hAzzle.calculateColor(start, end, tick);
                return true;

            } else {

                style[prop] = value;
                return false;
            }
        }

        function cancelled() {
            return false;
        }

        if (passed) {
            trans.stored = [prop, value];
            return trans;

        } else {
            cancelled.stored = [prop, value];
            return cancelled;

        }

    },

    // animates bgPosition
    bgPosition: function(elem, prop, value, duration, ease) {

        var style = elem.style,
            val = style[prop],
            then = pnow(),
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

        tick = (val !== "") ? val.split(" ") : getStyles(elem).backgroundPosition.split(" ");

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

            now = pnow();
            timed += now - then;
            then = now;

            tick = hAzzle.easing[ease](timed / duration);

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
    },

    // stops JS animations
    stop: function(JumpToEnd, callback, popped) {

        var element = this.elem;

        if (!element) {

            clearTimeout(this.delayed);

            this.runner(true);
            this.stop(JumpToEnd, callback);

            return;
        }

        // Bug! Need to be sorted soon, Kenny!
        //hAzzle.removePrivate(elem, 'fxDta');

        if (JumpToEnd) {

            var group = this.transitions,
                i = group.length,
                ar, prop;

            while (i--) {

                ar = group[i].stored;


                prop = ar[0];

                // Temporary - will be fixed soon !!

                hAzzle.style(element, prop, ar[1]);
            }
        }

        if (callback) {

            callback = this.complete;
        }

        if (!popped) {

            popTween(this, element, callback, this.completeParams);

        }
    }
};


Tween.prototype.init.prototype = Tween.prototype;

// Removes the tween from memory when finished

function popTween(self, element, callback, params) {
    hAzzle.dictionary.splice(hAzzle.dictionary.indexOf(self), 1);
    length = hAzzle.dictionary.length;
    if (callback) {
        callback(element, params);
    }
}