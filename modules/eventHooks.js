/**
 * Collection of hAzzle eventHooks
 *
 * NOTE!! I will improve this hooks later on
 *
 * eventHooks are splitted into two groups
 *
 * - simulation
 * - special event types
 * - delegateType
 *
 * For event types:
 * ----------------
 *
 *  eventHook [ { OLD EVENT TYPE NAME } ] = {
 *
 *   name: { { NEW EVENT TYPE NAME } }
 *   handler: { { EVENT HANDLER }  }
 *  }
 *
 * Simulation:
 * ------------
 *
 *  eventHook [ { EVENT TYPE NAME } ] = {
 *
 *   simulate: { { YOUR FUNCTION HERE } }
 *
 *  }
 *
 * Delegated type:
 * ---------------
 *
 *  eventHook [ { OLD EVENT TYPE NAME } ] = {
 *   delegateType: { { NEW EVENT TYPE NAME } }
 *  }
 *
 *
 * 'delegateType' are used within event delegation. Say
 * you want mouseenter to work,
 * you then change mouseenter tobecome mouseover with
 * the eventHook
 *
 */

// Mehran!! You can use forOwn() function here now

/**
 *
 * Note!!
 *
 * Ugly code. Temporary until I get
 * the hAzzle.each() fixed
 *
 */

hAzzle.forOwn({
  'pointerenter': 'pointerover',
  'pointerleave': 'pointerout',
  'mouseenter': 'mouseover',
  'mouseleave': 'mouseout',
}, function (a, b) {

  hAzzle.eventHooks[a] = {

    specalEvents: {
      name: b,
      handler: function (event) {

        var related = event.relatedTarget,
          target = this;
        return !related ? related === null : (related !== target && !hAzzle.contains(related, target));
      }
    }
  };
});



hAzzle.eventHooks.focus = {
  delegateType: 'focusIn'
};
hAzzle.eventHooks.mouseenter = {
  delegateType: 'mouseover'
};
hAzzle.eventHooks.blur = {
  delegateType: 'focusout'
};

var win = this,
  hAzzle = win.hAzzle,
  browserInfo = hAzzle.browser(),
  push = Array.prototype.push,
  slice = Array.prototype.slice,
  needsFocusShim = (browserInfo.browser === 'firefox' ||
    (browserInfo.browser === 'opera' && browserInfo.mobile));

if (needsFocusShim) {

  //if (!hAzzle.features.focusinBubbles) {
  var yy,
    focio = {
      'focusin': 'focus',
      'focusout': 'blur',
    };
  var simulate = function (el, type) {

    var elfocus,
      key,
      focusEventType = (type === 'focusin') ? 'focus' : 'blur',
      focusables = (function (el) {

        var focusables = hAzzle(el).find('input'),
          selects = hAzzle(el).find('select');

        if (selects.length) {
          push.apply(focusables, selects);
        }

        return focusables;
      })(el),
      cback = (function (type, focusEventType) {
        return function () {
          if ((focusEventType === 'focus' && this === document.activeElement) || focusEventType === 'blur') {
            hAzzle(this).trigger(type);
          }
        };
      })(type, focusEventType),

      i = -1,

      length = focusables.length;

    key = '__' + focusEventType + 'Handled__';

    while (++i < length) {

      elfocus = focusables[i];

      if (!elfocus.hasOwnProperty(key) || !elfocus[key]) {

        elfocus[key] = true;

        elfocus.addEventListener(focusEventType, cback, true);

      }
    }
  };
  var hookFunction = function () {};

  for (yy in focio) {

    hAzzle.eventHooks[yy] = {

      simulate: simulate
    };
  }
}