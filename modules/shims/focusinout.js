var win = this,
  hAzzle = win.hAzzle,
  push = Array.prototype.push,
  focusinoutRegEx = /^(?:focusin|focusout)$/,
  browserInfo = hAzzle.browser(),
  addRootListener = hAzzle.Events.addRootListener,
  needsFocusShim = (browserInfo.browser == 'firefox' ||
    (browserInfo.browser == 'opera' && browserInfo.mobile));

if (needsFocusShim) {

  hAzzle.extend({
    addRootListener: function (el, entry) {

      if (focusinoutRegEx.test(entry.type)) {

        //focusin, focusout
        entry.focusEventType = (entry.type == 'focusin') ? 'focus' : 'blur';

        this.observeFocusinout(el, entry);

      }

      addRootListener(el, entry);
    },
    getFocusables: function (el /*, entry*/ ) {
      var focusables = hAzzle(el).find('input'),
        selects = hAzzle(el).find('select');

      if (selects.length) {
        push.apply(focusables, selects);
      }

      return focusables;
    },

    observeFocusinout: function (el, entry) {
      var browserInfo = hAzzle.browser();
      if (focusinoutRegEx.test(entry.type)) {}

      var focusables = this.getFocusables(el, entry),
        elfocus,

        cback = (function (entry) {
          return function () {
            hAzzle(this).trigger(entry.type);
          };
        })(entry),

        i = -1,

        length = focusables.length;

      var key = '__' + entry.focusEventType + 'Handled__';

      while (++i < length) {

        elfocus = focusables[i];

        if (!elfocus.hasOwnProperty(key) || !elfocus[key]) {

          elfocus[key] = true;

          elfocus.addEventListener(entry.focusEventType, cback, true);

        }
      }
    }
  }, hAzzle.Events);
}


hAzzle.extend({
  eventHooks: {
     focusinout: function ( evt, original ) {
      //in terms of props these events don't have any specific property
      //BUT in Firefox we have to provide all the valid props


      /*
          target: event target receiving focus
          type: The type of event
          bubbles: Does the event normally bubble?
          cancelable: Is it possible to cancel the event?
          relatedTarget: event target losing focus (if any).
      */

      original.target = evt.target;
      original.type = evt.type;
      original.bubbles = evt.bubbles;
      original.cancelable = evt.cancelable;

      //TODO mehran: find a way to set the relatedTarget
      //original.relatedTarget = evt.relatedTarget;

      return commonProps;

    }
  }
}, hAzzle);