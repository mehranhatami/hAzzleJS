/**
 * Mehran animation engine
 */
var win = this,
  // Deal with foreign domains
  // Accessing .name will throw SecurityError within a foreign domain.

  foreign = win.top.name ? win.top : win,
  perf = foreign.performance,
  perfNow = perf.now || perf.webkitNow || perf.msNow || perf.mozNow,
  now = perfNow ? function () {
    return perfNow.call(perf);
  } : function () {
    return hAzzle.now();
  },
  lastTime = 0,
  polyfill = function (callback) {
    var currTime = new Date().getTime(),
      timeToCall = Math.max(0, 16 - (currTime - lastTime)),
      id = win.setTimeout(function () {
          callback(currTime + timeToCall);
        },
        timeToCall);
    lastTime = currTime + timeToCall;
    return id; // return the id for cancellation capabilities
  },

  // Checks for iOS6 will only be done if no native frame support

  ios6 = /iP(ad|hone|od).*OS 6/.test(win.navigator.userAgent),

  // Feature detection

  reqframe = function () {
    // native animation frames
    // http://webstuff.nfshost.com/anim-timing/Overview.html
    // http://dev.chromium.org/developers/design-documents/requestanimationframe-implementation

    return foreign.requestAnimationFrame ||
      // no native rAF support
      (ios6 ? // iOS6 is buggy
        foreign.requestAnimationFrame ||
        foreign.webkitRequestAnimationFrame || // Chrome <= 23, Safari <= 6.1, Blackberry 10
        foreign.mozRequestAnimationFrame ||
        foreign.msRequestAnimationFrame :
        // IE <= 9, Android <= 4.3, very old/rare browsers
        polyfill);
  }().bind(win),

  cancelframe = function () {
    return foreign.cancelAnimationFrame ||
      // no native cAF support
      (!ios6 ? foreign.cancelAnimationFrame ||
        foreign.webkitCancelAnimationFrame ||
        foreign.webkitCancelRequestAnimationFrame ||
        foreign.mozCancelAnimationFrame :
        function (id) {
          clearTimeout(id);
        });
  }().bind(win),

  fxCore = {

    version: '0.0.1a',

    has: {

      // Check for foreign domain       

      'foreign-domain': foreign ? false : true,

      // Detect if the browser supports native rAF

      'native-rAF': (foreign.requestAnimationFrame && (foreign.cancelAnimationFrame ||
        foreign.cancelRequestAnimationFrame)) ? true : false,

      // Detect if performance.now() are supported

      'perfNow': perfNow,
    },

  };

/* =========================== GLOBAL FUNCTIONS ========================== */

// requestAnimationFrame
// prop: Mehran Hatami

hAzzle.requestFrame = function (callback) {

  var rafCallback = (function (callback) {
    // Wrap the given callback to pass in performance timestamp   
    return function (tick) {
      // feature-detect if rAF and now() are of the same scale (epoch or high-res),
      // if not, we have to do a timestamp fix on each frame
      if (tick > 1e12 != hAzzle.now() > 1e12) {
        tick = now();
      }
      callback(tick);
    };
  })(callback);
  // Call original rAF with wrapped callback
  return reqframe(rafCallback);
};
// cancelAnimationFrame

hAzzle.cancelFrame = cancelframe;

// Detect if native rAF or not

hAzzle.nativeRAF = fxCore.has['native-rAF'];

// Foreign domain detection

hAzzle.foreignDomain = fxCore.has['foreign-domain'];

// performance.now()

hAzzle.pnow = now;

/* =========================== ANIMATION ENGINE ========================== */
//performance.now
// fxCore.fx

// TOMPORARY TRAVIS FIX

var fx = fxCore.fx = function (elem, options, duration, callback) {
/*  this.elem = elem;
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
    hAzzle.cancelFrame(this.rafId);
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
  draw: function (tick) {

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

      hAzzle.style(obj.elem, obj.prop, tick + 'px');

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
  });*/
};
