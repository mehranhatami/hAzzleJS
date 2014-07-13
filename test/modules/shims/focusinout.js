var win = this,
  hAzzle = win.hAzzle,
  push = Array.prototype.push,
  browserInfo = hAzzle.browser(),
  needsFocusShim = (browserInfo.browser == 'firefox' ||
    (browserInfo.browser == 'opera' && browserInfo.mobile));

if (needsFocusShim) {

  //if (!hAzzle.features.focusinBubbles) {
  var yy,
    focio = {
      'focusin': 'focus',
      'focusout': 'blur',
    };
  for (yy in focio) {

    hAzzle.eventHooks[yy] = {

      simulate: function (el, type) {

        var elfocus,
          key,
          focusEventType = (type == 'focusin') ? 'focus' : 'blur',
          focusables = (function (el) {

            var focusables = slice.call(el.getElementsByTagName('input')),
              selects = slice.call(el.getElementsByTagName('select'));

            if (selects.length) {
              push.apply(focusables, selects);
            }

            return focusables;
          })(el),
          cback = (function (type, focusEventType) {
            return function () {
              if ((focusEventType === 'focus' && this === document.activeElement) || focusEventType === 'blur') {
                //if (this === document.activeElement) {
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
      }
    }
  }
}