
var now = hAzzle.pnow;

var fx = function (elem, options, duration, callback) {
  this.elem = elem;
  this.options = options;
  this.duration = duration || 400;
  this.callback = callback;
};

fx.prototype = {
  started: false,

  rafId: null,
  animObjects: [],

  start: function () {

    this.setup();

    var tick = (function (thisArg) {
      return function (tk) {
        thisArg.draw(tk);
      };
    }(this));

    var raf = (function (thisArg) {
      return function raf(tk) {
        if (thisArg.rafId) {
          hAzzle.requestFrame(raf);
          tick(tk);
        }
      };
    }(this));

    if (!this.rafId) {

      this.rafId = hAzzle.requestFrame(raf)
    }
  },

  stop: function () {
    if (hAzzle.isFunction(this.callback)) {
      try {

        this.callback();

      } catch (ignored) {}
    }

    this.stopped = true;

//    if (window.cancelAnimationFrame) {
      window.cancelAnimationFrame(this.rafId);
  //  } else {
    //  clearInterval(this.rafId);
//    }

    this.rafId = null;
  },

  setup: function () {
    var i = 0,
      props = Object.keys(this.options),
      l = props.length,
      prop,
      elem = this.elem,
      style = this.elem.style,
      val;

    this.startTime = /*animNow || */now();

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
  draw: function (tick) {
    console.log(tick);

    var i = 0,
      l = this.animObjects.length,
      obj;

    var left = this.startTime + this.duration - ( /*animNow || */ now()),
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

hAzzle.fx = fx;

// animation function

hAzzle.Core.animate = function (options, duration, callback) {
  this.each(function (el) {
    var fx = new hAzzle.fx(el, options, duration, callback);
    fx.start();
  });
};