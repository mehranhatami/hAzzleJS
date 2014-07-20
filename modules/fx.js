/**
 * Animation engine
 *
 * FX development by: Mehran Hatami
 *
 *
 */

var fx = hAzzle.fx = function (elem, options, duration, callback) {
    this.elem = elem;
    this.options = options;
    this.duration = duration || 400;
    this.callback = callback;
};

fx.prototype = {
    started: false,

    rafId: null,
    animObjects: [],
    start: function start() {
        this.beforeStart();
        this.animate();
    },

    stop: function stop() {
        if (hAzzle.isFunction(this.callback)) {
            this.callback();
        }
        this.stopped = true;
       window.cancelAnimationFrame(this.rafId);
        this.rafId = null;
    },

    animate: function animate() {
        if (!this.stopped) {
            this.rafId = hAzzle.requestFrame(this.animate.bind(this));
            this.draw();
        }
    },
    beforeStart: function () {
        var i = 0,
            props = Object.keys(this.options),
            l = props.length,
            prop,
            elem = this.elem,
            style = this.elem.style,
            val;

        this.startTime = now();

        for (; i < l; i++) {
            prop = props[i];
            val = this.options[prop];

            if (style[prop] !== undefined) {

                var obj = {
                    elem: this.elem,
                    prop: prop,
                    options: this.options,
                    start: parseInt(hAzzle.css(elem, prop), 10),
                    end: parseInt(val, 10)
                };

                obj.now = obj.start;

                this.animObjects.push(obj);
            }

        }
    },
    draw: function () {

        var i = 0,
            l = this.animObjects.length,
            obj;

        var left = this.startTime + this.duration - now(),
            percent = ((left <= 0 ? 0 : left) / this.duration) || 0;

        if (this.stopped) {
            return false;
        }

        for (; i < l; i++) {
            obj = this.animObjects[i];

            obj.position = 1 - percent;

            obj.now = ((obj.end - obj.start) * obj.position) + obj.start;

            hAzzle.style(obj.elem, obj.prop, obj.now + 'px');

            if (obj.position === 1) {
                this.stop();
            }
        }
    }
};


// animation function

hAzzle.Core.animate = function (options, duration, callback) {
    this.each(function (el) {
        var fx = new hAzzle.fx(el, options, duration, callback);
        fx.start();
    });
};